from datetime import time
from typing import List, Tuple
from uuid import UUID

from ortools.sat.python import cp_model

import core_api.domain.shift as shift_domain
import core_api.schemas.schedule as schemas


def _time_to_min(t: time) -> int:
    return t.hour * 60 + t.minute


class ScheduleGenerator:
    def __init__(
        self,
        *,
        shift_ids: List[UUID],
        employee_ids: List[UUID],
        employee_names: List[str],
        employee_weekly_workload_hours: List[int | None] | None = None,
        employee_preferred_weekdays: List[List[int]] | None = None,
        shift_vector: List[shift_domain.Shift],
        availability_matrix: List[List[bool]],
    ):

        self.shift_ids = shift_ids
        self.employee_ids = employee_ids
        self.employee_names = employee_names
        if employee_weekly_workload_hours is None:
            employee_weekly_workload_hours = [None] * len(self.employee_ids)
        if len(employee_weekly_workload_hours) != len(self.employee_ids):
            raise ValueError(
                "employee_weekly_workload_hours must match employee_ids length"
            )
        self.employee_weekly_workload_hours = employee_weekly_workload_hours
        if employee_preferred_weekdays is None:
            employee_preferred_weekdays = [[] for _ in self.employee_ids]
        if len(employee_preferred_weekdays) != len(self.employee_ids):
            raise ValueError(
                "employee_preferred_weekdays must match employee_ids length"
            )
        self.employee_preferred_weekdays = employee_preferred_weekdays
        self.employee_preferred_weekday_sets = [
            set(preferred_weekdays)
            for preferred_weekdays in self.employee_preferred_weekdays
        ]
        self.shift_vector = shift_vector
        self.availability_matrix = availability_matrix

        self.num_shifts = len(self.shift_vector)
        self.num_employees = len(self.employee_ids)

        self.weekday = [s.weekday for s in self.shift_vector]
        self.start_time_minutes = [
            _time_to_min(s.start_time) for s in self.shift_vector
        ]
        self.end_time_minutes = [_time_to_min(s.end_time) for s in self.shift_vector]
        self.shift_duration_min = [
            max(0, self.end_time_minutes[i] - self.start_time_minutes[i])
            for i in range(self.num_shifts)
        ]
        self.demand = [s.min_staff for s in self.shift_vector]

        self.min_start = min(self.start_time_minutes)
        self.max_start = max(self.start_time_minutes)

        self.shifts_indices_by_day = {
            d: [i for i in range(self.num_shifts) if self.weekday[i] == d]
            for d in range(7)
        }
        self.num_search_workers = 8

    @classmethod
    def from_payload(
        cls,
        *,
        payload: schemas.ScheduleGenerationDispatchPayload,
    ):
        shift_vector = [
            shift_domain.Shift(**shift.model_dump())
            for shift in payload.shift_vector
        ]
        employee_ids = [employee.id for employee in payload.employees]
        employee_names = [employee.name for employee in payload.employees]
        return cls(
            shift_ids=cls._get_shift_ids(shift_vector=shift_vector),
            employee_ids=employee_ids,
            employee_names=employee_names,
            employee_weekly_workload_hours=[
                employee.weekly_workload_hours for employee in payload.employees
            ],
            employee_preferred_weekdays=[
                employee.preferred_weekdays for employee in payload.employees
            ],
            shift_vector=shift_vector,
            availability_matrix=cls._build_availability_matrix_from_payload(
                shift_vector=shift_vector,
                employee_ids=employee_ids,
                availabilities=payload.availabilities,
            ),
        )

    @classmethod
    def _get_shift_ids(cls, shift_vector: List[shift_domain.Shift]) -> List[UUID]:
        shift_ids = []
        for shift in shift_vector:
            shift_ids.append(shift.id)
        return shift_ids

    @classmethod
    def _build_availability_matrix_from_payload(
        cls,
        *,
        shift_vector: List[shift_domain.Shift],
        employee_ids: List[UUID],
        availabilities: List[schemas.ScheduleGenerationAvailabilityOut],
    ) -> List[List[bool]]:
        availability_matrix = [
            [False] * len(shift_vector) for _ in range(len(employee_ids))
        ]
        availabilities_by_employee = {}
        for availability in availabilities:
            availabilities_by_employee.setdefault(availability.employee_id, []).append(
                availability
            )

        for i, shift in enumerate(shift_vector):
            for j, employee_id in enumerate(employee_ids):
                for availability in availabilities_by_employee.get(employee_id, []):
                    if (
                        availability.weekday == shift.weekday
                        and availability.start_time <= shift.start_time
                        and availability.end_time >= shift.end_time
                    ):
                        availability_matrix[j][i] = True
                        break
        return availability_matrix

    def _check_overlapping(self, t1: int, t2: int) -> bool:
        if self.weekday[t1] != self.weekday[t2]:
            return False
        return (
            self.end_time_minutes[t1] > self.start_time_minutes[t2]
            and self.end_time_minutes[t2] > self.start_time_minutes[t1]
        ) or (
            self.end_time_minutes[t2] > self.start_time_minutes[t1]
            and self.end_time_minutes[t1] > self.start_time_minutes[t2]
        )

    def _build_target_workload_minutes(self, total_minutes: int) -> List[int]:
        if self.num_employees == 0:
            return []

        if all(
            workload_hours is None
            for workload_hours in self.employee_weekly_workload_hours
        ):
            average_target = total_minutes // self.num_employees
            return [average_target] * self.num_employees

        target_minutes: List[int | None] = [
            workload_hours * 60 if workload_hours is not None else None
            for workload_hours in self.employee_weekly_workload_hours
        ]
        employees_without_target = [
            index for index, target in enumerate(target_minutes) if target is None
        ]

        if not employees_without_target:
            return [int(target) for target in target_minutes]

        defined_total = sum(
            int(target) for target in target_minutes if target is not None
        )
        remaining_minutes = max(total_minutes - defined_total, 0)
        fallback_target, remainder = divmod(
            remaining_minutes, len(employees_without_target)
        )
        for offset, employee_index in enumerate(employees_without_target):
            target_minutes[employee_index] = fallback_target + (
                1 if offset < remainder else 0
            )

        return [int(target) for target in target_minutes]

    def _build_feasibility_model(
        self,
    ) -> Tuple[cp_model.CpModel, List[List[cp_model.IntVar]]]:
        model = cp_model.CpModel()
        x = [
            [model.NewBoolVar(f"x[{e},{t}]") for t in range(self.num_shifts)]
            for e in range(self.num_employees)
        ]

        for e in range(self.num_employees):
            for t in range(self.num_shifts):
                if not self.availability_matrix[e][t]:
                    model.Add(x[e][t] == 0)

        for t1 in range(self.num_shifts):
            for t2 in range(t1 + 1, self.num_shifts):
                if self._check_overlapping(t1, t2):
                    for e in range(self.num_employees):
                        model.Add(x[e][t1] + x[e][t2] <= 1)

        return model, x

    def check_possibility(self) -> bool:
        if self.num_shifts == 0:
            return True

        if self.num_employees == 0:
            return False

        has_any_availability = any(any(row) for row in self.availability_matrix)
        if not has_any_availability:
            return False

        model, _x = self._build_feasibility_model()

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 15.0
        solver.parameters.num_search_workers = self.num_search_workers
        solver.parameters.stop_after_first_solution = True

        status = solver.Solve(model)
        return status in (cp_model.OPTIMAL, cp_model.FEASIBLE)

    def generate_schedule(self) -> schemas.PreviewScheduleOut:
        if self.num_shifts == 0:
            return schemas.PreviewScheduleOut(shifts=[])

        model, x = self._build_feasibility_model()
        max_working_time = sum(self.shift_duration_min)
        max_deviation_from_required_staff = max(self.num_employees, max(self.demand))

        deviation_from_required_staff = {}
        deviation1 = {}
        deviation2 = {}
        for t in range(self.num_shifts):
            deviation_from_required_staff[t] = model.NewIntVar(0, max_deviation_from_required_staff,
                                                               f"deviation_from_required_staff[{t}]")
            deviation1[t] = model.NewIntVar(0, max_deviation_from_required_staff, f"deviation1[{t}]")
            deviation2[t] = model.NewIntVar(0, max_deviation_from_required_staff, f"deviation2[{t}]")
            model.Add(sum(x[e][t] for e in range(self.num_employees)) - self.demand[t] == deviation1[t] - deviation2[t])
            model.Add(deviation_from_required_staff[t] == deviation1[t] + deviation2[t])

        # Step 1: minimize deviation from required staffing.
        model.Minimize(sum(deviation_from_required_staff.values()))
        solver0 = cp_model.CpSolver()
        solver0.parameters.max_time_in_seconds = 20.0
        solver0.parameters.num_search_workers = self.num_search_workers
        status0 = solver0.Solve(model)

        if status0 in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            best0_int = sum(int(solver0.Value(v)) for v in deviation_from_required_staff.values())
            if deviation_from_required_staff:
                model.Add(sum(deviation_from_required_staff.values()) <= best0_int)
        else:
            print(
                "\033[91mWARNING:\033[0mNo feasible solution found for step 0. Status: ", solver0.StatusName()
            )

        H = {
            e: model.NewIntVar(0, max_working_time, f"H[{e}]")
            for e in range(self.num_employees)
        }
        for e in range(self.num_employees):
            model.Add(
                H[e]
                == sum(
                    self.shift_duration_min[t] * x[e][t] for t in range(self.num_shifts)
                )
            )

        total_minutes = sum(
            self.shift_duration_min[t] * int(self.demand[t])
            for t in range(self.num_shifts)
        )
        target_minutes_by_employee = self._build_target_workload_minutes(
            total_minutes
        )
        max_target_minutes = max(target_minutes_by_employee, default=0)
        max_workload_deviation = max(max_working_time, max_target_minutes)

        devp = {}
        devm = {}
        dev = {}
        for e in range(self.num_employees):
            devp[e] = model.NewIntVar(0, max_workload_deviation, f"devp[{e}]")
            devm[e] = model.NewIntVar(0, max_workload_deviation, f"devm[{e}]")
            model.Add(H[e] - target_minutes_by_employee[e] == devp[e] - devm[e])
            dev[e] = model.NewIntVar(0, max_workload_deviation, f"dev[{e}]")
            model.Add(dev[e] == devp[e] + devm[e])

        for e in range(self.num_employees):
            for t in range(self.num_shifts):
                model.AddHint(x[e][t], solver0.Value(x[e][t]))

        # Step 2: minimize deviation from employee workload targets.
        model.Minimize(sum(dev.values()))
        solver1 = cp_model.CpSolver()
        solver1.parameters.max_time_in_seconds = 20.0
        solver1.parameters.num_search_workers = self.num_search_workers
        status1 = solver1.Solve(model)
        if status1 not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print(
                "\033[91mWARNING:\033[0mNo feasible solution found for step 1. Status: ", solver1.StatusName()
            )
            chosen_after_1 = solver0
        else:
            chosen_after_1 = solver1
            best_fairness = chosen_after_1.ObjectiveValue()
            fairness_tol = 0.05
            model.Add(sum(dev.values()) <= int((1.0 + fairness_tol) * best_fairness))

        non_preferred_terms = []
        for e in range(self.num_employees):
            preferred_weekdays = self.employee_preferred_weekday_sets[e]
            if not preferred_weekdays:
                continue
            for t in range(self.num_shifts):
                if self.weekday[t] not in preferred_weekdays:
                    non_preferred_terms.append(x[e][t])

        # Step 3: minimize assignments on non-preferred weekdays.
        if non_preferred_terms:
            model.ClearHints()
            for e in range(self.num_employees):
                for t in range(self.num_shifts):
                    model.AddHint(x[e][t], chosen_after_1.Value(x[e][t]))

            preference_objective = sum(non_preferred_terms)
            model.Minimize(preference_objective)

            solver2 = cp_model.CpSolver()
            solver2.parameters.max_time_in_seconds = 15.0
            solver2.parameters.num_search_workers = self.num_search_workers
            status2 = solver2.Solve(model)
            if status2 not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
                print(
                    "\033[91mWARNING:\033[0mNo feasible solution found for "
                    "step 2. Status: ",
                    solver2.StatusName(),
                )
                chosen_after_2 = chosen_after_1
            else:
                chosen_after_2 = solver2
                best_preference = sum(
                    int(chosen_after_2.Value(term)) for term in non_preferred_terms
                )
                model.Add(preference_objective <= best_preference)
        else:
            chosen_after_2 = chosen_after_1

        over_vars = []
        for e in range(self.num_employees):
            for d in range(7):
                day_shift_indices = self.shifts_indices_by_day[d]
                if not day_shift_indices:
                    continue
                max_day_slots = len(day_shift_indices)

                num_shifts_in_day = model.NewIntVar(
                    0, max_day_slots, f"num_shifts_in_day[{e},{d}]"
                )
                model.Add(num_shifts_in_day == sum(x[e][t] for t in day_shift_indices))

                over = model.NewIntVar(0, max_day_slots, f"over[{e},{d}]")
                model.Add(over >= num_shifts_in_day - 1)
                over_vars.append(over)

        # Step 4: minimize multiple shifts for the same employee in one day.
        model.ClearHints()
        for e in range(self.num_employees):
            for t in range(self.num_shifts):
                model.AddHint(x[e][t], chosen_after_2.Value(x[e][t]))

        obj_over = sum(over_vars) if over_vars else 0
        model.Minimize(obj_over)

        solver3 = cp_model.CpSolver()
        solver3.parameters.max_time_in_seconds = 15.0
        solver3.parameters.num_search_workers = self.num_search_workers
        status3 = solver3.Solve(model)
        if status3 not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print(
                "\033[91mWARNING:\033[0mNo feasible solution found for "
                "step 3. Status: ",
                solver3.StatusName(),
            )
            chosen_after_3 = chosen_after_2
        else:
            chosen_after_3 = solver3

        schedule_shifts_out: List[schemas.PreviewScheduleShiftOut] = []
        for t in range(self.num_shifts):
            employees_out: List[schemas.ScheduleShiftEmployeeOut] = []
            for e in range(self.num_employees):
                if chosen_after_3.Value(x[e][t]) == 1:
                    employees_out.append(
                        schemas.ScheduleShiftEmployeeOut(
                            employee_id=self.employee_ids[e],
                            name=self.employee_names[e],
                        )
                    )
            s = self.shift_vector[t]
            schedule_shifts_out.append(
                schemas.PreviewScheduleShiftOut(
                    weekday=s.weekday,
                    start_time=s.start_time,
                    end_time=s.end_time,
                    min_staff=s.min_staff,
                    employees=employees_out,
                )
            )

        return schemas.PreviewScheduleOut(shifts=schedule_shifts_out)

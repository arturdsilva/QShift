from collections import defaultdict
import math
import uuid
from datetime import time
from sched import scheduler
from typing import List, Tuple

import pytest

from app.services.schedule import ScheduleGenerator
from app.domain import shift as shift_domain
import app.schemas.schedule as schemas


# -----------------------------
# Helpers
# -----------------------------


def _t(h: int, m: int = 0) -> time:
    return time(hour=h, minute=m)


def _overlap(s1: shift_domain.Shift, s2: shift_domain.Shift) -> bool:
    """Return True if two domain.Shift overlap in time and weekday."""
    if s1.weekday != s2.weekday:
        return False
    start1 = s1.start_time.hour * 60 + s1.start_time.minute
    end1 = s1.end_time.hour * 60 + s1.end_time.minute
    start2 = s2.start_time.hour * 60 + s2.start_time.minute
    end2 = s2.end_time.hour * 60 + s2.end_time.minute
    return not (end1 <= start2 or end2 <= start1)


def _render_ascii_table(headers: List[str], rows: List[List[str]]) -> None:
    """Render a simple ASCII table given headers and rows."""
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            col_widths[i] = max(col_widths[i], len(cell))

    def sep(char_sep: str = "+", char_h: str = "-") -> str:
        parts = [char_sep]
        for w in col_widths:
            parts.append(char_h * (w + 2))
            parts.append(char_sep)
        return "".join(parts)

    def fmt_row(values: List[str]) -> str:
        cells = []
        for i, v in enumerate(values):
            cells.append(" " + v.ljust(col_widths[i]) + " ")
        return "|" + "|".join(cells) + "|"

    print(sep())
    print(fmt_row(headers))
    print(sep())
    for r in rows:
        print(fmt_row(r))
    print(sep())


def _shift_duration_hours(start_t: time, end_t: time) -> float:
    """Return the duration of a shift in hours (same-day assumption)."""
    start_min = start_t.hour * 60 + start_t.minute
    end_min = end_t.hour * 60 + end_t.minute
    return max(0, end_min - start_min) / 60.0


def _hours_per_employee(schedule: schemas.ScheduleOut) -> dict:
    """Accumulate total worked hours per employee id."""
    hours = defaultdict(float)
    names = {}

    for s in schedule.shifts:
        dur = _shift_duration_hours(s.start_time, s.end_time)
        for emp in s.employees:
            emp_id = emp.employee_id
            hours[emp_id] += dur
            # Keep the latest non-empty name reference
            if getattr(emp, "name", None):
                names[emp_id] = emp.name

    show = {}
    for emp_id, h in hours.items():
        display = names.get(emp_id, str(emp_id))
        show[emp_id] = (display, h)
    return show


def _employees_worked_multiple_shifts_in_a_day(schedule: schemas.ScheduleOut) -> int:
    """
    Count employees who worked more than one shift on the same weekday
    at least once during the schedule.
    """
    by_emp_day = defaultdict(lambda: defaultdict(int))
    for s in schedule.shifts:
        for emp in s.employees:
            by_emp_day[emp.employee_id][s.weekday] += 1

    count_emp = 0
    for emp_id, day_counts in by_emp_day.items():
        if any(c > 1 for c in day_counts.values()):
            count_emp += 1
    return count_emp


def _mean_std(values: List[float]) -> Tuple[float, float]:
    """Compute population mean and population standard deviation."""
    if not values:
        return 0.0, 0.0
    n = len(values)
    mean = sum(values) / n
    var = sum((v - mean) ** 2 for v in values) / n
    return mean, math.sqrt(var)


def _print_schedule(schedule: schemas.ScheduleOut) -> None:
    """Prints the schedule and a per-employee summary as ASCII tables."""
    day_name = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

    def fmt_time(t: time) -> str:
        return f"{t.hour:02d}:{t.minute:02d}"

    print("\n=== ESCALA GERADA ===")
    shifts_sorted = sorted(
        schedule.shifts,
        key=lambda s: (s.weekday, s.start_time, s.end_time),
    )
    if not shifts_sorted:
        print("(no shift)")
        return

    schedule_headers = ["Dia", "Início", "Fim", "Min", "Funcionários"]
    schedule_rows = []
    for s in shifts_sorted:
        employees = ", ".join(emp.name or str(emp.employee_id) for emp in s.employees)
        if not employees:
            employees = "(sem alocação)"
        schedule_rows.append(
            [
                day_name[s.weekday],
                fmt_time(s.start_time),
                fmt_time(s.end_time),
                str(s.min_staff),
                employees,
            ]
        )
    _render_ascii_table(schedule_headers, schedule_rows)

    per_emp = _hours_per_employee(schedule)
    sorted_items = sorted(per_emp.items(), key=lambda kv: kv[1][0].lower())
    emp_rows = []
    hours_values = []
    for _, (display_name, total_h) in sorted_items:
        hours_values.append(total_h)
        emp_rows.append([display_name, f"{total_h:.2f}"])

    mean_h, std_h = _mean_std(hours_values)
    multi_shift_count = _employees_worked_multiple_shifts_in_a_day(schedule)

    print("\n=== RESUMO POR FUNCIONÁRIO ===")
    _render_ascii_table(["Funcionário", "Horas"], emp_rows)

    print("\n=== AGREGADOS ===")
    _render_ascii_table(
        ["Métrica", "Valor"],
        [
            ["Média (horas)", f"{mean_h:.2f}"],
            ["Desvio padrão (horas)", f"{std_h:.2f}"],
            [">1 turno no mesmo dia (funcionários)", str(multi_shift_count)],
        ],
    )


def _assert_basic_constraints(
    gen: ScheduleGenerator, schedule: schemas.ScheduleOut
) -> None:
    """
    Assert exact coverage, availability respect, and no overlap by employee.
    (Hard constraints only; step-2 '≤1 turno/dia' é objetivo/penalidade, não é hard.)
    """
    # 1) Same number of shift slots returned
    assert len(schedule.shifts) == gen.num_shifts

    # Map shift_id -> t index in generator
    idx_by_id = {gen.shift_ids[i]: i for i in range(gen.num_shifts)}

    # 2) Exact coverage and availability respected
    for s_out in schedule.shifts:
        t = idx_by_id[s_out.shift_id]

        # Coverage equals demand
        assert len(s_out.employees) == gen.demand[t]

        # Availability respected
        for emp_out in s_out.employees:
            e_index = gen.employee_ids.index(emp_out.employee_id)
            assert gen.availability_matrix[e_index][t] is True

    # 3) No overlapping shifts per employee
    alloc_per_emp = {e_id: [] for e_id in gen.employee_ids}
    for s_out in schedule.shifts:
        t = idx_by_id[s_out.shift_id]
        s_dom = gen.shift_vector[t]
        for emp in s_out.employees:
            alloc_per_emp[emp.employee_id].append(s_dom)

    for emp_id, assigned in alloc_per_emp.items():
        for i in range(len(assigned)):
            for j in range(i + 1, len(assigned)):
                assert not _overlap(assigned[i], assigned[j]), (
                    f"Employee {emp_id} has overlapping shifts: "
                    f"{assigned[i]} and {assigned[j]}"
                )


# -----------------------------
# Instances
# -----------------------------


def _build_small_instance() -> ScheduleGenerator:
    """
    Small, feasible instance:
      - 4 shifts (Mon 2 + Tue 2)
      - 3 employees
      - demand = 1 per shift
      - overlap constraint forces distinct allocations for overlapping shifts
    """
    employee_ids = [uuid.uuid4() for _ in range(3)]
    employee_names = ["Alice", "Bob", "Carol"]

    # Mon (0): 09-13 (S0) and 12-16 (S1)  -> overlap
    # Tue (1): 09-13 (S2) and 13-17 (S3)  -> no overlap
    shift_ids = [uuid.uuid4() for _ in range(4)]
    shifts: List[shift_domain.Shift] = [
        shift_domain.Shift(
            id=shift_ids[0], weekday=0, start_time=_t(9), end_time=_t(13), min_staff=1
        ),
        shift_domain.Shift(
            id=shift_ids[1], weekday=0, start_time=_t(12), end_time=_t(16), min_staff=1
        ),
        shift_domain.Shift(
            id=shift_ids[2], weekday=1, start_time=_t(9), end_time=_t(13), min_staff=1
        ),
        shift_domain.Shift(
            id=shift_ids[3], weekday=1, start_time=_t(13), end_time=_t(17), min_staff=1
        ),
    ]

    # Availability [emp][shift]
    availability = [
        [True, False, True, False],  # Alice
        [False, True, False, True],  # Bob
        [True, True, True, True],  # Carol (backup)
    ]

    return ScheduleGenerator(
        shift_ids=shift_ids,
        employee_ids=employee_ids,
        employee_names=employee_names,
        shift_vector=shifts,
        availability_matrix=availability,
    )


def _build_week_large_instance() -> ScheduleGenerator:
    """
    Larger, week-long baseline (no special employee constraints):
      - 7 days (Mon..Sun)
      - 3 shifts per day (non-overlapping): 09-13, 13-17, 17-21
      - demand = 2 per shift (constant)
      - 7 employees, fully available to all shifts
    """
    employee_names = ["Ana", "Bruno", "Carla", "Diego", "Elaine", "Fabio", "Giovana"]
    employee_ids = [uuid.uuid4() for _ in employee_names]

    # Build 3 shifts per day for 7 days (all min_staff=2)
    shift_ids = []
    shifts: List[shift_domain.Shift] = []
    for d in range(7):
        for start_h, end_h in [(9, 13), (13, 17), (17, 21)]:
            sid = uuid.uuid4()
            shift_ids.append(sid)
            shifts.append(
                shift_domain.Shift(
                    id=sid,
                    weekday=d,
                    start_time=_t(start_h),
                    end_time=_t(end_h),
                    min_staff=2,
                )
            )

    num_shifts = len(shifts)  # 7 * 3 = 21
    num_employees = len(employee_ids)  # 7

    availability = [[True for _ in range(num_shifts)] for _ in range(num_employees)]

    return ScheduleGenerator(
        shift_ids=shift_ids,
        employee_ids=employee_ids,
        employee_names=employee_names,
        shift_vector=shifts,
        availability_matrix=availability,
    )


def _build_week_constrained_instance() -> ScheduleGenerator:
    """
    Week-long instance with employee constraints and varying daily demand.
    - 7 days (Mon..Sun)
    - Exactly 3 non-overlapping shifts per day: 09–13 (MOR), 13–17 (AFT), 17–21 (EVE)
    - Demand varies by day/shift.
    - Employees have different availability rules.

    Employees:
      0 Ana:     no weekends (Sat/Sun off); Mon–Fri any shift
      1 Bruno:   mornings only (all days)
      2 Carla:   afternoons only; off Wednesday
      3 Diego:   evenings only (all days)
      4 Elaine:  Mon–Thu any shift; Fri off; weekends mornings only
      5 Fabio:   full availability (all shifts, all days)
      6 Giovana: full availability except Tuesday off
      7 Helena:  Fri–Sun only; afternoons & evenings (no mornings)
    """
    employee_names = [
        "Ana",
        "Bruno",
        "Carla",
        "Diego",
        "Elaine",
        "Fabio",
        "Giovana",
        "Helena",
    ]
    employee_ids = [uuid.uuid4() for _ in employee_names]
    num_employees = len(employee_ids)

    MOR, AFT, EVE = 0, 1, 2
    slots = [(9, 13), (13, 17), (17, 21)]

    # Demand per day (Mon..Sun) per slot (MOR, AFT, EVE)
    demand = [
        (2, 2, 1),  # Mon
        (2, 1, 2),  # Tue
        (2, 2, 2),  # Wed
        (1, 2, 2),  # Thu
        (3, 2, 3),  # Fri (busy)
        (2, 2, 2),  # Sat
        (2, 1, 2),  # Sun
    ]

    shift_ids = []
    shifts: List[shift_domain.Shift] = []
    # Build shifts with those min_staff
    for d in range(7):
        for slot_idx, (start_h, end_h) in enumerate(slots):
            sid = uuid.uuid4()
            shift_ids.append(sid)
            shifts.append(
                shift_domain.Shift(
                    id=sid,
                    weekday=d,
                    start_time=_t(start_h),
                    end_time=_t(end_h),
                    min_staff=demand[d][slot_idx],
                )
            )

    num_shifts = len(shifts)  # 21

    # Build availability matrix based on the employee rules above
    availability = [[False for _ in range(num_shifts)] for _ in range(num_employees)]

    def set_available(emp_idx: int, day: int, slot_idx: int) -> None:
        t = day * 3 + slot_idx  # shifts are appended in order (day, slot)
        availability[emp_idx][t] = True

    for day in range(7):
        # Ana (0): Mon–Fri any; weekends off
        if day <= 4:
            for s in (MOR, AFT, EVE):
                set_available(0, day, s)

        # Bruno (1): mornings only
        set_available(1, day, MOR)

        # Carla (2): afternoons only; off Wednesday (day=2)
        if day != 2:
            set_available(2, day, AFT)

        # Diego (3): evenings only
        set_available(3, day, EVE)

        # Elaine (4): Mon–Thu any; Fri off; weekends mornings only
        if day <= 3:
            for s in (MOR, AFT, EVE):
                set_available(4, day, s)
        elif day == 4:
            pass  # Friday off
        else:  # weekend
            set_available(4, day, MOR)

        # Fabio (5): full availability
        for s in (MOR, AFT, EVE):
            set_available(5, day, s)

        # Giovana (6): full availability except Tuesday (day=1) off
        if day != 1:
            for s in (MOR, AFT, EVE):
                set_available(6, day, s)

        # Helena (7): Fri–Sun only; afternoons & evenings (no mornings)
        if day >= 4:
            for s in (AFT, EVE):
                set_available(7, day, s)

    return ScheduleGenerator(
        shift_ids=shift_ids,
        employee_ids=employee_ids,
        employee_names=employee_names,
        shift_vector=shifts,
        availability_matrix=availability,
    )


# -----------------------------
# Fixtures
# -----------------------------


@pytest.fixture
def small_instance():
    return _build_small_instance()


@pytest.fixture
def week_large_instance():
    return _build_week_large_instance()


@pytest.fixture
def week_constrained_instance():
    return _build_week_constrained_instance()


# -----------------------------
# Tests
# -----------------------------


@pytest.mark.unit
def test_check_possibility_feasible(small_instance: ScheduleGenerator):
    gen = small_instance
    assert gen.check_possibility() is True


@pytest.mark.unit
def test_generate_schedule_basic_constraints(small_instance: ScheduleGenerator):
    gen = small_instance
    schedule: schemas.ScheduleOut = gen.generate_schedule()
    _print_schedule(schedule)
    _assert_basic_constraints(gen, schedule)


@pytest.mark.unit
def test_infeasible_when_no_availability():
    """Make it infeasible removing availability from all employees for the first shift."""
    gen = _build_small_instance()
    for e in range(gen.num_employees):
        gen.availability_matrix[e][0] = False
    assert gen.check_possibility() is False


@pytest.mark.unit
def test_generate_schedule_week_large_instance(week_large_instance: ScheduleGenerator):
    """
    Full-week baseline with multiple employees and fixed demand:
      - Ensures the solver honors exact coverage, availability, and no-overlap.
    """
    gen = week_large_instance
    assert gen.check_possibility() is True
    schedule: schemas.ScheduleOut = gen.generate_schedule()
    _print_schedule(schedule)
    _assert_basic_constraints(gen, schedule)


@pytest.mark.unit
def test_generate_schedule_week_constrained_instance(
    week_constrained_instance: ScheduleGenerator,
):
    """
    Full-week with employee constraints and varying demand:
      - Validates solver under tighter availability patterns and higher peaks (e.g., Friday).
      - Hard constraints still must hold: exact coverage, availability, and no overlap.
    """
    gen = week_constrained_instance
    assert gen.check_possibility() is True
    schedule: schemas.ScheduleOut = gen.generate_schedule()
    _print_schedule(schedule)
    _assert_basic_constraints(gen, schedule)

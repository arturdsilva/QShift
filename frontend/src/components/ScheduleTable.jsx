import { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import React from 'react';

function EmployeeSelector({
  day,
  slot,
  assignedEmployees,
  employeeList,
  onToggleEmployee,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-200">Select Employees</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="text-sm text-slate-400 mb-4">
          {day} | {slot.startTime} - {slot.endTime}
          <span className="ml-2 text-slate-500">
            ({assignedEmployees.length}/{slot.minEmployees} employees)
          </span>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
          {employeeList
            .filter((emp) => emp.active)
            .map((emp) => {
              const isSelected = assignedEmployees.some((assignedEmp) => assignedEmp.id === emp.id);
              return (
                <button
                  onClick={() => onToggleEmployee(emp)}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium max-w-full break-all leading-none">
                      {emp.name}
                    </span>
                    {isSelected && <Check size={20} />}
                  </div>
                </button>
              );
            })}
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Finish
        </button>
      </div>
    </div>
  );
}

function ScheduleTable({ scheduleData, setScheduleData, employeeList, week, editMode }) {
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const days_of_week = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const maxSlots = Math.max(...days_of_week.map((day) => scheduleData[day].length));

  const hendleSelecetedDaysMap = () => {
    if (!week) {
      return {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      };
    }
    const selecetedDaysMap = {};
    const [yearStartDate, monthStartDate, dayStartDate] = week.start_date.split('-').map(Number);
    const startDate = new Date(yearStartDate, monthStartDate - 1, dayStartDate);
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    days_of_week.forEach((day, index) => {
      selecetedDaysMap[day] =
        index + startDate.getDate() <= lastDay.getDate()
          ? index + startDate.getDate()
          : index + startDate.getDate() - lastDay.getDate();
    });
    return selecetedDaysMap;
  };
  const handleEmployeeSelector = (slot, day) => {
    setShowEmployeeSelector(true);
    setSelectedSlot({ slot, day });
  };

  const onToggleEmployee = (employee, slot, day) => {
    setScheduleData((data) => {
      const newData = { ...data };
      const dayData = [...newData[day]];

      newData[day] = dayData.map((slt) => {
        if (slt.id === slot.id) {
          const isSelected = slt.employees.some((emp) => emp.id === employee.id);
          const updatedEmployees = isSelected
            ? slt.employees.filter((emp) => emp.id !== employee.id)
            : [...slt.employees, employee];

          return { ...slt, employees: updatedEmployees };
        }
        return slt;
      });

      return newData;
    });
  };

  const areEqualSlots = (slots1, slots2) => {
    if (slots1.length !== slots2.length) return false;

    return slots1.every((slot1, index) => {
      const slot2 = slots2[index];
      return slot1.startTime === slot2.startTime && slot1.endTime === slot2.endTime;
    });
  };

  const visibleSlots = useMemo(() => {
    const visible = {};
    let previousSlots = [];
    days_of_week.forEach((day) => {
      const currentSlots = scheduleData[day];
      visible[day] = !areEqualSlots(currentSlots, previousSlots);
      previousSlots = currentSlots;
    });
    return visible;
  }, [scheduleData]);

  return (
    <div>
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                {days_of_week.map((day) => {
                  const selecetedDaysMap = hendleSelecetedDaysMap();

                  return (
                    <React.Fragment key={day}>
                      {visibleSlots[day] && (
                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-400 border-r border-slate-600 bg-slate-750 w-32">
                          Time Slot
                        </th>
                      )}
                      <th className="px-4 py-3 text-center text-sm font-bold text-slate-200 border-r border-slate-600 last:border-r-0">
                        <div className="flex items-center justify-center gap-2">
                          <span>{day}</span>
                        </div>
                        <div className="text-center text-sm font-bold text-slate-200 mt-1">
                          <span>{selecetedDaysMap[day]}</span>
                        </div>
                      </th>
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxSlots }).map((_, rowIndex) => {
                return (
                  <tr key={rowIndex} className="border-t border-slate-700">
                    {days_of_week.map((day) => {
                      const dayData = scheduleData[day];
                      const slot = dayData[rowIndex];
                      const employees = slot ? slot.employees || [] : [];
                      const isUnderStaffed = slot ? employees.length < slot.minEmployees : false;

                      return (
                        <React.Fragment key={day}>
                          {visibleSlots[day] && (
                            <td className="px-3 py-3 bg-slate-750 border-r border-slate-600 text-xs">
                              {slot ? (
                                <div>
                                  <div className="font-medium text-white">
                                    {slot.startTime}-{slot.endTime}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-700">—</div>
                              )}
                            </td>
                          )}
                          <td
                            onClick={() => slot && editMode && handleEmployeeSelector(slot, day)}
                            className={`px-2 py-3 border-r border-slate-600 last:border-r-0 
                                    ${editMode && slot ? 'cursor-pointer hover:bg-slate-700' : ''} 
                                    ${isUnderStaffed ? 'bg-red-900 bg-opacity-50' : ''}`}
                          >
                            <div className="min-h-[80px] flex flex-col gap-1">
                              {slot ? (
                                <>
                                  {isUnderStaffed && (
                                    <div className="text-xs text-red-400 font-medium mb-1">
                                      {employees.length}/{slot.minEmployees}
                                    </div>
                                  )}
                                  {employees.length > 0 ? (
                                    employees.map((emp, i) => {
                                      return (
                                        <div
                                          key={i}
                                          className="px-2 py-1.5 bg-blue-600/50 text-white text-xs rounded text-center font-medium leading-none"
                                        >
                                          {emp.name}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-slate-500 text-center text-xs py-6">
                                      {slot && editMode ? 'click' : '—'}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-slate-700 text-center py-6">—</div>
                              )}
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-600 bg-slate-750">
                {days_of_week.map((day) => {
                  const assignedEmployees = [];
                  employeeList.forEach((employee) => {
                    scheduleData[day].forEach((slot) =>
                      slot.employees.some((emp) => {
                        if (emp.id === employee.id) {
                          assignedEmployees.push(emp);
                        }
                      }),
                    );
                  });
                  const onBreak = employeeList.filter((emp) => {
                    if (assignedEmployees.every((assigEmp) => assigEmp.id !== emp.id)) {
                      return emp;
                    }
                  });
                  return (
                    <React.Fragment key={day}>
                      {visibleSlots[day] && day === 'monday' && (
                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-400 border-r border-slate-600 bg-slate-750 w-32">
                          Day off
                        </th>
                      )}
                      {visibleSlots[day] && day !== 'monday' && (
                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-400 border-r border-slate-600 bg-slate-750 w-32">
                          —
                        </th>
                      )}
                      <td key={day} className="px-2 py-3 border-r border-slate-600 text-center">
                        <div className="text-slate-400 text-sm leading-none">
                          {onBreak.length > 0 ? onBreak.map((emp) => emp.name).join(', ') : '—'}
                        </div>
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {showEmployeeSelector && selectedSlot && (
        <EmployeeSelector
          day={selectedSlot.day}
          slot={selectedSlot.slot}
          assignedEmployees={
            scheduleData[selectedSlot.day].find((slt) => slt.id === selectedSlot.slot.id)
              ?.employees || []
          }
          employeeList={employeeList}
          onToggleEmployee={(emp) => onToggleEmployee(emp, selectedSlot.slot, selectedSlot.day)}
          onClose={() => {
            setShowEmployeeSelector(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

export default ScheduleTable;

import { useState } from 'react';
import { X } from 'lucide-react';
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
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-slate-700'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold text-slate-200'>Select Employees</h3>
          <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div>
          {/*TODO: o botão do funcionário não está atualizando o estilo do botão*/}
          {employeeList.map(emp => {
            const isSelected = assignedEmployees.includes(emp);
            return (
              <React.Fragment key={day}>
                <button
                  onClick={() => onToggleEmployee(emp, slot, day)}
                  className={`w-full px-4 py-2 ${isSelected 
                    ? 'bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                    : 'bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium'}`}
                >
                  {emp}
                </button>
              </React.Fragment>
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


function ScheduleTable({
    scheduleData,
    setScheduleData,
    employeeList,
    week,
    editMode
}) {
    const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const maxSlots = Math.max(...days_of_week.map(day => scheduleData[day].length));
    const selecetedDaysMap = {};
    const year = week.startDateWeek.getFullYear();
    const month = week.startDateWeek.getMonth();
    const lastDay = new Date(year, month+1, 0);
    days_of_week.forEach((day, index) => {
      selecetedDaysMap[day] = index + week.startDateWeek.getDate() <= lastDay.getDate()
        ? index + week.startDateWeek.getDate()
        : index + week.startDateWeek.getDate() - lastDay.getDate();
    });
    const handleEmployeeSelector = (slot, day) => {
      setShowEmployeeSelector(true);
      setSelectedSlot({ slot, day });
    };

    const onToggleEmployee = (employee, slot, day) => {
        setScheduleData(data => {
            const newData = { ...data };
            const dayData = [...newData[day]];
            
            newData[day] = dayData.map(slt => {
                if (slt.id === slot.id) {
                    const employees = [...slt.employees];
                    const index = employees.indexOf(employee);
                    
                    if (index > -1) {
                        employees.splice(index, 1);
                    } else {
                        employees.push(employee);
                    }
                    
                    return { ...slt, employees };
                }
                return slt;
            });
            
            return newData;
        });
    };

    return (
      <div>
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700">
                  {days_of_week.map(day => (
                    <React.Fragment key={day}>
                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-400 border-r border-slate-600 bg-slate-750 w-32">
                            Time Slot
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-200 border-r border-slate-600 last:border-r-0">
                        <div className="flex items-center justify-center gap-2">
                            <span>{day}</span>
                        </div>
                        <div className="text-center text-sm font-bold text-slate-200 mt-1">
                            <span>{selecetedDaysMap[day]}</span>
                        </div>
                        </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxSlots }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-slate-700">
                    {days_of_week.map(day => {
                        const dayData = scheduleData[day];
                        const slot = dayData[rowIndex];
                        const employees = slot ? (slot.employees || []) : [];
                        const isUnderStaffed = slot ? employees.length < slot.minEmployees : false;
                        
                        return (
                        <React.Fragment key={day}>
                            <td
                            
                            className="px-3 py-3 bg-slate-750 border-r border-slate-600 text-xs">
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
                            <td
                            onClick={() => slot && editMode && handleEmployeeSelector(slot, day)}
                            className={`px-2 py-3 border-r border-slate-600 last:border-r-0 
                              ${editMode && slot ? 'cursor-pointer hover:bg-slate-700' : ''} 
                              ${isUnderStaffed ? 'bg-red-900 bg-opacity-50' : ''}`}
                            >
                            <div className="min-h-[80px] flex flex-col gap-1">
                                {slot ? (
                                <>
                                    {employees.length > 0 ? (
                                    employees.map((emp, i) => (
                                        <div
                                        key={i}
                                        className="px-2 py-1.5 bg-blue-600/50 text-white text-xs rounded text-center font-medium"
                                        >
                                        {emp}
                                        </div>
                                    ))
                                    ) : (
                                    <div className="text-slate-500 text-center text-xs py-6">{slot && editMode ? "click" : "—"}</div>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showEmployeeSelector && selectedSlot && (
          <EmployeeSelector
            day={selectedSlot.day}
            slot={selectedSlot.slot}
            assignedEmployees={selectedSlot.slot.employees}
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
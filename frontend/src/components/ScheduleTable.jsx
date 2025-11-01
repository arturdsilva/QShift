import React, { useState } from 'react';
import { Edit2, Save, X, Settings, Trash2, Plus } from 'lucide-react';

// DADOS MOCKADOS
const INITIAL_SCHEDULE = {
  // Cada dia tem seus próprios horários
  monday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {
      1: ['Lu'],
      2: ['Ana', 'João'],
      4: ['Maria']
    }
  },
  tuesday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  wednesday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  thursday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  friday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  saturday: {
    slots: [
      { id: 101, startTime: '09:00', endTime: '13:00', label: '9h-13h', minEmployees: 3 },
      { id: 102, startTime: '09:00', endTime: '15:00', label: '9h-15h', minEmployees: 4 },
      { id: 103, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 4 },
      { id: 104, startTime: '14:00', endTime: '20:00', label: '14h-20h', minEmployees: 5 },
    ],
    assignments: {
      101: ['Lu', 'Ana', 'João'],
      102: ['Maria', 'Pedro', 'Carlos', 'Beatriz'],
    }
  },
  sunday: {
    slots: [],
    assignments: {}
  }
};

function ScheduleTable({
}) {
    const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const [scheduleData, setScheduleData] = useState(INITIAL_SCHEDULE);

    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="bg-slate-700">
                    {days_of_week.map(day => (
                    <>
                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-400 border-r border-slate-600 bg-slate-750 w-32">
                            Horários
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-200 border-r border-slate-600 last:border-r-0">
                        <div className="flex items-center justify-center gap-2">
                            <span>{day}</span>
                        </div>
                        </th>
                    </>
                    ))}
                </tr>
                </thead>
                
                <tbody>
                    <tr className="border-t border-slate-700">
                    {days_of_week.map(day => {
                        return (
                        <>
                            <td className="px-3 py-3 bg-slate-750 border-r border-slate-600 text-xs">
                                <div>
                                    <div className="text-slate-500 text-[10px] mt-0.5">
                                    startTime-endTime
                                    </div>
                                </div>
                            </td>
                            <div className="min-h-[80px] flex flex-col gap-1">
                                <>
                                    <div className="text-xs text-red-400 font-medium mb-1">
                                        employees/minEmployees
                                    </div>
                                    <div
                                    className="px-2 py-1.5 bg-blue-600 text-white text-xs rounded text-center font-medium"
                                    >
                                    employees
                                    </div>
                                </>
                            </div>
                        </>
                        );
                    })}
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default ScheduleTable;
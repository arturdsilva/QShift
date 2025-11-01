function ScheduleTable({scheduleData}) {

    const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const maxSlots = Math.max(...days_of_week.map(day => scheduleData[day].slots.length));
    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700">
                  {days_of_week.map(day => (
                    <>
                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-400 border-r border-slate-600 bg-slate-750 w-32">
                            Time Slot
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
                {Array.from({ length: maxSlots }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-slate-700">
                    {days_of_week.map(day => {
                        const dayData = scheduleData[day];
                        const slot = dayData.slots[rowIndex];
                        const employees = slot ? (dayData.assignments[slot.id] || []) : [];
                        
                        return (
                        <>
                            <td className="px-3 py-3 bg-slate-750 border-r border-slate-600 text-xs">
                                {slot ? (
                                <div>
                                    <div className="font-medium text-white">{slot.label}</div>
                                    <div className="text-slate-500 text-[10px] mt-0.5">
                                    {slot.startTime}-{slot.endTime}
                                    </div>
                                </div>
                                ) : (
                                <div className="text-slate-700">—</div>
                                )}
                            </td>
                            <td
                            className={`px-2 py-3 border-r border-slate-600 last:border-r-0`}
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
                                    <div className="text-slate-500 text-center text-xs py-6">—</div>
                                    )}
                                </>
                                ) : (
                                <div className="text-slate-700 text-center py-6">—</div>
                                )}
                            </div>
                            </td>
                        </>
                        );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    )
}

export default ScheduleTable;
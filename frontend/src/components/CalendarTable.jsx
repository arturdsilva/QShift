import { ArrowRight } from 'lucide-react';

function getMonthCalendar(year, month) {
    const firstDay = new Date(year, month-1, 1);
    const lastDay = new Date(year, month, 0);
    const weeks = [];
    let currentWeek = [];
    const startDayOfWeek = firstDay.getDate() === 0
        ? 6
        : firstDay.getDay() - 1
    
    for (let i = 0; i < startDayOfWeek; i++) {
        const prevFirstDay = new Date(year, month - 1, -startDayOfWeek + 1 + i);
        currentWeek.push(prevFirstDay);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        currentWeek.push(new Date(year, month - 1, day));

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    if (currentWeek.length > 0) {
        const remaining = 7 - currentWeek.length;
        for (let i = 1; i <= remaining; i++) {
            currentWeek.push(new Date(year, month, i));
        }
        weeks.push(currentWeek);
    }

    return weeks;
}

function CalendarTable({
    currentMonth,
    currentYear,
    selectedDays,
    selectedWeek,
    onToggleDay,
    onToggleWeek,
    onAdvance
}){
    const weeks = getMonthCalendar(currentYear, currentMonth);
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const isSelectedDay = (date) => {
        return selectedDays.some(d =>
            d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
        );
    };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              {weekDays.map(day => (
                <th key={day} className="px-4 py-3 text-left text-sm font-bold text-slate-200">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIdx) => (
              <tr 
                key={weekIdx} 
                className="border-t border-slate-700 hover:bg-slate-900 cursor-pointer"
                onClick={() => onToggleWeek(week, weekIdx)}
              >
                {week.map((date, dayIdx) => {
                  const isCurrentMonth = date.getMonth() + 1 === currentMonth;
                  const selected = isSelectedDay(date);
                  const isSelectedWeek = selectedWeek === weekIdx + 1;
                  
                  return (
                    <td key={dayIdx} className="p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleDay(date, isSelectedWeek);
                        }}
                        className={`w-20 px-4 py-3 rounded-lg text-center transition-all ${
                          selected
                            ? 'bg-blue-500 text-white font-semibold'
                            : isCurrentMonth
                            ? 'text-slate-200 hover:bg-slate-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onAdvance}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Avançar
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default CalendarTable;
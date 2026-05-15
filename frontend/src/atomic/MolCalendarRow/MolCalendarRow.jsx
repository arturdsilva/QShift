import { CalendarDayButton } from '../AtmButton/index.js';
import { TR, TD } from '../AtmTable/index.js';
import './MolCalendarRow.css';

/**
 * MolCalendarWeekRow – a single clickable week row in the calendar table
 */
export function MolCalendarWeekRow({
  week,
  weekIdx,
  currentMonth,
  selectedWeek,
  selectedDays,
  generatedWeeks,
  onToggleWeek,
  onDayClick,
}) {
  const alreadyExists = generatedWeeks.some(
    (generatedWeek) => week[0].toISOString().split('T')[0] === generatedWeek.start_date,
  );
  const isThisWeekSelected = selectedWeek === weekIdx + 1;

  const isSelectedDay = (date) =>
    selectedDays.some(
      (d) => d.toISOString().split('T')[0] === date.toISOString().split('T')[0],
    );

  return (
    <TR
      calendarBody={true}
      className={alreadyExists
        ? 'mol-calendar-row--exists'
        : 'mol-calendar-row--selectable'
      }
      onClick={() => !isThisWeekSelected && !alreadyExists && onToggleWeek(week, weekIdx)}
    >
      {week.map((date, dayIdx) => {
        const isCurrentMonth = date.getMonth() + 1 === currentMonth;
        const selected = isSelectedDay(date);

        return (
          <TD key={dayIdx} calendarBody={true}>
            <CalendarDayButton
              disabled={alreadyExists}
              selected={selected}
              currentMonth={isCurrentMonth}
              onClick={(e) => {
                e.stopPropagation();
                !alreadyExists && onDayClick(date, week, weekIdx);
              }}
            >
              {date.getDate()}
            </CalendarDayButton>
          </TD>
        );
      })}
    </TR>
  );
}

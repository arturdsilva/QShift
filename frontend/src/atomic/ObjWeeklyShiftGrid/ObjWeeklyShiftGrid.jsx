import { useState, memo } from 'react';
import { X, Pencil, Plus, Download, Ban, ArrowDown } from 'lucide-react';
import { AtmText } from '../AtmText';
import { Button } from '../AtmButton';
import { MolShiftChip } from '../MolShiftChip';
import { DAY_LABELS } from '../../constants/constantsOfTable';

/* ── single shift card inside the grid ─────────────────── */
const GridShiftCard = memo(function GridShiftCard({ shift, onRemove, onEdit }) {
  return (
    <div className="group relative">
      <MolShiftChip shift={shift} />
      <div className="absolute top-1 right-1 flex gap-0.5">
        {onEdit && (
          <button
            onClick={() => onEdit(shift.id)}
            className="w-5 h-5 flex items-center justify-center rounded bg-slate-700/80 hover:bg-blue-600 transition-colors"
          >
            <Pencil size={10} className="text-white" />
          </button>
        )}
        <Button
          onClick={() => onRemove(shift.id)}
          variant='ghost'
          size='sm'
        >
          <X size={15} />
        </Button>
      </div>
    </div>
  );
});

/* ── single day column ─────────────────────────────────── */
function DayColumn({
  dayIndex,
  label,
  dateNum,
  shifts,
  isActive,
  isToday,
  isSelected,
  onHeaderClick,
  onShiftDrop,
  onDayDrop,
  onRemoveShift,
  onEditShift,
  onAddShift,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    if (!isActive) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isActive) return;

    try {
      const raw = e.dataTransfer.getData('text/plain');
      const data = JSON.parse(raw);

      if (data._type === 'day') {
        onDayDrop?.(dayIndex, data);
      } else if (data._type === 'schedule') {
      } else {
        onShiftDrop?.(dayIndex, data);
      }
    } catch { }
  };

  const columnClasses = [
    'flex flex-col rounded-lg border transition-all duration-200 min-h-[340px]',
    isActive
      ? isSelected
        ? 'border-green-500/60 bg-green-500/5'
        : isDragOver
          ? 'border-blue-500 bg-blue-500/10 border-dashed shadow-lg shadow-blue-500/10'
          : 'border-slate-800 bg-[#0c1220]/60'
      : 'border-slate-800/50 bg-[#0c1220]/30 opacity-50 pointer-events-none',
  ].join(' ');

  return (
    <div
      className={columnClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* header – clickable to select day */}
      <div
        onClick={() => isActive && onHeaderClick?.(dayIndex)}
        className={`text-center py-3 border-b cursor-pointer select-none transition-colors
          ${isToday ? 'border-blue-500' : isSelected ? 'border-green-500/40' : 'border-slate-800'}
          ${isActive ? 'hover:bg-white/5' : ''}
        `}
      >
        <AtmText
          as="p" size="xs" weight="bold"
          className={`uppercase tracking-widest ${isToday ? 'text-blue-400' : isSelected ? 'text-green-400' : 'text-slate-500'}`}
        >
          {label}
        </AtmText>
        <AtmText
          as="p" size="lg" weight="bold"
          className={isToday ? 'text-blue-400' : isSelected ? 'text-green-400' : 'text-white'}
        >
          {dateNum}
        </AtmText>
        {isSelected && (
          <AtmText as="p" size="xs" className="text-green-400 mt-0.5">selected</AtmText>
        )}
        {isToday && !isSelected && (
          <AtmText as="p" size="xs" className="mt-0.5" color="blue">today</AtmText>
        )}
      </div>

      <div className="flex-1 p-2 flex flex-col gap-1.5 overflow-y-auto">
        {isActive ? (
          <>
            {shifts.map((shift) => (
              <GridShiftCard
                key={shift.id}
                shift={shift}
                onRemove={(id) => onRemoveShift(dayIndex, id)}
                onEdit={onEditShift}
              />
            ))}
            {shifts.length === 0 && !isDragOver && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <Download size={22} className="text-slate-500 mb-2" />
                <AtmText size="xs" color="faint" className="uppercase tracking-wider leading-relaxed">
                  Drop shift<br />or template
                </AtmText>
              </div>
            )}
            {isDragOver && (
              <div className="border border-dashed border-blue-500/40 rounded-lg p-4 text-center bg-blue-500/5">
                <div className="flex items-center justify-center">
                  <ArrowDown size={15} className="text-blue-400" />
                  <AtmText size="xs" color="blue">Drop here</AtmText>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Ban size={22} className="text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <Button
          onClick={() => onAddShift?.(dayIndex)}
          variant="ghost"
          className="mx-2 mb-2 w-auto py-1.5 border border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5"
        >
          <Plus size={14} className="text-slate-500" />
        </Button>
      )}
    </div>
  )
}

export function ObjWeeklyShiftGrid({
  weekConfig = [],
  selectedDays = [],
  startDate,
  selectedDay,
  onHeaderClick,
  onShiftDrop,
  onDayDrop,
  onRemoveShift,
  onEditShift,
  onAddShift,
}) {
  const activeDayIndices = new Set();
  selectedDays.forEach((d) => {
    const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    activeDayIndices.add(idx);
  });

  const weekStart = new Date(startDate);
  const dayOfWeek = weekStart.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + diff);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleGridDrop = (e) => {
    try {
      const raw = e.dataTransfer.getData('text/plain');
      const data = JSON.parse(raw);
      if (data._type === 'schedule' && data.days && Array.isArray(data.days)) {
        data.days.forEach((dayData, idx) => {
          if (dayData.shifts?.length) {
            onDayDrop?.(idx, { ...dayData, _type: 'day' });
          }
        });
      }
    } catch { }
  };

  return (
    <div
      className="grid grid-cols-7 gap-2 flex-1 min-w-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleGridDrop}
    >
      {DAY_LABELS.map((label, idx) => {
        const colDate = new Date(weekStart);
        colDate.setDate(colDate.getDate() + idx);
        const dateNum = colDate.getDate();
        const isActive = activeDayIndices.has(idx);
        const isToday = colDate.getTime() === today.getTime();
        const shifts = weekConfig[idx] || [];

        return (
          <DayColumn
            key={idx}
            dayIndex={idx}
            label={label}
            dateNum={dateNum}
            shifts={shifts}
            isActive={isActive}
            isToday={isToday}
            isSelected={selectedDay === idx}
            onHeaderClick={onHeaderClick}
            onShiftDrop={onShiftDrop}
            onDayDrop={onDayDrop}
            onRemoveShift={onRemoveShift}
            onEditShift={onEditShift}
            onAddShift={onAddShift}
          />
        );
      })}
    </div>
  );
}

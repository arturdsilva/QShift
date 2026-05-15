import { useState, memo } from 'react';
import { X, Pencil, Plus, Download, Ban, ArrowDown } from 'lucide-react';
import { AtmText } from '../AtmText';
import { Button } from '../AtmButton';
import { MolShiftChip } from '../MolShiftChip';
import { DAY_LABELS } from '../../constants/constantsOfTable';
import './ObjWeeklyShiftGrid.css';

/* ── single shift card inside the grid ─────────────────── */
const GridShiftCard = memo(function GridShiftCard({ shift, onRemove, onEdit }) {
  return (
    <div className="obj-grid-shift-card group">
      <MolShiftChip shift={shift} />
      <div className="obj-grid-shift-card__actions">
        {onEdit && (
          <button
            onClick={() => onEdit(shift.id)}
            className="obj-grid-shift-card__edit-btn"
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
    'obj-day-column',
    isActive
      ? isSelected
        ? 'obj-day-column--selected'
        : isDragOver
          ? 'obj-day-column--drag-over'
          : 'obj-day-column--active'
      : 'obj-day-column--inactive',
  ].join(' ');

  const headerClasses = [
    'obj-day-column__header',
    isToday
      ? 'obj-day-column__header--today'
      : isSelected
        ? 'obj-day-column__header--selected'
        : 'obj-day-column__header--default',
    isActive ? 'hover:bg-white/5' : '',
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
        className={headerClasses}
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

      <div className="obj-day-column__body">
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
              <div className="obj-day-column__empty">
                <Download size={22} className="text-slate-500 mb-2" />
                <AtmText size="xs" color="faint" className="uppercase tracking-wider leading-relaxed">
                  Drop shift<br />or template
                </AtmText>
              </div>
            )}
            {isDragOver && (
              <div className="obj-day-column__drop-zone">
                <div className="obj-day-column__drop-zone-inner">
                  <ArrowDown size={15} className="text-blue-400" />
                  <AtmText size="xs" color="blue">Drop here</AtmText>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="obj-day-column__inactive-icon">
            <div className="obj-day-column__inactive-icon-wrapper">
              <Ban size={22} className="text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <Button
          onClick={() => onAddShift?.(dayIndex)}
          variant="ghost"
          className="obj-day-column__add-btn"
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
      className="obj-weekly-grid"
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

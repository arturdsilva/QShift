import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Save } from 'lucide-react';

import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { MolPageHeader } from '../atomic/MolPageHeader';
import { Button } from '../atomic/AtmButton/index.js';
import { AtmText } from '../atomic/AtmText/index.js';
import { MolFormField } from '../atomic/MolFormField';
import { MolShiftChip } from '../atomic/MolShiftChip/index.js';
import { ObjRetryStatusBanner } from '../atomic/ObjRetryStatusBanner';
import { ObjCreateShiftModal } from '../atomic/ObjCreateShiftModal';
import { ObjSidebarSectionTemplate } from '../atomic/ObjSidebarSectionTemplate';
import { ObjWeeklyShiftGrid } from '../atomic/ObjWeeklyShiftGrid';
import { ObjModal } from '../atomic/ObjModal';

import { useScheduleCreate } from '../hooks/useScheduleGeneration';
import { STATUS } from '../hooks/useRetryOnSleep';
import { useTemplateStore } from '../services/useTemplateStore.js';
import { daysOfWeek } from '../constants/constantsOfTable.js';
import './ShiftConfigPage.css';

function buildShiftFromTemplate(tpl) {
  return {
    id: crypto.randomUUID(),
    name: tpl.name,
    start_time: tpl.start,
    end_time: tpl.end,
    min_staff: Number(tpl.staff),
    color: tpl.color || 'blue',
  };
}

function ShiftConfigPage({
  selectedDays,
  startDate,
  setWeekData,
  setShiftsData,
  setPreviewSchedule,
}) {
  const navigate = useNavigate();
  const { run, status, retryCountdown, retriesLeft, errorInfo, getMessage } = useScheduleCreate();
  const isBusy = status === STATUS.RUNNING || status === STATUS.WAKING_UP;

  const { shiftsDB, daysDB, schedulesDB } = useTemplateStore();

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [dayForm, setDayForm] = useState({ name: '' });
  const [weekForm, setWeekForm] = useState({ name: '' });

  const [weekConfig, setWeekConfig] = useState(() => Array.from({ length: 7 }, () => []));
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (!startDate || !selectedDays || selectedDays.length === 0) navigate('/staff');
  }, [startDate, selectedDays, navigate]);

  const openDaysMask = [];
  const selectedDaysMap = {};
  selectedDays.forEach((day) => {
    const idx = day.getDay() === 0 ? 6 : day.getDay() - 1;
    selectedDaysMap[idx] = day;
    openDaysMask.push(idx);
  });
  openDaysMask.sort((a, b) => a - b);

  const handleHeaderClick = useCallback((dayIndex) => {
    setSelectedDay((prev) => (prev === dayIndex ? null : dayIndex));
  }, []);

  const handleShiftModalSave = useCallback(
    async (data) => {
      const dayIndex = typeof showShiftModal === 'number' ? showShiftModal : null;

      await shiftsDB.add({
        id: data.id ?? Date.now(),
        name: data.name,
        start: data.start,
        end: data.end,
        staff: Number(data.staff),
        color: data.color,
      });

      if (dayIndex !== null) {
        setWeekConfig((prev) => {
          const next = prev.map((d) => [...d]);
          next[dayIndex] = [...next[dayIndex], buildShiftFromTemplate(data)];
          return next;
        });
      }

      setShowShiftModal(false);
    },
    [showShiftModal, shiftsDB],
  );

  const handleOpenDayModal = useCallback(() => {
    setDayForm({ name: '' });
    setShowDayModal(true);
  }, []);

  const handleSaveDay = useCallback(async () => {
    if (!dayForm.name.trim()) return;
    if (selectedDay === null) {
      alert('Select a day column in the grid by clicking its header before saving.');
      return;
    }
    const shifts = weekConfig[selectedDay] || [];
    if (shifts.length === 0) {
      alert('Add shifts to this column before saving it as a Day template.');
      return;
    }
    await daysDB.add({
      id: Date.now(),
      name: dayForm.name,
      color: shifts[0]?.color || 'blue',
      shifts: shifts.map((s) => ({
        name: s.name,
        start: s.start_time,
        end: s.end_time,
        staff: s.min_staff,
        color: s.color,
      })),
    });
    setShowDayModal(false);
    setDayForm({ name: '' });
  }, [dayForm, selectedDay, weekConfig, daysDB]);

  const handleOpenWeekModal = useCallback(() => {
    const hasAny = weekConfig.some((d) => d.length > 0);
    if (!hasAny) {
      alert('Configure at least one shift before saving as a Schedule.');
      return;
    }
    setWeekForm({ name: '' });
    setShowWeekModal(true);
  }, [weekConfig]);

  const handleSaveWeek = useCallback(async () => {
    if (!weekForm.name.trim()) return;
    const days = weekConfig.map((dayShifts, idx) => ({
      dayIndex: idx,
      shifts: dayShifts.map((s) => ({
        name: s.name,
        start: s.start_time,
        end: s.end_time,
        staff: s.min_staff,
        color: s.color,
      })),
    }));
    await schedulesDB.add({
      id: Date.now(),
      name: weekForm.name,
      color: 'purple',
      days,
      meta: `${days.filter((d) => d.shifts.length > 0).length} days configured`,
    });
    setShowWeekModal(false);
    setWeekForm({ name: '' });
  }, [weekForm, weekConfig, schedulesDB]);

  const handleShiftDrop = useCallback((dayIndex, template) => {
    setWeekConfig((prev) => {
      const next = prev.map((d) => [...d]);
      next[dayIndex] = [...next[dayIndex], buildShiftFromTemplate(template)];
      return next;
    });
  }, []);

  const handleDayDrop = useCallback((dayIndex, dayTemplate) => {
    if (!dayTemplate.shifts || dayTemplate.shifts.length === 0) return;
    setWeekConfig((prev) => {
      const next = prev.map((d) => [...d]);
      next[dayIndex] = dayTemplate.shifts.map((s) => buildShiftFromTemplate(s));
      return next;
    });
  }, []);

  const handleRemoveShift = useCallback((dayIndex, shiftId) => {
    setWeekConfig((prev) => {
      const next = prev.map((d) => [...d]);
      next[dayIndex] = next[dayIndex].filter((s) => s.id !== shiftId);
      return next;
    });
  }, []);

  const handleAddShift = useCallback((dayIndex) => {
    setShowShiftModal(dayIndex);
  }, []);

  const convertScheduleData = (shifts) => {
    const scheduleModified = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: [],
    };
    shifts.forEach((shift, index) => {
      const dayName = daysOfWeek[shift.weekday];
      scheduleModified[dayName].push({
        id: `${dayName}-${index}`,
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
        minEmployees: shift.min_staff,
        employees: shift.employees.map((emp) => ({ id: emp.employee_id, name: emp.name })),
      });
    });
    daysOfWeek.forEach((day) => {
      scheduleModified[day].sort((a, b) =>
        a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0,
      );
    });
    return scheduleModified;
  };

  const createSchedule = async () => {
    const shiftsSchedule = [];
    const errors = [];

    weekConfig.forEach((dayShifts, dayIndex) => {
      const isDaySelected = selectedDaysMap[dayIndex] !== undefined;
      if (!isDaySelected) return;

      dayShifts.forEach((shift) => {
        if (!shift.start_time || !shift.end_time || !shift.min_staff) {
          errors.push(`${daysOfWeek[dayIndex]}: Shift "${shift.name}" is incomplete.`);
          return;
        }
        if (shift.start_time >= shift.end_time) {
          errors.push(`${daysOfWeek[dayIndex]}: "${shift.name}" – end time must be after start time.`);
          return;
        }
        shiftsSchedule.push({
          id: crypto.randomUUID(),
          weekday: dayIndex,
          start_time: shift.start_time,
          end_time: shift.end_time,
          min_staff: Number(shift.min_staff),
        });
      });
    });

    if (errors.length > 0) {
      alert(`Please fix the following issues:\n\n${errors.join('\n')}`);
      return;
    }
    if (shiftsSchedule.length === 0) {
      alert('Configure at least one complete shift before generating the schedule.');
      return;
    }

    setShiftsData(shiftsSchedule);
    const week = { start_date: startDate.toISOString().split('T')[0], open_days: openDaysMask };
    setWeekData(week);

    const response = await run({ shift_vector: shiftsSchedule });

    if (response?.success) {
      const result = response.data.result;
      if (result?.possible && result.schedule) {
        const converted = convertScheduleData(result.schedule.shifts);
        setPreviewSchedule(converted);
        navigate('/schedule');
      } else {
        alert('Could not generate a viable schedule. Please review the shifts and staff.');
        navigate('/staff');
      }
    }
  };

  const selectedDayShifts = selectedDay !== null ? (weekConfig[selectedDay] || []) : [];

  return (
    <BaseLayout showSidebar={false} currentPage={6} showSelectionPanel={false}>
      <MolPageHeader title="Shift Configuration" />

      <ObjRetryStatusBanner
        status={status}
        retryCountdown={retryCountdown}
        retriesLeft={retriesLeft}
        errorInfo={errorInfo}
        getMessage={getMessage}
        onRetry={createSchedule}
      />

      <div className="shift-config__layout">
        <aside className="shift-config__sidebar">
          <div className="shift-config__sidebar-inner">
            <ObjSidebarSectionTemplate
              title="Shifts"
              items={shiftsDB.items}
              type="shift"
              onAdd={() => setShowShiftModal(true)}
              onDelete={(id) => shiftsDB.remove(id)}
              emptyText="Create your first shift"
            />

            <ObjSidebarSectionTemplate
              title="Days"
              items={daysDB.items}
              type="day"
              onAdd={handleOpenDayModal}
              onDelete={(id) => daysDB.remove(id)}
              emptyText="Save a day config"
            />

            <ObjSidebarSectionTemplate
              title="Schedules"
              items={schedulesDB.items}
              type="schedule"
              onAdd={handleOpenWeekModal}
              onDelete={(id) => schedulesDB.remove(id)}
              emptyText="Save a full schedule"
            />
          </div>
        </aside>

        <ObjWeeklyShiftGrid
          weekConfig={weekConfig}
          selectedDays={selectedDays}
          startDate={startDate}
          selectedDay={selectedDay}
          onHeaderClick={handleHeaderClick}
          onShiftDrop={handleShiftDrop}
          onDayDrop={handleDayDrop}
          onRemoveShift={handleRemoveShift}
          onAddShift={handleAddShift}
        />
      </div>

      <div className="shift-config__footer">
        <Button onClick={() => navigate('/calendar')} variant="primary" size="lg" disabled={isBusy}>
          <ArrowLeft size={20} />
          Back
        </Button>
        <Button onClick={createSchedule} variant="primary" size="lg" disabled={isBusy} className="shift-config__create-btn">
          <Calendar className="w-4 h-4" />
          {isBusy ? 'Generating…' : 'Create Schedule'}
        </Button>
      </div>

      {showShiftModal !== false && showShiftModal !== null && (
        <ObjCreateShiftModal
          onSave={handleShiftModalSave}
          onCancel={() => setShowShiftModal(false)}
        />
      )}

      {showDayModal && (
        <ObjModal title="Save Day Template" onClose={() => setShowDayModal(false)}>
          <AtmText size="sm" color="muted" className="leading-relaxed">
            {selectedDay !== null
              ? `Saving shifts from ${daysOfWeek[selectedDay]} as a reusable template.`
              : 'Click a day header in the calendar to select it first, then save.'}
          </AtmText>

          {selectedDay !== null && selectedDayShifts.length > 0 && (
            <div className="shift-config__day-modal-preview">
              {selectedDayShifts.map((s) => (
                <MolShiftChip key={s.id} shift={s} small />
              ))}
            </div>
          )}

          <MolFormField
            label="Template Name"
            variant="shiftConfig"
            placeholder="e.g. Weekday Standard, Saturday Rush…"
            value={dayForm.name}
            onChange={(e) => setDayForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div className="shift-config__modal-actions">
            <Button variant="secondary" size="md" onClick={() => setShowDayModal(false)}>Cancel</Button>
            <Button
              variant="primary" size="md"
              onClick={handleSaveDay}
              disabled={!dayForm.name.trim() || selectedDay === null || selectedDayShifts.length === 0}
            >
              <Save size={14} />
              Save Day
            </Button>
          </div>
        </ObjModal>
      )}

      {showWeekModal && (
        <ObjModal title="Save Schedule Template" onClose={() => setShowWeekModal(false)}>
          <AtmText size="sm" color="muted" className="leading-relaxed">
            Saves the current week layout as a reusable schedule preset.
          </AtmText>

          <MolFormField
            label="Template Name"
            variant="shiftConfig"
            placeholder="e.g. Standard Week, Holiday Schedule…"
            value={weekForm.name}
            onChange={(e) => setWeekForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div className="shift-config__modal-actions">
            <Button variant="secondary" size="md" onClick={() => setShowWeekModal(false)}>Cancel</Button>
            <Button
              variant="primary" size="md"
              onClick={handleSaveWeek}
              disabled={!weekForm.name.trim()}
            >
              <Save size={14} />
              Save Schedule
            </Button>
          </div>
        </ObjModal>
      )}
    </BaseLayout>
  );
}

export default ShiftConfigPage;

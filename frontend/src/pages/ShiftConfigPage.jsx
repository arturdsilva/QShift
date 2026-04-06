import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, X, Save } from 'lucide-react';

import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { MolPageHeader } from '../atomic/MolPageHeader';
import { Button } from '../atomic/AtmButton/index.js';
import { AtmText } from '../atomic/AtmText/index.js';
import { MolFormField } from '../atomic/MolFormField';
import { MolShiftChip } from '../atomic/MolShiftChip/index.js';
import { ObjRetryStatusBanner } from '../atomic/ObjRetryStatusBanner';
import { ObjCreateShiftModal } from '../atomic/ObjCreateShiftModal';
import { ObjTemplateSidebar } from '../atomic/ObjTemplateSidebar';
import { ObjWeeklyShiftGrid } from '../atomic/ObjWeeklyShiftGrid';

import { useScheduleCreate } from '../hooks/useScheduleGeneration';
import { STATUS } from '../hooks/useRetryOnSleep';
import { useIndexedDB } from '../services/useIndexedDB.js';
import { daysOfWeek } from '../constants/constantsOfTable.js';

/* ── helpers ───────────────────────────────────────────── */
const EMPTY_WEEK = () => Array.from({ length: 7 }, () => []);
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

/* ── reusable inline Modal shell ───────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#131c2e] border border-[#1e2d47] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d47]">
          <AtmText as="p" size="base" weight="semibold" color="white">{title}</AtmText>
          <Button onClick={onClose} variant="ghost" size="sm"><X size={16} /></Button>
        </div>
        <div className="p-5 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
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

  /* ── IndexedDB stores ──────────────────────────────── */
  const shiftsDB = useIndexedDB('shifts');
  const daysDB = useIndexedDB('days');
  const schedulesDB = useIndexedDB('schedules');

  /* ── modal state ───────────────────────────────────── */
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [dayForm, setDayForm] = useState({ name: '' });
  const [weekForm, setWeekForm] = useState({ name: '' });

  /* ── week grid state ───────────────────────────────── */
  const [weekConfig, setWeekConfig] = useState(EMPTY_WEEK);
  const [selectedDay, setSelectedDay] = useState(null);

  /* ── guard: redirect if no dates selected ──────────── */
  useEffect(() => {
    if (!startDate || !selectedDays || selectedDays.length === 0) navigate('/staff');
  }, [startDate, selectedDays, navigate]);

  /* ── build active-days mask ────────────────────────── */
  const openDaysMask = [];
  const selectedDaysMap = {};
  selectedDays.forEach((day) => {
    const idx = day.getDay() === 0 ? 6 : day.getDay() - 1;
    selectedDaysMap[idx] = day;
    openDaysMask.push(idx);
  });
  openDaysMask.sort((a, b) => a - b);

  /* ══════════════════════════════════════════════════════
     COLUMN SELECTION
  ══════════════════════════════════════════════════════ */
  const handleHeaderClick = useCallback((dayIndex) => {
    setSelectedDay((prev) => (prev === dayIndex ? null : dayIndex));
  }, []);

  /* ══════════════════════════════════════════════════════
     SHIFT TEMPLATE CRUD
  ══════════════════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════════════════
     DAY TEMPLATE CRUD
  ══════════════════════════════════════════════════════ */
  const handleOpenDayModal = useCallback(() => {
    setDayForm({ name: '' });
    setShowDayModal(true);
  }, []);

  const handleSaveDay = useCallback(async () => {
    if (!dayForm.name.trim()) return;
    if (selectedDay === null) {
      alert('Selecione uma coluna de dia no grid clicando no cabeçalho antes de salvar.');
      return;
    }
    const shifts = weekConfig[selectedDay] || [];
    if (shifts.length === 0) {
      alert('Adicione turnos nesta coluna antes de salvar como Day template.');
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

  /* ══════════════════════════════════════════════════════
     SCHEDULE TEMPLATE CRUD
  ══════════════════════════════════════════════════════ */
  const handleOpenWeekModal = useCallback(() => {
    const hasAny = weekConfig.some((d) => d.length > 0);
    if (!hasAny) {
      alert('Configure ao menos um turno antes de salvar como Schedule.');
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

  /* ══════════════════════════════════════════════════════
     GRID DROP & ACTIONS
  ══════════════════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════════════════
     CREATE SCHEDULE (submit to backend)
  ══════════════════════════════════════════════════════ */
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
          errors.push(`${daysOfWeek[dayIndex]}: Turno "${shift.name}" incompleto.`);
          return;
        }
        if (shift.start_time >= shift.end_time) {
          errors.push(`${daysOfWeek[dayIndex]}: "${shift.name}" – horário final deve ser após o inicial.`);
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
      alert(`Corrija os seguintes problemas:\n\n${errors.join('\n')}`);
      return;
    }
    if (shiftsSchedule.length === 0) {
      alert('Configure ao menos um turno completo antes de gerar a escala.');
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
        alert('Não foi possível gerar uma escala viável. Verifique os turnos e funcionários.');
        navigate('/staff');
      }
    }
  };

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
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

      {/* main area: sidebar + grid */}
      <div className="flex flex-1 gap-3 mt-3 overflow-hidden" style={{ minHeight: 0 }}>
        <ObjTemplateSidebar
          shiftTemplates={shiftsDB.items}
          dayTemplates={daysDB.items}
          scheduleTemplates={schedulesDB.items}
          onCreateShift={() => setShowShiftModal(true)}
          onDeleteShift={(id) => shiftsDB.remove(id)}
          onCreateDay={handleOpenDayModal}
          onDeleteDay={(id) => daysDB.remove(id)}
          onCreateSchedule={handleOpenWeekModal}
          onDeleteSchedule={(id) => schedulesDB.remove(id)}
          onCreateNewTemplate={() => setShowShiftModal(true)}
        />

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

      {/* footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1e2d47]">
        <Button onClick={() => navigate('/calendar')} variant="primary" size="lg" disabled={isBusy}>
          <ArrowLeft size={20} />
          Back
        </Button>
        <Button onClick={createSchedule} variant="primary" size="lg" disabled={isBusy} className="bg-blue-600 hover:bg-blue-500">
          <Calendar className="w-4 h-4" />
          {isBusy ? 'Generating…' : 'Create Schedule'}
        </Button>
      </div>

      {/* ── Shift Modal ──────────────────────────────────── */}
      {showShiftModal !== false && showShiftModal !== null && (
        <ObjCreateShiftModal
          onSave={handleShiftModalSave}
          onCancel={() => setShowShiftModal(false)}
        />
      )}

      {/* ── Day Template Modal ───────────────────────────── */}
      {showDayModal && (
        <Modal title="Save Day Template" onClose={() => setShowDayModal(false)}>
          <AtmText size="sm" color="muted" className="leading-relaxed">
            {selectedDay !== null
              ? `Saving shifts from ${DAY_NAMES[selectedDay]} as a reusable template.`
              : 'Click a day header in the calendar to select it first, then save.'}
          </AtmText>

          {selectedDay !== null && selectedDayShifts.length > 0 && (
            <div className="bg-[#0e1929] rounded-xl p-3 flex flex-col gap-1">
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

          <div className="flex justify-end gap-3">
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
        </Modal>
      )}

      {/* ── Schedule Template Modal ──────────────────────── */}
      {showWeekModal && (
        <Modal title="Save Schedule Template" onClose={() => setShowWeekModal(false)}>
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

          <div className="flex justify-end gap-3">
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
        </Modal>
      )}
    </BaseLayout>
  );
}

export default ShiftConfigPage;

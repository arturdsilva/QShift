import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Clock, CalendarDays, Layers, Plus, Trash2, Save, Check } from 'lucide-react';

import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { MolPageHeader } from '../atomic/MolPageHeader';
import { Button, SelectableButton } from '../atomic/AtmButton/index.js';
import { AtmText } from '../atomic/AtmText/index.js';
import { MolTemplateCard } from '../atomic/MolTemplateCard';
import { ObjCreateShiftModal } from '../atomic/ObjCreateShiftModal';
import { ObjModal } from '../atomic/ObjModal';
import { MolFormField } from '../atomic/MolFormField';
import { BADGE_COLOR, COLOR_OPTIONS } from '../constants/shiftColors.js';

import { useTemplateStore } from '../services/useTemplateStore.js';
import './TemplatesPage.css';

const FILTERS = [
  { key: 'all', label: 'All Templates' },
  { key: 'shift', label: 'Shifts' },
  { key: 'day', label: 'Days' },
  { key: 'schedule', label: 'Weeks' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getColorHex(colorName) {
  const opt = COLOR_OPTIONS.find((c) => c.value === colorName);
  return opt?.hex || '#60a5fa';
}

function TemplatesPage() {
  const navigate = useNavigate();
  const {
    shiftsDB, daysDB, schedulesDB,
    getShiftDeleteImpact, getDayDeleteImpact,
  } = useTemplateStore();

  const [activeFilter, setActiveFilter] = useState('all');

  /* ── modals state ── */
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  /* ── Inline form errors ── */
  const [shiftModalError, setShiftModalError] = useState('');
  const [dayModalError,   setDayModalError]   = useState('');
  const [weekModalError,  setWeekModalError]  = useState('');
  const [editShiftError,  setEditShiftError]  = useState('');
  const [editDayError,    setEditDayError]    = useState('');
  const [editWeekError,   setEditWeekError]   = useState('');

  /* ── Edit states ── */
  const [editShift, setEditShift] = useState(null);
  const [editShiftForm, setEditShiftForm] = useState({ name: '', start: '', end: '', staff: '', color: 'blue' });
  const [editDay, setEditDay] = useState(null);
  const [editDayForm, setEditDayForm] = useState({ name: '', color: 'green' });
  const [editDayShiftIds, setEditDayShiftIds] = useState([]);
  const [editWeek, setEditWeek] = useState(null);
  const [editWeekForm, setEditWeekForm] = useState({ name: '' });
  const [editWeekAssignments, setEditWeekAssignments] = useState(() =>
    Array.from({ length: 7 }, () => ({ dayTemplateId: null })),
  );

  /* ── Day modal form ── */
  const [dayForm, setDayForm] = useState({ name: '', color: 'green' });
  const [selectedShiftIds, setSelectedShiftIds] = useState([]);

  /* ── Week modal form ── */
  const [weekForm, setWeekForm] = useState({ name: '' });
  const [weekDayAssignments, setWeekDayAssignments] = useState(() =>
    Array.from({ length: 7 }, () => ({ dayTemplateId: null, shiftIds: [] })),
  );

  /* ── CRUD handlers ── */
  const handleShiftModalSave = useCallback(
    async (data) => {
      try {
        await shiftsDB.add({
          id: data.id ?? Date.now(),
          name: data.name,
          start: data.start,
          end: data.end,
          staff: Number(data.staff),
          color: data.color,
        });
        setShiftModalError('');
        setShowShiftModal(false);
      } catch (e) {
        setShiftModalError(e.message);
      }
    },
    [shiftsDB],
  );

  /* ── Day modal handlers ── */
  const openDayModal = useCallback(() => {
    setDayForm({ name: '', color: 'green' });
    setSelectedShiftIds([]);
    setShowDayModal(true);
  }, []);

  const toggleShiftSelection = useCallback((shiftId) => {
    setSelectedShiftIds((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId],
    );
  }, []);

  const handleSaveDay = useCallback(async () => {
    if (!dayForm.name.trim() || selectedShiftIds.length === 0) return;
    const selectedShifts = shiftsDB.items.filter((s) => selectedShiftIds.includes(s.id));
    try {
      await daysDB.add({
        id: Date.now(),
        name: dayForm.name.trim(),
        color: dayForm.color,
        shifts: selectedShifts.map((s) => ({
          name: s.name, start: s.start, end: s.end, staff: s.staff, color: s.color,
        })),
      });
      setDayModalError('');
      setShowDayModal(false);
    } catch (e) {
      setDayModalError(e.message);
    }
  }, [dayForm, selectedShiftIds, shiftsDB.items, daysDB]);

  /* ── Week modal handlers ── */
  const openWeekModal = useCallback(() => {
    setWeekForm({ name: '' });
    setWeekDayAssignments(Array.from({ length: 7 }, () => ({ dayTemplateId: null, shiftIds: [] })));
    setShowWeekModal(true);
  }, []);

  const assignDayTemplate = useCallback((dayIndex, templateId) => {
    setWeekDayAssignments((prev) => {
      const next = [...prev];
      next[dayIndex] = { dayTemplateId: templateId || null, shiftIds: [] };
      return next;
    });
  }, []);

  const handleSaveWeek = useCallback(async () => {
    if (!weekForm.name.trim()) return;

    const days = weekDayAssignments.map((assignment, idx) => {
      let shifts = [];
      if (assignment.dayTemplateId) {
        const dayTpl = daysDB.items.find((d) => d.id === assignment.dayTemplateId);
        if (dayTpl?.shifts) shifts = dayTpl.shifts;
      }
      return { dayIndex: idx, dayTemplateId: assignment.dayTemplateId || null, shifts };
    });

    const configuredDays = days.filter((d) => d.shifts.length > 0).length;

    try {
      await schedulesDB.add({
        id: Date.now(),
        name: weekForm.name.trim(),
        color: 'purple',
        days,
        meta: `${configuredDays} day${configuredDays !== 1 ? 's' : ''} configured`,
      });
      setWeekModalError('');
      setShowWeekModal(false);
    } catch (e) {
      setWeekModalError(e.message);
    }
  }, [weekForm, weekDayAssignments, daysDB.items, schedulesDB]);

  /* ── Edit handlers ── */
  const handleEditShift = useCallback((item) => {
    setEditShift(item);
    setEditShiftForm({ name: item.name, start: item.start || '', end: item.end || '', staff: String(item.staff || ''), color: item.color || 'blue' });
  }, []);

  const handleEditShiftSave = useCallback(async () => {
    if (!editShift || !editShiftForm.name.trim()) return;
    try {
      await shiftsDB.update({ ...editShift, name: editShiftForm.name.trim(), start: editShiftForm.start, end: editShiftForm.end, staff: Number(editShiftForm.staff), color: editShiftForm.color });
      setEditShiftError('');
      setEditShift(null);
    } catch (e) {
      setEditShiftError(e.message);
    }
  }, [editShift, editShiftForm, shiftsDB]);

  const handleEditDay = useCallback((item) => {
    setEditDay(item);
    setEditDayForm({ name: item.name, color: item.color || 'green' });
    const matchedIds = (item.shifts || []).map((s) => {
      const found = shiftsDB.items.find((db) => db.name === s.name && db.start === s.start && db.end === s.end);
      return found?.id;
    }).filter(Boolean);
    setEditDayShiftIds(matchedIds);
  }, [shiftsDB.items]);

  const handleEditDaySave = useCallback(async () => {
    if (!editDay || !editDayForm.name.trim()) return;
    const selectedShifts = shiftsDB.items.filter((s) => editDayShiftIds.includes(s.id));
    try {
      await daysDB.update({ ...editDay, name: editDayForm.name.trim(), color: editDayForm.color, shifts: selectedShifts.map((s) => ({ name: s.name, start: s.start, end: s.end, staff: s.staff, color: s.color })) });
      setEditDayError('');
      setEditDay(null);
    } catch (e) {
      setEditDayError(e.message);
    }
  }, [editDay, editDayForm, editDayShiftIds, shiftsDB.items, daysDB]);

  const handleEditWeek = useCallback((item) => {
    setEditWeek(item);
    setEditWeekForm({ name: item.name });
    setEditWeekError('');
    // Use stored dayTemplateId if available, else fall back to heuristic match
    const assignments = Array.from({ length: 7 }, (_, idx) => {
      const dayData = item.days?.[idx];
      if (!dayData) return { dayTemplateId: null };
      if (dayData.dayTemplateId !== undefined) return { dayTemplateId: dayData.dayTemplateId };
      if (!dayData.shifts?.length) return { dayTemplateId: null };
      const match = daysDB.items.find((d) => d.shifts?.length === dayData.shifts.length && d.shifts.every((ds, i) => ds.name === dayData.shifts[i]?.name));
      return { dayTemplateId: match?.id || null };
    });
    setEditWeekAssignments(assignments);
  }, [daysDB.items]);

  const handleEditWeekSave = useCallback(async () => {
    if (!editWeek || !editWeekForm.name.trim()) return;
    const days = editWeekAssignments.map((a, idx) => {
      let shifts = [];
      if (a.dayTemplateId) { const tpl = daysDB.items.find((d) => d.id === a.dayTemplateId); if (tpl?.shifts) shifts = tpl.shifts; }
      return { dayIndex: idx, dayTemplateId: a.dayTemplateId || null, shifts };
    });
    const configuredDays = days.filter((d) => d.shifts.length > 0).length;
    try {
      await schedulesDB.update({ ...editWeek, name: editWeekForm.name.trim(), days, meta: `${configuredDays} day${configuredDays !== 1 ? 's' : ''} configured` });
      setEditWeekError('');
      setEditWeek(null);
    } catch (e) {
      setEditWeekError(e.message);
    }
  }, [editWeek, editWeekForm, editWeekAssignments, daysDB.items, schedulesDB]);

  const handleEdit = useCallback((item, type) => {
    if (type === 'shift') handleEditShift(item);
    else if (type === 'day') handleEditDay(item);
    else handleEditWeek(item);
  }, [handleEditShift, handleEditDay, handleEditWeek]);

  /* ── Use handler ── */
  const handleUse = useCallback((item, type) => {
    navigate('/staff');
  }, [navigate]);

  const handleDelete = useCallback((item, type) => {
    // Compute cascade impact for the confirmation modal
    let impact = null;
    if (type === 'shift') impact = getShiftDeleteImpact(item.id);
    if (type === 'day')   impact = getDayDeleteImpact(item.id);
    setDeleteItem({ item, type, impact });
  }, [getShiftDeleteImpact, getDayDeleteImpact]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteItem) return;
    if (deleteItem.type === 'shift')    await shiftsDB.remove(deleteItem.item.id);
    else if (deleteItem.type === 'day') await daysDB.remove(deleteItem.item.id);
    else                                await schedulesDB.remove(deleteItem.item.id);
    setDeleteItem(null);
  }, [deleteItem, shiftsDB, daysDB, schedulesDB]);

  /* ── derived data ── */
  const sections = [];

  if (activeFilter === 'all' || activeFilter === 'shift') {
    sections.push({ type: 'shift', label: 'Shifts', icon: Clock, items: shiftsDB.items });
  }
  if (activeFilter === 'all' || activeFilter === 'day') {
    sections.push({ type: 'day', label: 'Days', icon: CalendarDays, items: daysDB.items });
  }
  if (activeFilter === 'all' || activeFilter === 'schedule') {
    sections.push({ type: 'schedule', label: 'Weeks', icon: Layers, items: schedulesDB.items });
  }

  const totalCount = shiftsDB.items.length + daysDB.items.length + schedulesDB.items.length;

  return (
    <BaseLayout currentPage={11}>
      <MolPageHeader title="Templates" icon={LayoutTemplate}>
        <div className="templates-page__add-actions">
          <Button variant="primary" size="sm" onClick={() => setShowShiftModal(true)}>
            <Plus size={16} />
            Add Shift
          </Button>
          <Button variant="primary" size="sm" onClick={openDayModal} disabled={shiftsDB.items.length === 0}>
            <Plus size={16} />
            Add Day
          </Button>
          <Button variant="primary" size="sm" onClick={openWeekModal} disabled={daysDB.items.length === 0}>
            <Plus size={16} />
            Add Week
          </Button>
        </div>
      </MolPageHeader>

      <div className="templates-page__content">
        {/* Stats bar */}
        <div className="templates-page__stats">
          <div className="templates-page__stat">
            <div className="templates-page__stat-icon templates-page__stat-icon--shift">
              <Clock size={16} />
            </div>
            <div className="templates-page__stat-info">
              <AtmText size="lg" weight="bold">{shiftsDB.items.length}</AtmText>
              <AtmText size="xs" color="muted">Shifts</AtmText>
            </div>
          </div>
          <div className="templates-page__stat">
            <div className="templates-page__stat-icon templates-page__stat-icon--day">
              <CalendarDays size={16} />
            </div>
            <div className="templates-page__stat-info">
              <AtmText size="lg" weight="bold">{daysDB.items.length}</AtmText>
              <AtmText size="xs" color="muted">Days</AtmText>
            </div>
          </div>
          <div className="templates-page__stat">
            <div className="templates-page__stat-icon templates-page__stat-icon--schedule">
              <Layers size={16} />
            </div>
            <div className="templates-page__stat-info">
              <AtmText size="lg" weight="bold">{schedulesDB.items.length}</AtmText>
              <AtmText size="xs" color="muted">Weeks</AtmText>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="templates-page__toolbar">
          <div className="templates-page__filters">
            {FILTERS.map((f) => (
              <SelectableButton
                key={f.key}
                variant="default"
                size="sm"
                selected={activeFilter === f.key}
                onClick={() => setActiveFilter(f.key)}
              >
                <AtmText size="xs" weight="medium">{f.label}</AtmText>
              </SelectableButton>
            ))}
          </div>
        </div>

        {/* Sections */}
        {totalCount === 0 ? (
          <div className="templates-page__empty">
            <div className="templates-page__empty-icon">
              <LayoutTemplate size={32} />
            </div>
            <AtmText size="lg" weight="semibold" color="muted">No templates yet</AtmText>
            <AtmText size="sm" color="faint">
              Click "Add Shift" above to create your first shift template, then compose Day and Week templates from them.
            </AtmText>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.type} className="templates-page__section">
              <div className="templates-page__section-header">
                <section.icon size={16} className="text-slate-500" />
                <AtmText size="sm" weight="bold" color="muted" className="uppercase tracking-widest">
                  {section.label}
                </AtmText>
                <AtmText size="xs" color="faint">({section.items.length})</AtmText>
                <div className="templates-page__section-line" />
              </div>

              {section.items.length > 0 ? (
                <div className="templates-page__grid">
                  {section.items.map((item) => (
                    <MolTemplateCard
                      key={item.id}
                      item={item}
                      type={section.type}
                      onEdit={(it) => handleEdit(it, section.type)}
                      onDelete={(it) => handleDelete(it, section.type)}
                      onUse={section.type === 'schedule' ? (it) => handleUse(it, section.type) : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="templates-page__empty">
                  <AtmText size="sm" color="faint">
                    No {section.label.toLowerCase()} templates yet.
                  </AtmText>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Create Shift Modal ── */}
      {showShiftModal && (
        <ObjCreateShiftModal
          onSave={handleShiftModalSave}
          onCancel={() => setShowShiftModal(false)}
        />
      )}

      {/* ── Create Day Modal ── */}
      {showDayModal && (
        <ObjModal title="Create Day Template" onClose={() => setShowDayModal(false)}>
          <div className="templates-page__day-modal">
            <AtmText size="sm" color="muted">
              Select the shifts that make up this day template.
            </AtmText>

            <MolFormField
              label="Day Name"
              variant="shiftConfig"
              placeholder="e.g. Weekday Standard, Saturday Rush…"
              value={dayForm.name}
              onChange={(e) => setDayForm((f) => ({ ...f, name: e.target.value }))}
            />

            {/* Color picker */}
            <div>
              <AtmText as="p" size="sm" weight="medium" color="dimmer" className="mb-2">
                Color Tag
              </AtmText>
              <div className="templates-page__color-picker">
                {COLOR_OPTIONS.map((opt) => (
                  <SelectableButton
                    key={opt.value}
                    variant="colorDot"
                    selected={dayForm.color === opt.value}
                    onClick={() => setDayForm((f) => ({ ...f, color: opt.value }))}
                    className={`
                      ${opt.bg}
                      ${dayForm.color === opt.value ? `ring-2 ring-offset-2 ring-offset-[#131c2e] ${opt.ring}` : ''}
                    `}
                  />
                ))}
              </div>
            </div>

            {/* Shift selection */}
            <div>
              <AtmText as="p" size="sm" weight="medium" color="dimmer" className="mb-2">
                Select Shifts ({selectedShiftIds.length} selected)
              </AtmText>
              <div className="templates-page__shift-picker">
                {shiftsDB.items.length === 0 ? (
                  <AtmText size="xs" color="faint">No shifts available. Create a shift first.</AtmText>
                ) : (
                  shiftsDB.items.map((shift) => {
                    const isSelected = selectedShiftIds.includes(shift.id);
                    const badge = BADGE_COLOR[shift.color] || BADGE_COLOR.blue;
                    return (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() => toggleShiftSelection(shift.id)}
                        className={`templates-page__shift-pick-item ${isSelected ? 'templates-page__shift-pick-item--selected' : ''}`}
                      >
                        <div className="templates-page__shift-pick-check">
                          {isSelected && <Check size={12} />}
                        </div>
                        <div className="templates-page__shift-pick-info">
                          <span className={`templates-page__shift-pick-name ${badge.text} ${badge.bg}`}>
                            {shift.name}
                          </span>
                          <AtmText size="xs" color="muted">
                            {shift.start || '--:--'} – {shift.end || '--:--'} · {shift.staff || 0} staff
                          </AtmText>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {dayModalError && (
              <p className="templates-page__form-error">{dayModalError}</p>
            )}
            <div className="templates-page__edit-modal-actions">
              <Button variant="secondary" size="md" onClick={() => setShowDayModal(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveDay}
                disabled={!dayForm.name.trim() || selectedShiftIds.length === 0}
              >
                <Save size={14} />
                Save Day
              </Button>
            </div>
          </div>
        </ObjModal>
      )}

      {/* ── Create Week Modal ── */}
      {showWeekModal && (
        <ObjModal wide title="Create Week Template" onClose={() => setShowWeekModal(false)}>
          <div className="templates-page__week-modal">
            <AtmText size="sm" color="muted">
              Assign a day template to each day of the week.
            </AtmText>

            <MolFormField
              label="Week Name"
              variant="shiftConfig"
              placeholder="e.g. Standard Week, Holiday Schedule…"
              value={weekForm.name}
              onChange={(e) => setWeekForm((f) => ({ ...f, name: e.target.value }))}
            />

            {/* Day assignments — visual card picker */}
            <div className="templates-page__week-days">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const assignment = weekDayAssignments[idx];
                const activeTpl = assignment.dayTemplateId
                  ? daysDB.items.find((d) => d.id === assignment.dayTemplateId)
                  : null;
                return (
                  <div key={dayName} className="templates-page__week-day-row">
                    <div className="templates-page__week-day-header">
                      <AtmText size="sm" weight="semibold" className="templates-page__week-day-label">
                        {dayName}
                      </AtmText>
                      {activeTpl && (
                        <span className="templates-page__week-day-badge">
                          {activeTpl.shifts?.length || 0} shift{activeTpl.shifts?.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Template card chips */}
                    <div className="templates-page__week-day-options">
                      <button
                        type="button"
                        onClick={() => assignDayTemplate(idx, null)}
                        className={`templates-page__week-day-option templates-page__week-day-option--none ${!assignment.dayTemplateId ? 'templates-page__week-day-option--active-none' : ''}`}
                      >
                        Off
                      </button>
                      {daysDB.items.map((dayTpl) => {
                        const isActive = assignment.dayTemplateId === dayTpl.id;
                        const colorHex = dayTpl.color ? getColorHex(dayTpl.color) : '#60a5fa';
                        return (
                          <button
                            key={dayTpl.id}
                            type="button"
                            onClick={() => assignDayTemplate(idx, dayTpl.id)}
                            className={`templates-page__week-day-option ${isActive ? 'templates-page__week-day-option--active' : ''}`}
                            style={isActive ? { '--tpl-color': colorHex, borderColor: colorHex, backgroundColor: `${colorHex}18` } : { '--tpl-color': colorHex }}
                          >
                            <span
                              className="templates-page__week-day-option-dot"
                              style={{ backgroundColor: colorHex }}
                            />
                            {dayTpl.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Shifts preview */}
                    {activeTpl?.shifts?.length > 0 && (
                      <div className="templates-page__week-day-preview">
                        {activeTpl.shifts.map((s, i) => (
                          <span key={i} className="templates-page__week-day-shift-tag">
                            <span
                              className="templates-page__week-day-shift-dot"
                              style={{ backgroundColor: getColorHex(s.color) }}
                            />
                            <strong>{s.name}</strong>
                            <span className="templates-page__week-day-shift-time">
                              {s.start || '--:--'}–{s.end || '--:--'}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {weekModalError && (
              <p className="templates-page__form-error">{weekModalError}</p>
            )}
            <div className="templates-page__edit-modal-actions">
              <Button variant="secondary" size="md" onClick={() => setShowWeekModal(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveWeek}
                disabled={!weekForm.name.trim() || weekDayAssignments.every((a) => !a.dayTemplateId)}
              >
                <Save size={14} />
                Save Week
              </Button>
            </div>
          </div>
        </ObjModal>
      )}

      {/* ── Edit Shift Modal ── */}
      {editShift && (
        <ObjModal title="Edit Shift Template" onClose={() => setEditShift(null)}>
          <div className="templates-page__day-modal">
            <MolFormField label="Template Name" variant="shiftConfig" placeholder="e.g. Morning Rush" value={editShiftForm.name} onChange={(e) => setEditShiftForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="templates-page__time-grid">
              <MolFormField label="Start Time" type="time" variant="shiftConfig" value={editShiftForm.start} onChange={(e) => setEditShiftForm((f) => ({ ...f, start: e.target.value }))} />
              <MolFormField label="End Time" type="time" variant="shiftConfig" value={editShiftForm.end} onChange={(e) => setEditShiftForm((f) => ({ ...f, end: e.target.value }))} />
            </div>
            <MolFormField label="Minimum Staff" type="number" variant="shiftConfig" min={1} value={editShiftForm.staff} onChange={(e) => setEditShiftForm((f) => ({ ...f, staff: e.target.value }))} />
            <div>
              <AtmText as="p" size="sm" weight="medium" color="dimmer" className="mb-2">Color Tag</AtmText>
              <div className="templates-page__color-picker">
                {COLOR_OPTIONS.map((opt) => (
                  <SelectableButton key={opt.value} variant="colorDot" selected={editShiftForm.color === opt.value} onClick={() => setEditShiftForm((f) => ({ ...f, color: opt.value }))} className={`${opt.bg} ${editShiftForm.color === opt.value ? `ring-2 ring-offset-2 ring-offset-[#131c2e] ${opt.ring}` : ''}`} />
                ))}
              </div>
            </div>
            {editShiftError && (
              <p className="templates-page__form-error">{editShiftError}</p>
            )}
            <div className="templates-page__edit-modal-actions">
              <Button variant="secondary" size="md" onClick={() => setEditShift(null)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleEditShiftSave} disabled={!editShiftForm.name.trim()}><Save size={14} />Save</Button>
            </div>
          </div>
        </ObjModal>
      )}

      {/* ── Edit Day Modal ── */}
      {editDay && (
        <ObjModal title="Edit Day Template" onClose={() => setEditDay(null)}>
          <div className="templates-page__day-modal">
            <MolFormField label="Day Name" variant="shiftConfig" value={editDayForm.name} onChange={(e) => setEditDayForm((f) => ({ ...f, name: e.target.value }))} />
            <div>
              <AtmText as="p" size="sm" weight="medium" color="dimmer" className="mb-2">Color Tag</AtmText>
              <div className="templates-page__color-picker">
                {COLOR_OPTIONS.map((opt) => (
                  <SelectableButton key={opt.value} variant="colorDot" selected={editDayForm.color === opt.value} onClick={() => setEditDayForm((f) => ({ ...f, color: opt.value }))} className={`${opt.bg} ${editDayForm.color === opt.value ? `ring-2 ring-offset-2 ring-offset-[#131c2e] ${opt.ring}` : ''}`} />
                ))}
              </div>
            </div>
            <div>
              <AtmText as="p" size="sm" weight="medium" color="dimmer" className="mb-2">Select Shifts ({editDayShiftIds.length} selected)</AtmText>
              <div className="templates-page__shift-picker">
                {shiftsDB.items.map((shift) => {
                  const isSelected = editDayShiftIds.includes(shift.id);
                  const badge = BADGE_COLOR[shift.color] || BADGE_COLOR.blue;
                  return (
                    <button key={shift.id} type="button" onClick={() => setEditDayShiftIds((prev) => prev.includes(shift.id) ? prev.filter((id) => id !== shift.id) : [...prev, shift.id])} className={`templates-page__shift-pick-item ${isSelected ? 'templates-page__shift-pick-item--selected' : ''}`}>
                      <div className="templates-page__shift-pick-check">{isSelected && <Check size={12} />}</div>
                      <div className="templates-page__shift-pick-info">
                        <span className={`templates-page__shift-pick-name ${badge.text} ${badge.bg}`}>{shift.name}</span>
                        <AtmText size="xs" color="muted">{shift.start || '--:--'} – {shift.end || '--:--'} · {shift.staff || 0} staff</AtmText>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {editDayError && (
              <p className="templates-page__form-error">{editDayError}</p>
            )}
            <div className="templates-page__edit-modal-actions">
              <Button variant="secondary" size="md" onClick={() => setEditDay(null)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleEditDaySave} disabled={!editDayForm.name.trim() || editDayShiftIds.length === 0}><Save size={14} />Save</Button>
            </div>
          </div>
        </ObjModal>
      )}

      {/* ── Edit Week Modal ── */}
      {editWeek && (
        <ObjModal wide title="Edit Week Template" onClose={() => setEditWeek(null)}>
          <div className="templates-page__week-modal">
            <MolFormField label="Week Name" variant="shiftConfig" value={editWeekForm.name} onChange={(e) => setEditWeekForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="templates-page__week-days">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const assignment = editWeekAssignments[idx];
                const activeTpl = assignment.dayTemplateId
                  ? daysDB.items.find((d) => d.id === assignment.dayTemplateId)
                  : null;
                return (
                  <div key={dayName} className="templates-page__week-day-row">
                    <div className="templates-page__week-day-header">
                      <AtmText size="sm" weight="semibold" className="templates-page__week-day-label">{dayName}</AtmText>
                      {activeTpl && (
                        <span className="templates-page__week-day-badge">
                          {activeTpl.shifts?.length || 0} shift{activeTpl.shifts?.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="templates-page__week-day-options">
                      <button
                        type="button"
                        onClick={() => { const next = [...editWeekAssignments]; next[idx] = { dayTemplateId: null }; setEditWeekAssignments(next); }}
                        className={`templates-page__week-day-option templates-page__week-day-option--none ${!assignment.dayTemplateId ? 'templates-page__week-day-option--active-none' : ''}`}
                      >
                        Off
                      </button>
                      {daysDB.items.map((d) => {
                        const isActive = assignment.dayTemplateId === d.id;
                        const colorHex = d.color ? getColorHex(d.color) : '#60a5fa';
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => { const next = [...editWeekAssignments]; next[idx] = { dayTemplateId: d.id }; setEditWeekAssignments(next); }}
                            className={`templates-page__week-day-option ${isActive ? 'templates-page__week-day-option--active' : ''}`}
                            style={isActive ? { '--tpl-color': colorHex, borderColor: colorHex, backgroundColor: `${colorHex}18` } : { '--tpl-color': colorHex }}
                          >
                            <span className="templates-page__week-day-option-dot" style={{ backgroundColor: colorHex }} />
                            {d.name}
                          </button>
                        );
                      })}
                    </div>
                    {activeTpl?.shifts?.length > 0 && (
                      <div className="templates-page__week-day-preview">
                        {activeTpl.shifts.map((s, i) => (
                          <span key={i} className="templates-page__week-day-shift-tag">
                            <span className="templates-page__week-day-shift-dot" style={{ backgroundColor: getColorHex(s.color) }} />
                            <strong>{s.name}</strong>
                            <span className="templates-page__week-day-shift-time">{s.start || '--:--'}–{s.end || '--:--'}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {editWeekError && (
              <p className="templates-page__form-error">{editWeekError}</p>
            )}
            <div className="templates-page__edit-modal-actions">
              <Button variant="secondary" size="md" onClick={() => setEditWeek(null)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleEditWeekSave} disabled={!editWeekForm.name.trim()}><Save size={14} />Save</Button>
            </div>
          </div>
        </ObjModal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteItem && (
        <ObjModal title="Confirm Delete" onClose={() => setDeleteItem(null)}>
          <div className="templates-page__delete-modal-body">
            <AtmText color="dimmer">
              Tem certeza que deseja deletar este template? Esta ação não pode ser desfeita.
            </AtmText>
            <div className="templates-page__delete-modal-info">
              <AtmText weight="semibold">{deleteItem.item.name}</AtmText>
            </div>

            {/* Cascade impact warning — shift delete */}
            {deleteItem.type === 'shift' && deleteItem.impact?.willDeleteDays?.length > 0 && (
              <div className="templates-page__delete-cascade">
                <AtmText size="xs" weight="semibold" color="muted" className="templates-page__delete-cascade-title">
                  ⚠️ Este turno é o único em {deleteItem.impact.willDeleteDays.length} day template{deleteItem.impact.willDeleteDays.length !== 1 ? 's' : ''}, que também serão deletados:
                </AtmText>
                <ul className="templates-page__delete-cascade-list">
                  {deleteItem.impact.willDeleteDays.map((d) => <li key={d.id}>{d.name}</li>)}
                </ul>
                {deleteItem.impact.affectedWeeks?.length > 0 && (
                  <AtmText size="xs" color="muted">
                    E vai remover esses dias de {deleteItem.impact.affectedWeeks.length} week template{deleteItem.impact.affectedWeeks.length !== 1 ? 's' : ''}: {deleteItem.impact.affectedWeeks.map((w) => w.name).join(', ')}.
                  </AtmText>
                )}
              </div>
            )}
            {deleteItem.type === 'shift' && deleteItem.impact?.willDeleteWeeks?.length > 0 && (
              <div className="templates-page__delete-cascade">
                <AtmText size="xs" weight="semibold" color="muted" className="templates-page__delete-cascade-title">
                  ⚠️ {deleteItem.impact.willDeleteWeeks.length} week template{deleteItem.impact.willDeleteWeeks.length !== 1 ? 's' : ''} ficarão sem nenhum turno e também serão deletados:
                </AtmText>
                <ul className="templates-page__delete-cascade-list">
                  {deleteItem.impact.willDeleteWeeks.map((w) => <li key={w.id}>{w.name}</li>)}
                </ul>
              </div>
            )}
            {deleteItem.type === 'shift' && deleteItem.impact?.affectedDays?.length > 0 && deleteItem.impact.willDeleteDays.length === 0 && (
              <div className="templates-page__delete-cascade">
                <AtmText size="xs" color="muted">
                  ⚠️ Este turno será removido de {deleteItem.impact.affectedDays.length} day template{deleteItem.impact.affectedDays.length !== 1 ? 's' : ''}: {deleteItem.impact.affectedDays.map((d) => d.name).join(', ')}.
                </AtmText>
              </div>
            )}
            {/* Cascade impact warning — day delete */}
            {deleteItem.type === 'day' && deleteItem.impact?.affectedWeeks?.length > 0 && (
              <div className="templates-page__delete-cascade">
                <AtmText size="xs" color="muted">
                  ⚠️ Esse dia será removido de {deleteItem.impact.affectedWeeks.length} week template{deleteItem.impact.affectedWeeks.length !== 1 ? 's' : ''}: {deleteItem.impact.affectedWeeks.map((w) => w.name).join(', ')}.
                </AtmText>
              </div>
            )}

            <div className="templates-page__delete-modal-actions">
              <Button variant="secondary" size="lg" onClick={() => setDeleteItem(null)}>Cancelar</Button>
              <Button variant="danger" size="lg" onClick={handleDeleteConfirm}>
                <Trash2 size={16} />
                Deletar
              </Button>
            </div>
          </div>
        </ObjModal>
      )}
    </BaseLayout>
  );
}

export default TemplatesPage;

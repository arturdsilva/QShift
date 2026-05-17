import { useState, useEffect, useCallback, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   Shared DB connection (same as useIndexedDB — one DB, all stores)
───────────────────────────────────────────────────────────────────────── */
const DB_NAME = 'qshift-templates';
const DB_VERSION = 1;
const ALL_STORES = ['shifts', 'days', 'schedules'];

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      ALL_STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name))
          db.createObjectStore(name, { keyPath: 'id' });
      });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => { dbPromise = null; reject(e.target.error); };
  });
  return dbPromise;
}

const promisify = (req) =>
  new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });

const promisifyTx = (tx) =>
  new Promise((res, rej) => {
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */
/** True if a shift snapshot in a Day matches a Shift template record */
function shiftMatchesTpl(dayShift, tpl) {
  return (
    dayShift.name === tpl.name &&
    dayShift.start === tpl.start &&
    dayShift.end === tpl.end
  );
}

/**
 * One-time migration: add `dayTemplateId` to every day entry inside
 * existing Week records that were saved before this field existed.
 */
async function migrateWeekDayTemplateIds(db) {
  const tx = db.transaction(['days', 'schedules'], 'readwrite');
  const allDays   = await promisify(tx.objectStore('days').getAll());
  const allWeeks  = await promisify(tx.objectStore('schedules').getAll());

  let changed = false;
  for (const week of allWeeks) {
    let weekChanged = false;
    const updatedDays = (week.days || []).map((wd) => {
      // Already has the field (even if null) — skip
      if ('dayTemplateId' in wd) return wd;

      weekChanged = true;
      if (!wd.shifts || wd.shifts.length === 0)
        return { ...wd, dayTemplateId: null };

      // Try to match by shifts (heuristic: same length + same shift names in order)
      const match = allDays.find(
        (d) =>
          d.shifts?.length === wd.shifts.length &&
          d.shifts.every((ds, i) => ds.name === wd.shifts[i]?.name),
      );
      return { ...wd, dayTemplateId: match?.id ?? null };
    });

    if (weekChanged) {
      tx.objectStore('schedules').put({ ...week, days: updatedDays });
      changed = true;
    }
  }

  if (changed) await promisifyTx(tx);
}

/* ─────────────────────────────────────────────────────────────────────────
   useTemplateStore
───────────────────────────────────────────────────────────────────────── */
/**
 * Unified hook for the three template stores with:
 *  - Cascade propagation on edit/delete
 *  - Name-uniqueness validation per store
 *  - Impact-preview helpers for the confirmation modal
 *
 * Returns { shiftsDB, daysDB, schedulesDB, loading,
 *           getShiftDeleteImpact, getDayDeleteImpact }
 *
 * Each *DB object mirrors the useIndexedDB API:
 *   { items, add, update, remove }
 */
export function useTemplateStore() {
  const [shiftItems,  setShiftItems]  = useState([]);
  const [dayItems,    setDayItems]    = useState([]);
  const [weekItems,   setWeekItems]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  const dbRef = useRef(null);

  // Stable refs so callbacks never capture stale state
  const shiftRef = useRef([]);
  const dayRef   = useRef([]);
  const weekRef  = useRef([]);

  const syncShifts = (arr) => { shiftRef.current = arr; setShiftItems(arr); };
  const syncDays   = (arr) => { dayRef.current   = arr; setDayItems(arr);   };
  const syncWeeks  = (arr) => { weekRef.current  = arr; setWeekItems(arr);  };

  /* ── refresh all ───────────────────────────────────────────────────── */
  const refreshAll = useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;
    setLoading(true);
    try {
      const tx = db.transaction(ALL_STORES, 'readonly');
      const [s, d, w] = await Promise.all([
        promisify(tx.objectStore('shifts').getAll()),
        promisify(tx.objectStore('days').getAll()),
        promisify(tx.objectStore('schedules').getAll()),
      ]);
      syncShifts(s);
      syncDays(d);
      syncWeeks(w);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── name-uniqueness validators ────────────────────────────────────── */
  const validateName = useCallback((list, name, excludeId = null) => {
    const norm = name.trim().toLowerCase();
    const taken = list.some(
      (item) => item.name.trim().toLowerCase() === norm && item.id !== excludeId,
    );
    return taken ? `Um template com o nome "${name.trim()}" já existe.` : null;
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     SHIFTS
  ═══════════════════════════════════════════════════════════════════ */

  /** Returns info about what would cascade-delete if shiftId is removed. */
  const getShiftDeleteImpact = useCallback((shiftId) => {
    const shift = shiftRef.current.find((s) => s.id === shiftId);
    if (!shift) return null;

    const affectedDays = dayRef.current.filter((d) =>
      d.shifts?.some((s) => shiftMatchesTpl(s, shift)),
    );
    // Days that would become empty (and therefore auto-deleted)
    const willDeleteDays = affectedDays.filter(
      (d) => d.shifts.filter((s) => !shiftMatchesTpl(s, shift)).length === 0,
    );
    const deletedDayIds = new Set(willDeleteDays.map((d) => d.id));

    // Compute final state of each week to find those that become fully empty
    const willDeleteWeeks = weekRef.current.filter((w) => {
      const finalDays = (w.days || []).map((wd) => {
        if (deletedDayIds.has(wd.dayTemplateId)) return { shifts: [] };
        return { shifts: (wd.shifts || []).filter((s) => !shiftMatchesTpl(s, shift)) };
      });
      return !finalDays.some((wd) => (wd.shifts?.length ?? 0) > 0);
    });

    const willDeleteWeekIds = new Set(willDeleteWeeks.map((w) => w.id));
    // Weeks that are affected but NOT fully deleted
    const affectedWeeks = weekRef.current.filter(
      (w) => !willDeleteWeekIds.has(w.id) &&
        w.days?.some((wd) =>
          deletedDayIds.has(wd.dayTemplateId) ||
          wd.shifts?.some((s) => shiftMatchesTpl(s, shift)),
        ),
    );

    return { shift, affectedDays, willDeleteDays, affectedWeeks, willDeleteWeeks };
  }, []);


  const addShift = useCallback(async (item) => {
    const err = validateName(shiftRef.current, item.name);
    if (err) throw new Error(err);

    const db = dbRef.current;
    const record = { ...item, id: item.id ?? Date.now() };
    const tx = db.transaction(['shifts'], 'readwrite');
    tx.objectStore('shifts').add(record);
    await promisifyTx(tx);
    await refreshAll();
    return record;
  }, [validateName, refreshAll]);

  const updateShift = useCallback(async (item) => {
    const err = validateName(shiftRef.current, item.name, item.id);
    if (err) throw new Error(err);

    const db = dbRef.current;
    const oldShift = shiftRef.current.find((s) => s.id === item.id);
    if (!oldShift) return;

    // Days that embed this shift
    const affectedDays = dayRef.current.filter((d) =>
      d.shifts?.some((s) => shiftMatchesTpl(s, oldShift)),
    );

    const tx = db.transaction(ALL_STORES, 'readwrite');
    const shiftsStore    = tx.objectStore('shifts');
    const daysStore      = tx.objectStore('days');
    const schedulesStore = tx.objectStore('schedules');

    shiftsStore.put(item);

    // Track weeks already updated via day-template cascade
    const updatedWeekIds = new Set();

    for (const day of affectedDays) {
      const updatedShifts = day.shifts.map((s) =>
        shiftMatchesTpl(s, oldShift)
          ? { ...s, name: item.name, start: item.start, end: item.end, staff: item.staff, color: item.color }
          : s,
      );
      daysStore.put({ ...day, shifts: updatedShifts });

      // Propagate into weeks that reference this day via dayTemplateId
      const weeksForDay = weekRef.current.filter((w) =>
        w.days?.some((wd) => wd.dayTemplateId === day.id),
      );
      for (const week of weeksForDay) {
        const updatedWeekDays = week.days.map((wd) =>
          wd.dayTemplateId === day.id ? { ...wd, shifts: updatedShifts } : wd,
        );
        schedulesStore.put({ ...week, days: updatedWeekDays });
        updatedWeekIds.add(week.id);
      }
    }

    // Direct scan: update week day entries that embed this shift WITHOUT dayTemplateId
    // (weeks created in ShiftConfigPage store shifts directly, not through a day template)
    for (const week of weekRef.current) {
      if (updatedWeekIds.has(week.id)) continue; // already handled above
      let weekChanged = false;
      const updatedWeekDays = week.days.map((wd) => {
        if (!wd.shifts?.some((s) => shiftMatchesTpl(s, oldShift))) return wd;
        weekChanged = true;
        return {
          ...wd,
          shifts: wd.shifts.map((s) =>
            shiftMatchesTpl(s, oldShift)
              ? { ...s, name: item.name, start: item.start, end: item.end, staff: item.staff, color: item.color }
              : s,
          ),
        };
      });
      if (weekChanged) schedulesStore.put({ ...week, days: updatedWeekDays });
    }

    await promisifyTx(tx);
    await refreshAll();
  }, [validateName, refreshAll]);

  const removeShift = useCallback(async (shiftId) => {
    const db = dbRef.current;
    const shift = shiftRef.current.find((s) => s.id === shiftId);
    if (!shift) return;

    const affectedDays = dayRef.current.filter((d) =>
      d.shifts?.some((s) => shiftMatchesTpl(s, shift)),
    );

    const tx = db.transaction(ALL_STORES, 'readwrite');
    const shiftsStore    = tx.objectStore('shifts');
    const daysStore      = tx.objectStore('days');
    const schedulesStore = tx.objectStore('schedules');

    shiftsStore.delete(shiftId);

    // Track weeks already updated via day-template cascade
    const updatedWeekIds = new Set();

    for (const day of affectedDays) {
      const remaining = day.shifts.filter((s) => !shiftMatchesTpl(s, shift));

      if (remaining.length === 0) {
        // Day becomes empty → auto-delete
        daysStore.delete(day.id);
        // Null out this day in any weeks that reference it via dayTemplateId
        const weeksForDay = weekRef.current.filter((w) =>
          w.days?.some((wd) => wd.dayTemplateId === day.id),
        );
        for (const week of weeksForDay) {
          schedulesStore.put({
            ...week,
            days: week.days.map((wd) =>
              wd.dayTemplateId === day.id
                ? { ...wd, dayTemplateId: null, shifts: [] }
                : wd,
            ),
          });
          updatedWeekIds.add(week.id);
        }
      } else {
        // Day still has shifts → update it
        daysStore.put({ ...day, shifts: remaining });
        // Propagate into weeks via dayTemplateId
        const weeksForDay = weekRef.current.filter((w) =>
          w.days?.some((wd) => wd.dayTemplateId === day.id),
        );
        for (const week of weeksForDay) {
          schedulesStore.put({
            ...week,
            days: week.days.map((wd) =>
              wd.dayTemplateId === day.id ? { ...wd, shifts: remaining } : wd,
            ),
          });
          updatedWeekIds.add(week.id);
        }
      }
    }

    // Direct scan: remove this shift from week day entries that embed it WITHOUT dayTemplateId
    // (weeks created in ShiftConfigPage store shifts directly, not through a day template)
    for (const week of weekRef.current) {
      if (updatedWeekIds.has(week.id)) continue; // already handled above
      let weekChanged = false;
      const updatedWeekDays = week.days.map((wd) => {
        if (!wd.shifts?.some((s) => shiftMatchesTpl(s, shift))) return wd;
        weekChanged = true;
        return { ...wd, shifts: wd.shifts.filter((s) => !shiftMatchesTpl(s, shift)) };
      });
      if (weekChanged) {
        schedulesStore.put({ ...week, days: updatedWeekDays });
        updatedWeekIds.add(week.id);
      }
    }

    // Auto-delete weeks that ended up with no shifts in any day entry.
    // We read each potentially-affected week's current record from the store
    // (within the same transaction) to see its actual final state.
    const allWeekIds = weekRef.current.map((w) => w.id);
    for (const weekId of allWeekIds) {
      const record = await promisify(schedulesStore.get(weekId));
      if (!record) continue; // already deleted
      const hasAnyShift = (record.days || []).some((wd) => (wd.shifts?.length ?? 0) > 0);
      if (!hasAnyShift) schedulesStore.delete(weekId);
    }

    await promisifyTx(tx);
    await refreshAll();
  }, [refreshAll]);

  /* ═══════════════════════════════════════════════════════════════════
     DAYS
  ═══════════════════════════════════════════════════════════════════ */

  /** Returns info about what would be affected if dayId is removed. */
  const getDayDeleteImpact = useCallback((dayId) => {
    const day = dayRef.current.find((d) => d.id === dayId);
    if (!day) return null;

    const dayShifts = day.shifts || [];

    // Weeks linked via dayTemplateId (TemplatesPage)
    const linkedWeeks = weekRef.current.filter((w) =>
      w.days?.some((wd) => wd.dayTemplateId === dayId),
    );
    const linkedWeekIds = new Set(linkedWeeks.map((w) => w.id));

    // Weeks that embed this day's shifts directly (ShiftConfigPage)
    const directWeeks = dayShifts.length > 0
      ? weekRef.current.filter(
          (w) => !linkedWeekIds.has(w.id) &&
            w.days?.some((wd) =>
              dayShifts.some((ds) => (wd.shifts || []).some((ws) => shiftMatchesTpl(ws, ds))),
            ),
        )
      : [];

    const affectedWeeks = [...linkedWeeks, ...directWeeks];
    return { day, affectedWeeks };
  }, []);

  const addDay = useCallback(async (item) => {
    const err = validateName(dayRef.current, item.name);
    if (err) throw new Error(err);

    const db = dbRef.current;
    const record = { ...item, id: item.id ?? Date.now() };
    const tx = db.transaction(['days'], 'readwrite');
    tx.objectStore('days').add(record);
    await promisifyTx(tx);
    await refreshAll();
    return record;
  }, [validateName, refreshAll]);

  const updateDay = useCallback(async (item) => {
    const err = validateName(dayRef.current, item.name, item.id);
    if (err) throw new Error(err);

    const db = dbRef.current;
    const weeksForDay = weekRef.current.filter((w) =>
      w.days?.some((wd) => wd.dayTemplateId === item.id),
    );

    const tx = db.transaction(['days', 'schedules'], 'readwrite');
    tx.objectStore('days').put(item);

    for (const week of weeksForDay) {
      tx.objectStore('schedules').put({
        ...week,
        days: week.days.map((wd) =>
          wd.dayTemplateId === item.id ? { ...wd, shifts: item.shifts } : wd,
        ),
      });
    }

    await promisifyTx(tx);
    await refreshAll();
  }, [validateName, refreshAll]);

  const removeDay = useCallback(async (dayId) => {
    const db = dbRef.current;
    const day = dayRef.current.find((d) => d.id === dayId);

    const weeksForDay = weekRef.current.filter((w) =>
      w.days?.some((wd) => wd.dayTemplateId === dayId),
    );
    const weeksForDayIds = new Set(weeksForDay.map((w) => w.id));

    const tx = db.transaction(['days', 'schedules'], 'readwrite');
    const schedulesStore = tx.objectStore('schedules');

    tx.objectStore('days').delete(dayId);

    // Cascade via dayTemplateId (weeks from TemplatesPage)
    for (const week of weeksForDay) {
      schedulesStore.put({
        ...week,
        days: week.days.map((wd) =>
          wd.dayTemplateId === dayId
            ? { ...wd, dayTemplateId: null, shifts: [] }
            : wd,
        ),
      });
    }

    // Direct scan: remove the deleted day's shifts from week day entries that embed
    // them directly without dayTemplateId (weeks saved via ShiftConfigPage)
    const dayShifts = day?.shifts || [];
    if (dayShifts.length > 0) {
      for (const week of weekRef.current) {
        if (weeksForDayIds.has(week.id)) continue; // already handled above
        let weekChanged = false;
        const updatedWeekDays = week.days.map((wd) => {
          const hasAnyDayShift = dayShifts.some((dayShift) =>
            (wd.shifts || []).some((wdShift) => shiftMatchesTpl(wdShift, dayShift)),
          );
          if (!hasAnyDayShift) return wd;
          weekChanged = true;
          return {
            ...wd,
            shifts: (wd.shifts || []).filter(
              (wdShift) => !dayShifts.some((dayShift) => shiftMatchesTpl(wdShift, dayShift)),
            ),
          };
        });
        if (weekChanged) schedulesStore.put({ ...week, days: updatedWeekDays });
      }
    }

    // Auto-delete weeks that ended up with no shifts after this day was removed
    const allWeekIds = weekRef.current.map((w) => w.id);
    for (const weekId of allWeekIds) {
      const record = await promisify(schedulesStore.get(weekId));
      if (!record) continue;
      const hasAnyShift = (record.days || []).some((wd) => (wd.shifts?.length ?? 0) > 0);
      if (!hasAnyShift) schedulesStore.delete(weekId);

    }

    await promisifyTx(tx);
    await refreshAll();
  }, [refreshAll]);

  /* ═══════════════════════════════════════════════════════════════════
     WEEKS (schedules)
  ═══════════════════════════════════════════════════════════════════ */

  const addWeek = useCallback(async (item) => {
    const err = validateName(weekRef.current, item.name);
    if (err) throw new Error(err);

    const db = dbRef.current;
    const record = { ...item, id: item.id ?? Date.now() };
    const tx = db.transaction(['schedules'], 'readwrite');
    tx.objectStore('schedules').add(record);
    await promisifyTx(tx);
    await refreshAll();
    return record;
  }, [validateName, refreshAll]);

  const updateWeek = useCallback(async (item) => {
    const err = validateName(weekRef.current, item.name, item.id);
    if (err) throw new Error(err);

    const db = dbRef.current;
    const tx = db.transaction(['schedules'], 'readwrite');
    tx.objectStore('schedules').put(item);
    await promisifyTx(tx);
    await refreshAll();
  }, [validateName, refreshAll]);

  const removeWeek = useCallback(async (id) => {
    const db = dbRef.current;
    const tx = db.transaction(['schedules'], 'readwrite');
    tx.objectStore('schedules').delete(id);
    await promisifyTx(tx);
    await refreshAll();
  }, [refreshAll]);

  /* ═══════════════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await getDB();
        if (cancelled) return;
        dbRef.current = db;
        await refreshAll();
        // Migrate existing week records to include dayTemplateId
        if (!cancelled) {
          await migrateWeekDayTemplateIds(db);
          await refreshAll();
        }
      } catch (err) {
        console.error('[useTemplateStore] init error:', err);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshAll]);

  /* ─────────────────────────────────────────────────────────────────── */
  return {
    loading,
    shiftsDB: {
      items:  shiftItems,
      add:    addShift,
      update: updateShift,
      remove: removeShift,
    },
    daysDB: {
      items:  dayItems,
      add:    addDay,
      update: updateDay,
      remove: removeDay,
    },
    schedulesDB: {
      items:  weekItems,
      add:    addWeek,
      update: updateWeek,
      remove: removeWeek,
    },
    // Impact-preview helpers (used by delete confirmation modal)
    getShiftDeleteImpact,
    getDayDeleteImpact,
    // Name validators (used for inline error in forms)
    validateShiftName: (name, excludeId) => validateName(shiftRef.current, name, excludeId),
    validateDayName:   (name, excludeId) => validateName(dayRef.current,   name, excludeId),
    validateWeekName:  (name, excludeId) => validateName(weekRef.current,  name, excludeId),
  };
}

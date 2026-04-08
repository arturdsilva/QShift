import { useState, useEffect, useCallback, useRef } from 'react';

const DB_NAME = 'qshift-templates';
const DB_VERSION = 1;
const ALL_STORES = ['shifts', 'days', 'schedules'];

/**
 * Shared DB connection — IndexedDB requires all stores to be created in
 * the same `onupgradeneeded` handler, so we open one DB with all three stores.
 */
let dbInstance = null;
let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      ALL_STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      dbPromise = null;
      reject(e.target.error);
    };
  });

  return dbPromise;
}

const promisify = (req) =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

/**
 * useIndexedDB – hook for CRUD on a single store inside the shared DB.
 *
 * @param {'shifts'|'days'|'schedules'} storeName
 * @returns {{ items, loading, add, update, remove, clear, refresh }}
 */
export function useIndexedDB(storeName) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const dbRef = useRef(null);

  /* ── helpers ─────────────────────────────────────────── */
  const tx = useCallback(
    (mode = 'readonly') => {
      const db = dbRef.current;
      if (!db) throw new Error('DB not open');
      return db.transaction(storeName, mode).objectStore(storeName);
    },
    [storeName],
  );

  const getAll = useCallback(async () => {
    const store = tx('readonly');
    return promisify(store.getAll());
  }, [tx]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAll();
      setItems(all);
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  /* ── CRUD ────────────────────────────────────────────── */
  const add = useCallback(
    async (item) => {
      const record = { ...item, id: item.id ?? Date.now() };
      const store = tx('readwrite');
      await promisify(store.add(record));
      await refresh();
      return record;
    },
    [tx, refresh],
  );

  const update = useCallback(
    async (item) => {
      const store = tx('readwrite');
      await promisify(store.put(item));
      await refresh();
    },
    [tx, refresh],
  );

  const remove = useCallback(
    async (id) => {
      const store = tx('readwrite');
      await promisify(store.delete(id));
      await refresh();
    },
    [tx, refresh],
  );

  const clear = useCallback(async () => {
    const store = tx('readwrite');
    await promisify(store.clear());
    await refresh();
  }, [tx, refresh]);

  /* ── init ────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await getDB();
        if (cancelled) return;
        dbRef.current = db;
        await refresh();
      } catch (err) {
        console.error(`[useIndexedDB] Error opening store "${storeName}":`, err);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [storeName, refresh]);

  return { items, loading, add, update, remove, clear, refresh };
}

import { useCallback, useRef, useState } from 'react';

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

type Options<T> = {
  limit?: number;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  storageKey?: string;
};

export function useHistoryState<T>(
  initial: T,
  { limit = 7, serialize, deserialize, storageKey }: Options<T> = {}
) {
  const initializerRef = useRef(initial);
  const loadInitial = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') {
      return initializerRef.current;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return initializerRef.current;
    }

    try {
      return deserialize ? deserialize(stored) : (JSON.parse(stored) as T);
    } catch (error) {
      console.warn('Failed to parse stored tracker state, resetting.', error);
      return initializerRef.current;
    }
  }, [deserialize, storageKey]);

  const [{ past, present, future }, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: loadInitial(),
    future: [],
  });

  const persist = useCallback(
    (value: T) => {
      if (!storageKey || typeof window === 'undefined') return;
      try {
        const raw = serialize ? serialize(value) : JSON.stringify(value);
        window.localStorage.setItem(storageKey, raw);
      } catch (error) {
        console.warn('Unable to persist tracker state.', error);
      }
    },
    [serialize, storageKey]
  );

  const update = useCallback(
    (value: T | ((prev: T) => T)) => {
      setHistory((current) => {
        const resolved = value instanceof Function ? value(current.present) : value;
        const newPast = [...current.past, current.present].slice(-limit);
        const snapshot = {
          past: newPast,
          present: resolved,
          future: [],
        } satisfies HistoryState<T>;
        persist(resolved);
        return snapshot;
      });
    },
    [limit, persist]
  );

  const undo = useCallback(() => {
    setHistory((current) => {
      if (!current.past.length) return current;
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);
      const snapshot = {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future].slice(0, limit),
      } satisfies HistoryState<T>;
      persist(previous);
      return snapshot;
    });
  }, [limit, persist]);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (!current.future.length) return current;
      const next = current.future[0];
      const snapshot = {
        past: [...current.past, current.present].slice(-limit),
        present: next,
        future: current.future.slice(1),
      } satisfies HistoryState<T>;
      persist(next);
      return snapshot;
    });
  }, [limit, persist]);

  return {
    state: present,
    setState: update,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  } as const;
}

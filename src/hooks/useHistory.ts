import { useCallback, useRef, useState } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

const LIMIT = 100;
/** Edits closer together than this are merged into one undo step. */
const COALESCE_MS = 800;

export function useHistory<T>(initial: T) {
  const [h, setH] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  });
  const lastEdit = useRef(0);

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    const now = Date.now();
    const coalesce = now - lastEdit.current < COALESCE_MS;
    lastEdit.current = now;
    setH((cur) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: T) => T)(cur.present)
          : updater;
      if (next === cur.present) return cur;
      const past = coalesce
        ? cur.past
        : [...cur.past, cur.present].slice(-LIMIT);
      return { past, present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    lastEdit.current = 0;
    setH((cur) => {
      if (!cur.past.length) return cur;
      const previous = cur.past[cur.past.length - 1];
      return {
        past: cur.past.slice(0, -1),
        present: previous,
        future: [cur.present, ...cur.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    lastEdit.current = 0;
    setH((cur) => {
      if (!cur.future.length) return cur;
      const [next, ...rest] = cur.future;
      return { past: [...cur.past, cur.present], present: next, future: rest };
    });
  }, []);

  const reset = useCallback((value: T) => {
    lastEdit.current = 0;
    setH({ past: [], present: value, future: [] });
  }, []);

  return {
    state: h.present,
    set,
    undo,
    redo,
    reset,
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
  };
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

type PerformedSetValues = Record<string, (number | null)[]>;

interface WorkoutState {
  activeSessionId: string | null;
  activeTableId: string | null;
  startedAtMs: number | null;
  performedSets: PerformedSetValues;

  startSession: (sessionId: string, tableId?: string | null) => void;
  setPerformedValue: (exerciseId: string, setIndex: number, value: number) => void;
  resetPerformedSets: () => void;
  endSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      activeTableId: null,
      startedAtMs: null,
      performedSets: {},

      startSession: (sessionId, tableId = null) =>
        set({
          activeSessionId: sessionId,
          activeTableId: tableId,
          startedAtMs: Date.now(),
          performedSets: {},
        }),

      setPerformedValue: (exerciseId, setIndex, value) =>
        set((state) => {
          const arr = [...(state.performedSets[exerciseId] ?? [])];
          arr[setIndex] = value;
          return { performedSets: { ...state.performedSets, [exerciseId]: arr } };
        }),

      resetPerformedSets: () => set({ performedSets: {} }),

      endSession: () =>
        set({
          activeSessionId: null,
          activeTableId: null,
          startedAtMs: null,
          performedSets: {},
        }),
    }),
    {
      name: 'caliapp.workout',
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        activeTableId: state.activeTableId,
        startedAtMs: state.startedAtMs,
        performedSets: state.performedSets,
      }),
    }
  )
);

/**
 * Recomputes elapsed seconds from `startedAtMs` every second.
 * Survives refresh because `startedAtMs` is persisted.
 */
export function useElapsedSeconds(): number {
  const startedAtMs = useWorkoutStore((s) => s.startedAtMs);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAtMs) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAtMs]);

  if (!startedAtMs) return 0;
  return Math.max(0, Math.floor((now - startedAtMs) / 1000));
}
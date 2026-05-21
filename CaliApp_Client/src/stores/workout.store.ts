import { create } from 'zustand';

interface WorkoutState {
  activeSessionId: string | null;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  startedAt: number | null;
  intervalId: ReturnType<typeof setInterval> | null;
  startSession: (sessionId: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  endSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSessionId: null,
  elapsedSeconds: 0,
  isTimerRunning: false,
  startedAt: null,
  intervalId: null,
  startSession: (sessionId) => {
    set({ activeSessionId: sessionId, elapsedSeconds: 0 });
    get().startTimer();
  },
  startTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    const newInterval = setInterval(() => {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
    }, 1000);
    set({ isTimerRunning: true, startedAt: Date.now(), intervalId: newInterval });
  },
  stopTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isTimerRunning: false, intervalId: null });
  },
  resetTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ elapsedSeconds: 0, isTimerRunning: false, intervalId: null, startedAt: null });
  },
  endSession: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      activeSessionId: null,
      elapsedSeconds: 0,
      isTimerRunning: false,
      startedAt: null,
      intervalId: null,
    });
  },
}));

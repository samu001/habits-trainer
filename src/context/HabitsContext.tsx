import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { parseBackup } from '../lib/backup';
import { getWeekId } from '../lib/dates';
import { hapticSuccess, hapticWarning } from '../lib/haptics';
import { createHabitGoal, validateCreateHabitInput } from '../lib/habits';
import { computeWeeklyLoad, deriveHabitStatus } from '../lib/load';
import {
  applyWeekEvaluation,
  type WeekEvaluationResult,
} from '../lib/progression';
import {
  buildWeeklyProgress,
  createSessionLog,
} from '../lib/prescription';
import { syncHabitReminders } from '../lib/reminders';
import { normalizeSchedule, syncScheduleToFrequency } from '../lib/schedule';
import {
  loadHabits,
  loadLogs,
  loadOnboardingSeen,
  saveHabits,
  saveLogs,
  saveOnboardingSeen,
} from '../lib/storage';
import type {
  CreateHabitInput,
  HabitGoal,
  HabitSchedule,
  HabitStatus,
  WeeklyReflection,
} from '../types/habit';
import type {
  LogSessionInput,
  SessionLog,
  WeeklyProgress,
} from '../types/logging';

type HabitsContextValue = {
  habits: HabitGoal[];
  logs: SessionLog[];
  isLoading: boolean;
  error: string | null;
  hasSeenOnboarding: boolean;
  addHabit: (input: CreateHabitInput) => Promise<HabitGoal>;
  deleteHabit: (id: string) => Promise<void>;
  getHabit: (id: string) => HabitGoal | undefined;
  getLogsForHabit: (habitId: string) => SessionLog[];
  getWeeklyProgress: (habitId: string, now?: Date) => WeeklyProgress | null;
  logSession: (input: LogSessionInput) => Promise<SessionLog>;
  deleteLog: (logId: string) => Promise<void>;
  setHoldLevel: (habitId: string, holdLevel: boolean) => Promise<void>;
  setHabitStatus: (habitId: string, status: HabitStatus) => Promise<void>;
  updateSchedule: (
    habitId: string,
    schedule: Partial<HabitSchedule>,
  ) => Promise<void>;
  evaluateWeek: (
    habitId: string,
    weekId?: string,
    reflection?: WeeklyReflection,
  ) => Promise<WeekEvaluationResult>;
  restoreBackup: (raw: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refresh: () => Promise<void>;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<HabitGoal[]>([]);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  const persistHabits = useCallback(async (next: HabitGoal[]) => {
    setHabits(next);
    await saveHabits(next);
    try {
      await syncHabitReminders(next);
    } catch {
      // Reminder sync should never block core persistence.
    }
  }, []);

  const persistLogs = useCallback(async (next: SessionLog[]) => {
    setLogs(next);
    await saveLogs(next);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [storedHabits, storedLogs, onboardingSeen] = await Promise.all([
        loadHabits(),
        loadLogs(),
        loadOnboardingSeen(),
      ]);
      setHabits(storedHabits);
      setLogs(storedLogs);
      setHasSeenOnboarding(onboardingSeen);
      try {
        await syncHabitReminders(storedHabits);
      } catch {
        // Ignore reminder permission failures on boot.
      }
    } catch {
      setError('Could not load your habits.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addHabit = useCallback(
    async (input: CreateHabitInput) => {
      const validationError = validateCreateHabitInput(input);
      if (validationError) {
        throw new Error(validationError);
      }

      const habit = createHabitGoal(input);
      const next = [habit, ...habits];
      await persistHabits(next);
      await hapticSuccess();
      return habit;
    },
    [habits, persistHabits],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      const nextHabits = habits.filter((habit) => habit.id !== id);
      const nextLogs = logs.filter((log) => log.habitId !== id);
      await Promise.all([persistHabits(nextHabits), persistLogs(nextLogs)]);
    },
    [habits, logs, persistHabits, persistLogs],
  );

  const getHabit = useCallback(
    (id: string) => habits.find((habit) => habit.id === id),
    [habits],
  );

  const getLogsForHabit = useCallback(
    (habitId: string) =>
      logs
        .filter((log) => log.habitId === habitId)
        .sort(
          (a, b) =>
            new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
        ),
    [logs],
  );

  const getWeeklyProgress = useCallback(
    (habitId: string, now: Date = new Date()) => {
      const habit = habits.find((item) => item.id === habitId);
      if (!habit) {
        return null;
      }
      return buildWeeklyProgress(habit, logs, now);
    },
    [habits, logs],
  );

  const logSession = useCallback(
    async (input: LogSessionInput) => {
      const habit = habits.find((item) => item.id === input.habitId);
      if (!habit) {
        throw new Error('Habit not found.');
      }
      if (habit.status === 'paused' || habit.status === 'archived') {
        throw new Error('Resume this habit before logging sessions.');
      }

      const log = createSessionLog(input, habit.current.durationMinutes);
      const next = [log, ...logs];
      await persistLogs(next);
      if (log.result === 'skipped') {
        await hapticWarning();
      } else {
        await hapticSuccess();
      }
      return log;
    },
    [habits, logs, persistLogs],
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      const next = logs.filter((log) => log.id !== logId);
      await persistLogs(next);
    },
    [logs, persistLogs],
  );

  const setHoldLevel = useCallback(
    async (habitId: string, holdLevel: boolean) => {
      const next = habits.map((habit) =>
        habit.id === habitId ? { ...habit, holdLevel } : habit,
      );
      await persistHabits(next);
    },
    [habits, persistHabits],
  );

  const setHabitStatus = useCallback(
    async (habitId: string, status: HabitStatus) => {
      const next = habits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        if (status === 'paused' || status === 'archived') {
          return { ...habit, status };
        }

        const resumed = { ...habit, status: 'building' as const };
        return {
          ...resumed,
          status: deriveHabitStatus(resumed),
        };
      });
      await persistHabits(next);
    },
    [habits, persistHabits],
  );

  const updateSchedule = useCallback(
    async (habitId: string, schedule: Partial<HabitSchedule>) => {
      const next = habits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }
        const merged = normalizeSchedule(
          { ...habit.schedule, ...schedule },
          habit.current.frequencyPerWeek,
        );
        return {
          ...habit,
          schedule: syncScheduleToFrequency(merged, habit.current),
        };
      });
      await persistHabits(next);
    },
    [habits, persistHabits],
  );

  const evaluateWeek = useCallback(
    async (
      habitId: string,
      weekId?: string,
      reflection?: WeeklyReflection,
    ) => {
      const habit = habits.find((item) => item.id === habitId);
      if (!habit) {
        throw new Error('Habit not found.');
      }

      const targetWeekId = weekId ?? getWeekId();
      const result = applyWeekEvaluation(
        habit,
        logs,
        targetWeekId,
        new Date(),
        reflection,
      );
      const next = habits.map((item) =>
        item.id === habitId ? result.habit : item,
      );
      await persistHabits(next);
      if (result.decision.action === 'level_up') {
        await hapticSuccess();
      } else if (result.decision.action === 'downshift') {
        await hapticWarning();
      }
      return result;
    },
    [habits, logs, persistHabits],
  );

  const restoreBackup = useCallback(
    async (raw: string) => {
      const backup = parseBackup(raw);
      await Promise.all([
        persistHabits(backup.habits),
        persistLogs(backup.logs),
      ]);
    },
    [persistHabits, persistLogs],
  );

  const completeOnboarding = useCallback(async () => {
    setHasSeenOnboarding(true);
    await saveOnboardingSeen(true);
  }, []);

  const value = useMemo(
    () => ({
      habits,
      logs,
      isLoading,
      error,
      hasSeenOnboarding,
      addHabit,
      deleteHabit,
      getHabit,
      getLogsForHabit,
      getWeeklyProgress,
      logSession,
      deleteLog,
      setHoldLevel,
      setHabitStatus,
      updateSchedule,
      evaluateWeek,
      restoreBackup,
      completeOnboarding,
      refresh,
    }),
    [
      habits,
      logs,
      isLoading,
      error,
      hasSeenOnboarding,
      addHabit,
      deleteHabit,
      getHabit,
      getLogsForHabit,
      getWeeklyProgress,
      logSession,
      deleteLog,
      setHoldLevel,
      setHabitStatus,
      updateSchedule,
      evaluateWeek,
      restoreBackup,
      completeOnboarding,
      refresh,
    ],
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitsProvider');
  }
  return context;
}

export function useWeeklyLoad() {
  const { habits } = useHabits();
  return useMemo(() => computeWeeklyLoad(habits), [habits]);
}

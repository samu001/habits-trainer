import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createHabitGoal, validateCreateHabitInput } from '../lib/habits';
import { loadHabits, saveHabits } from '../lib/storage';
import type { CreateHabitInput, HabitGoal } from '../types/habit';

type HabitsContextValue = {
  habits: HabitGoal[];
  isLoading: boolean;
  error: string | null;
  addHabit: (input: CreateHabitInput) => Promise<HabitGoal>;
  deleteHabit: (id: string) => Promise<void>;
  getHabit: (id: string) => HabitGoal | undefined;
  refresh: () => Promise<void>;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<HabitGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const stored = await loadHabits();
      setHabits(stored);
    } catch {
      setError('Could not load your habits.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(async (next: HabitGoal[]) => {
    setHabits(next);
    await saveHabits(next);
  }, []);

  const addHabit = useCallback(
    async (input: CreateHabitInput) => {
      const validationError = validateCreateHabitInput(input);
      if (validationError) {
        throw new Error(validationError);
      }

      const habit = createHabitGoal(input);
      const next = [habit, ...habits];
      await persist(next);
      return habit;
    },
    [habits, persist],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      const next = habits.filter((habit) => habit.id !== id);
      await persist(next);
    },
    [habits, persist],
  );

  const getHabit = useCallback(
    (id: string) => habits.find((habit) => habit.id === id),
    [habits],
  );

  const value = useMemo(
    () => ({
      habits,
      isLoading,
      error,
      addHabit,
      deleteHabit,
      getHabit,
      refresh,
    }),
    [habits, isLoading, error, addHabit, deleteHabit, getHabit, refresh],
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

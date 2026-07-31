import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HabitGoal } from '../types/habit';

const HABITS_KEY = 'habits-trainer/habits/v1';

function isHabitLevel(value: unknown): value is HabitGoal['target'] {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const level = value as Record<string, unknown>;
  return (
    typeof level.frequencyPerWeek === 'number' &&
    typeof level.durationMinutes === 'number'
  );
}

function isHabitGoal(value: unknown): value is HabitGoal {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const habit = value as Record<string, unknown>;
  return (
    typeof habit.id === 'string' &&
    typeof habit.title === 'string' &&
    isHabitLevel(habit.target) &&
    isHabitLevel(habit.start) &&
    isHabitLevel(habit.current) &&
    (habit.pace === 'gentle' ||
      habit.pace === 'steady' ||
      habit.pace === 'ambitious') &&
    typeof habit.createdAt === 'string'
  );
}

export async function loadHabits(): Promise<HabitGoal[]> {
  const raw = await AsyncStorage.getItem(HABITS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isHabitGoal);
  } catch {
    return [];
  }
}

export async function saveHabits(habits: HabitGoal[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

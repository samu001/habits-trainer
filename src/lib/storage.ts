import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeHabitGoal } from './progression';
import type { HabitGoal, HabitLevel } from '../types/habit';
import type { SessionLog, SessionResult } from '../types/logging';

const HABITS_KEY = 'habits-trainer/habits/v1';
const LOGS_KEY = 'habits-trainer/logs/v1';
const ONBOARDING_KEY = 'habits-trainer/onboarding/v1';

function isHabitLevel(value: unknown): value is HabitLevel {
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

function isSessionResult(value: unknown): value is SessionResult {
  return value === 'completed' || value === 'partial' || value === 'skipped';
}

function isSessionLog(value: unknown): value is SessionLog {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const log = value as Record<string, unknown>;
  return (
    typeof log.id === 'string' &&
    typeof log.habitId === 'string' &&
    typeof log.loggedAt === 'string' &&
    typeof log.weekId === 'string' &&
    isSessionResult(log.result) &&
    typeof log.prescribedMinutes === 'number' &&
    typeof log.minutesDone === 'number' &&
    typeof log.credit === 'number' &&
    (log.note === undefined || typeof log.note === 'string')
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
    return parsed.filter(isHabitGoal).map(normalizeHabitGoal);
  } catch {
    return [];
  }
}

export async function saveHabits(habits: HabitGoal[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function loadLogs(): Promise<SessionLog[]> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isSessionLog);
  } catch {
    return [];
  }
}

export async function saveLogs(logs: SessionLog[]): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export async function loadOnboardingSeen(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  return raw === 'true';
}

export async function saveOnboardingSeen(seen: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, seen ? 'true' : 'false');
}

import { levelsEqual } from './habits';
import {
  MAX_RECOMMENDED_BUILDING_HABITS,
  WEEKLY_MINUTE_LOAD_WARN,
  WEEKLY_SESSION_LOAD_WARN,
  type HabitGoal,
  type HabitStatus,
} from '../types/habit';

export type WeeklyLoadSummary = {
  activeHabits: HabitGoal[];
  buildingHabits: HabitGoal[];
  maintainingHabits: HabitGoal[];
  pausedHabits: HabitGoal[];
  archivedHabits: HabitGoal[];
  totalSessions: number;
  totalMinutes: number;
  warnings: string[];
  isBuildingAtCapacity: boolean;
  sequencingTip: string | null;
};

export function deriveHabitStatus(habit: HabitGoal): HabitStatus {
  if (habit.status === 'paused' || habit.status === 'archived') {
    return habit.status;
  }

  if (levelsEqual(habit.current, habit.target)) {
    return 'maintaining';
  }

  return 'building';
}

export function isHabitActive(habit: HabitGoal): boolean {
  const status = deriveHabitStatus(habit);
  return status === 'building' || status === 'maintaining';
}

export function computeWeeklyLoad(habits: HabitGoal[]): WeeklyLoadSummary {
  const buildingHabits = habits.filter(
    (habit) => deriveHabitStatus(habit) === 'building',
  );
  const maintainingHabits = habits.filter(
    (habit) => deriveHabitStatus(habit) === 'maintaining',
  );
  const pausedHabits = habits.filter((habit) => habit.status === 'paused');
  const archivedHabits = habits.filter((habit) => habit.status === 'archived');
  const activeHabits = [...buildingHabits, ...maintainingHabits];

  const totalSessions = activeHabits.reduce(
    (sum, habit) => sum + habit.current.frequencyPerWeek,
    0,
  );
  const totalMinutes = activeHabits.reduce(
    (sum, habit) =>
      sum + habit.current.frequencyPerWeek * habit.current.durationMinutes,
    0,
  );

  const warnings: string[] = [];
  if (buildingHabits.length > MAX_RECOMMENDED_BUILDING_HABITS) {
    warnings.push(
      `You have ${buildingHabits.length} building habits. Most people do better with ${MAX_RECOMMENDED_BUILDING_HABITS} or fewer.`,
    );
  }
  if (totalSessions > WEEKLY_SESSION_LOAD_WARN) {
    warnings.push(
      `This week asks for ${totalSessions} sessions. Consider pausing one habit.`,
    );
  }
  if (totalMinutes > WEEKLY_MINUTE_LOAD_WARN) {
    warnings.push(
      `This week totals about ${totalMinutes} minutes. That’s a heavy load — protect recovery.`,
    );
  }

  let sequencingTip: string | null = null;
  if (buildingHabits.length >= 2) {
    const [first, second] = buildingHabits;
    sequencingTip = `Tip: lock in “${first!.title}” before pushing hard on “${second!.title}”.`;
  } else if (buildingHabits.length === 0 && maintainingHabits.length > 0) {
    sequencingTip =
      'Nice base. Add a new building habit only if your current ones feel easy.';
  }

  return {
    activeHabits,
    buildingHabits,
    maintainingHabits,
    pausedHabits,
    archivedHabits,
    totalSessions,
    totalMinutes,
    warnings,
    isBuildingAtCapacity:
      buildingHabits.length >= MAX_RECOMMENDED_BUILDING_HABITS,
    sequencingTip,
  };
}

export function formatHabitStatus(status: HabitStatus): string {
  switch (status) {
    case 'building':
      return 'Building';
    case 'maintaining':
      return 'Maintaining';
    case 'paused':
      return 'Paused';
    case 'archived':
      return 'Archived';
  }
}

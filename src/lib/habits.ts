import type { CreateHabitInput, HabitGoal, HabitLevel, HabitPace } from '../types/habit';

export function formatLevel(level: HabitLevel): string {
  const times = `${level.frequencyPerWeek}× / week`;
  const duration = `${level.durationMinutes} min`;
  return `${times} · ${duration}`;
}

export function formatPace(pace: HabitPace): string {
  switch (pace) {
    case 'gentle':
      return 'Gentle';
    case 'steady':
      return 'Steady';
    case 'ambitious':
      return 'Ambitious';
  }
}

export function isLevelSmaller(start: HabitLevel, target: HabitLevel): boolean {
  const smallerFrequency = start.frequencyPerWeek < target.frequencyPerWeek;
  const smallerDuration = start.durationMinutes < target.durationMinutes;
  const notLargerAnywhere =
    start.frequencyPerWeek <= target.frequencyPerWeek &&
    start.durationMinutes <= target.durationMinutes;

  return notLargerAnywhere && (smallerFrequency || smallerDuration);
}

export function levelsEqual(a: HabitLevel, b: HabitLevel): boolean {
  return (
    a.frequencyPerWeek === b.frequencyPerWeek &&
    a.durationMinutes === b.durationMinutes
  );
}

export function progressTowardTarget(habit: HabitGoal): number {
  const startScore =
    habit.start.frequencyPerWeek * habit.start.durationMinutes;
  const currentScore =
    habit.current.frequencyPerWeek * habit.current.durationMinutes;
  const targetScore =
    habit.target.frequencyPerWeek * habit.target.durationMinutes;

  if (targetScore <= startScore) {
    return levelsEqual(habit.current, habit.target) ? 1 : 0;
  }

  const raw = (currentScore - startScore) / (targetScore - startScore);
  return Math.min(1, Math.max(0, raw));
}

export function validateCreateHabitInput(
  input: CreateHabitInput,
): string | null {
  const title = input.title.trim();

  if (!title) {
    return 'Give your habit a name.';
  }

  if (title.length > 60) {
    return 'Keep the habit name under 60 characters.';
  }

  if (
    input.target.frequencyPerWeek < 1 ||
    input.target.frequencyPerWeek > 7 ||
    input.start.frequencyPerWeek < 1 ||
    input.start.frequencyPerWeek > 7
  ) {
    return 'Frequency must be between 1 and 7 times per week.';
  }

  if (
    input.target.durationMinutes < 1 ||
    input.start.durationMinutes < 1
  ) {
    return 'Duration must be at least 1 minute.';
  }

  if (!isLevelSmaller(input.start, input.target)) {
    return 'Start smaller than your target on frequency and/or duration.';
  }

  return null;
}

export function createHabitGoal(input: CreateHabitInput): HabitGoal {
  const title = input.title.trim();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    target: { ...input.target },
    start: { ...input.start },
    current: { ...input.start },
    pace: input.pace,
    createdAt: new Date().toISOString(),
  };
}

export function suggestStartFromTarget(target: HabitLevel): HabitLevel {
  return {
    frequencyPerWeek: Math.max(1, Math.min(2, Math.ceil(target.frequencyPerWeek / 3))),
    durationMinutes: Math.max(
      5,
      Math.min(15, Math.round(target.durationMinutes / 4 / 5) * 5),
    ),
  };
}

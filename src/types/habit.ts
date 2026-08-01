export type HabitPace = 'gentle' | 'steady' | 'ambitious';

export type HabitLevel = {
  frequencyPerWeek: number;
  durationMinutes: number;
};

export type ProgressionAction = 'level_up' | 'hold' | 'downshift' | 'maintain';

export type ProgressionEvent = {
  id: string;
  weekId: string;
  action: ProgressionAction;
  completionRate: number;
  from: HabitLevel;
  to: HabitLevel;
  message: string;
  createdAt: string;
};

export type HabitGoal = {
  id: string;
  title: string;
  target: HabitLevel;
  start: HabitLevel;
  current: HabitLevel;
  pace: HabitPace;
  createdAt: string;
  /** When true, strong weeks will not level up. */
  holdLevel: boolean;
  /** Consecutive strong weeks (>= 80%) at the current level. */
  strongWeeksAtLevel: number;
  /** Consecutive weak weeks (< 50%) used for downshifts. */
  consecutiveLowWeeks: number;
  /** Prevents evaluating the same week twice. */
  lastEvaluatedWeekId?: string;
  progressionHistory: ProgressionEvent[];
};

export type CreateHabitInput = {
  title: string;
  target: HabitLevel;
  start: HabitLevel;
  pace: HabitPace;
};

export const PACE_OPTIONS: {
  value: HabitPace;
  label: string;
  description: string;
}[] = [
  {
    value: 'gentle',
    label: 'Gentle',
    description: 'Slower increases. Best if you want sustainability first.',
  },
  {
    value: 'steady',
    label: 'Steady',
    description: 'Balanced progression. A good default for most habits.',
  },
  {
    value: 'ambitious',
    label: 'Ambitious',
    description: 'Faster ramp-up once you prove consistency.',
  },
];

export type HabitPace = 'gentle' | 'steady' | 'ambitious';

export type HabitStatus = 'building' | 'maintaining' | 'paused' | 'archived';

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
  reflection?: WeeklyReflection;
};

export type ReflectionIntention = 'keep' | 'hold' | 'adjust';

export type WeeklyReflection = {
  wentWell: string;
  intention: ReflectionIntention;
};

/** JS Date.getDay() values: 0 Sunday … 6 Saturday */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitSchedule = {
  remindersEnabled: boolean;
  preferredDays: WeekdayIndex[];
  hour: number;
  minute: number;
};

export type HabitGoal = {
  id: string;
  title: string;
  target: HabitLevel;
  start: HabitLevel;
  current: HabitLevel;
  pace: HabitPace;
  createdAt: string;
  status: HabitStatus;
  schedule: HabitSchedule;
  /** When true, strong weeks will not level up. */
  holdLevel: boolean;
  /** Consecutive strong weeks (>= 80%) at the current level. */
  strongWeeksAtLevel: number;
  /** Consecutive weak weeks (< 50%) used for downshifts. */
  consecutiveLowWeeks: number;
  /** Weeks spent at target while maintaining. */
  weeksAtTarget: number;
  /** Prevents evaluating the same week twice. */
  lastEvaluatedWeekId?: string;
  progressionHistory: ProgressionEvent[];
};

export type CreateHabitInput = {
  title: string;
  target: HabitLevel;
  start: HabitLevel;
  pace: HabitPace;
  schedule?: Partial<HabitSchedule>;
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

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const MAX_RECOMMENDED_BUILDING_HABITS = 3;
export const WEEKLY_SESSION_LOAD_WARN = 12;
export const WEEKLY_MINUTE_LOAD_WARN = 300;

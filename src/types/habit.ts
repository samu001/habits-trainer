export type HabitPace = 'gentle' | 'steady' | 'ambitious';

export type HabitLevel = {
  frequencyPerWeek: number;
  durationMinutes: number;
};

export type HabitGoal = {
  id: string;
  title: string;
  target: HabitLevel;
  start: HabitLevel;
  current: HabitLevel;
  pace: HabitPace;
  createdAt: string;
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

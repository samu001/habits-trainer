import type { CreateHabitInput, HabitPace } from '../types/habit';

export type HabitTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  pace: HabitPace;
  target: CreateHabitInput['target'];
  start: CreateHabitInput['start'];
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'fitness',
    title: 'Work out',
    category: 'Fitness',
    description: 'Build from short sessions to a full weekly training habit.',
    pace: 'steady',
    target: { frequencyPerWeek: 5, durationMinutes: 60 },
    start: { frequencyPerWeek: 2, durationMinutes: 15 },
  },
  {
    id: 'reading',
    title: 'Read',
    category: 'Reading',
    description: 'Grow a daily reading practice without forcing marathon sessions.',
    pace: 'gentle',
    target: { frequencyPerWeek: 7, durationMinutes: 30 },
    start: { frequencyPerWeek: 3, durationMinutes: 10 },
  },
  {
    id: 'meditation',
    title: 'Meditate',
    category: 'Meditation',
    description: 'Start tiny, stay consistent, then deepen the practice.',
    pace: 'gentle',
    target: { frequencyPerWeek: 7, durationMinutes: 20 },
    start: { frequencyPerWeek: 4, durationMinutes: 5 },
  },
  {
    id: 'language',
    title: 'Practice language',
    category: 'Language',
    description: 'Short frequent reps beat occasional cram sessions.',
    pace: 'steady',
    target: { frequencyPerWeek: 6, durationMinutes: 25 },
    start: { frequencyPerWeek: 3, durationMinutes: 10 },
  },
  {
    id: 'deep-work',
    title: 'Deep work',
    category: 'Deep work',
    description: 'Protect focus blocks and expand duration over time.',
    pace: 'ambitious',
    target: { frequencyPerWeek: 5, durationMinutes: 90 },
    start: { frequencyPerWeek: 2, durationMinutes: 25 },
  },
];

export function templateToCreateInput(template: HabitTemplate): CreateHabitInput {
  return {
    title: template.title,
    target: { ...template.target },
    start: { ...template.start },
    pace: template.pace,
  };
}

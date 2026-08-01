import type { HabitLevel, HabitSchedule, WeekdayIndex } from '../types/habit';

const DEFAULT_DAY_ORDER: WeekdayIndex[] = [1, 3, 5, 2, 4, 6, 0]; // Mon-first preference

export function defaultSchedule(frequencyPerWeek: number): HabitSchedule {
  const count = Math.min(7, Math.max(1, frequencyPerWeek));
  return {
    remindersEnabled: true,
    preferredDays: DEFAULT_DAY_ORDER.slice(0, count),
    hour: 8,
    minute: 0,
  };
}

export function normalizeSchedule(
  schedule: Partial<HabitSchedule> | undefined,
  frequencyPerWeek: number,
): HabitSchedule {
  const fallback = defaultSchedule(frequencyPerWeek);
  const days = Array.isArray(schedule?.preferredDays)
    ? ([...new Set(schedule.preferredDays)] as WeekdayIndex[])
        .filter((day) => day >= 0 && day <= 6)
        .slice(0, 7)
    : fallback.preferredDays;

  return {
    remindersEnabled: schedule?.remindersEnabled ?? fallback.remindersEnabled,
    preferredDays: days.length > 0 ? days : fallback.preferredDays,
    hour: clamp(schedule?.hour ?? fallback.hour, 0, 23),
    minute: [0, 15, 30, 45].includes(schedule?.minute ?? -1)
      ? (schedule!.minute as number)
      : fallback.minute,
  };
}

export function syncScheduleToFrequency(
  schedule: HabitSchedule,
  level: HabitLevel,
): HabitSchedule {
  const desired = Math.min(7, Math.max(1, level.frequencyPerWeek));
  if (schedule.preferredDays.length === desired) {
    return schedule;
  }

  if (schedule.preferredDays.length > desired) {
    return {
      ...schedule,
      preferredDays: schedule.preferredDays.slice(0, desired),
    };
  }

  const extras = DEFAULT_DAY_ORDER.filter(
    (day) => !schedule.preferredDays.includes(day),
  );
  return {
    ...schedule,
    preferredDays: [
      ...schedule.preferredDays,
      ...extras.slice(0, desired - schedule.preferredDays.length),
    ],
  };
}

export function formatScheduleTime(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

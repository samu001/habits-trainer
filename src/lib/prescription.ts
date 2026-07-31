import { formatWeekRange, getWeekId } from './dates';
import type { HabitGoal } from '../types/habit';
import type {
  LogSessionInput,
  SessionLog,
  SessionResult,
  WeeklyProgress,
} from '../types/logging';

export function sessionCredit(
  result: SessionResult,
  minutesDone: number,
  prescribedMinutes: number,
): number {
  if (result === 'skipped') {
    return 0;
  }

  if (prescribedMinutes <= 0) {
    return minutesDone > 0 || result === 'completed' ? 1 : 0;
  }

  if (result === 'completed' || minutesDone >= prescribedMinutes) {
    return 1;
  }

  if (minutesDone <= 0) {
    return 0;
  }

  return Math.min(1, minutesDone / prescribedMinutes);
}

export function createSessionLog(
  input: LogSessionInput,
  prescribedMinutes: number,
): SessionLog {
  const loggedAtDate = input.loggedAt ?? new Date();
  const minutesDone =
    input.result === 'skipped' ? 0 : Math.max(0, input.minutesDone ?? 0);

  if (input.result === 'partial' && minutesDone <= 0) {
    throw new Error('Enter how many minutes you completed.');
  }

  if (input.result === 'completed' && minutesDone <= 0) {
    // Default completed sessions to the full prescription.
  }

  const resolvedMinutes =
    input.result === 'completed'
      ? minutesDone > 0
        ? minutesDone
        : prescribedMinutes
      : minutesDone;

  const note = input.note?.trim();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    habitId: input.habitId,
    loggedAt: loggedAtDate.toISOString(),
    weekId: getWeekId(loggedAtDate),
    result: input.result,
    prescribedMinutes,
    minutesDone: resolvedMinutes,
    credit: sessionCredit(input.result, resolvedMinutes, prescribedMinutes),
    note: note ? note : undefined,
  };
}

export function buildWeeklyProgress(
  habit: HabitGoal,
  logs: SessionLog[],
  now: Date = new Date(),
): WeeklyProgress {
  const weekId = getWeekId(now);
  const weekLogs = logs
    .filter((log) => log.habitId === habit.id && log.weekId === weekId)
    .sort(
      (a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    );

  const requiredSessions = habit.current.frequencyPerWeek;
  const prescribedMinutes = habit.current.durationMinutes;
  const earnedCredits = weekLogs.reduce((sum, log) => sum + log.credit, 0);
  const completionRate =
    requiredSessions === 0
      ? 0
      : Math.min(1, earnedCredits / requiredSessions);
  const remainingSessions = Math.max(0, requiredSessions - weekLogs.length);

  return {
    weekId,
    weekLabel: formatWeekRange(now),
    requiredSessions,
    prescribedMinutes,
    prescriptionLabel: `${habit.title} ${requiredSessions}× this week for ${prescribedMinutes} minutes`,
    logs: weekLogs,
    earnedCredits,
    completionRate,
    remainingSessions,
    isComplete: earnedCredits >= requiredSessions,
  };
}

export function formatSessionResult(result: SessionResult): string {
  switch (result) {
    case 'completed':
      return 'Completed';
    case 'partial':
      return 'Partial';
    case 'skipped':
      return 'Skipped';
  }
}

export function formatCredit(credit: number): string {
  if (credit >= 1) {
    return 'Full credit';
  }
  if (credit <= 0) {
    return 'No credit';
  }
  return `${Math.round(credit * 100)}% credit`;
}

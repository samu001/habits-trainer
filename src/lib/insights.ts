import { recentWeekIds } from './coaching';
import { getWeekId } from './dates';
import { levelsEqual, progressTowardTarget } from './habits';
import { buildLevelLadder, minStrongWeeksForPace } from './progression';
import type { HabitGoal } from '../types/habit';
import { WEEKDAY_LABELS } from '../types/habit';
import type { SessionLog } from '../types/logging';

export type HabitInsight = {
  habitId: string;
  title: string;
  averageCompletion: number;
  bestDayLabel: string | null;
  bestDayCount: number;
  levelProgress: number;
  estimatedWeeksToTarget: number | null;
  estimatedLabel: string;
};

export type PortfolioInsights = {
  habits: HabitInsight[];
  overallAverageCompletion: number;
  mostConsistentHabit: string | null;
  totalSessionsLogged: number;
};

export function buildHabitInsight(
  habit: HabitGoal,
  logs: SessionLog[],
  now: Date = new Date(),
): HabitInsight {
  const habitLogs = logs.filter((log) => log.habitId === habit.id);
  const weekIds = recentWeekIds(4, now);
  const rates = weekIds.map((weekId) => {
    const weekLogs = habitLogs.filter((log) => log.weekId === weekId);
    const credits = weekLogs.reduce((sum, log) => sum + log.credit, 0);
    return habit.current.frequencyPerWeek === 0
      ? 0
      : Math.min(1, credits / habit.current.frequencyPerWeek);
  });

  const averageCompletion =
    rates.reduce((sum, rate) => sum + rate, 0) / Math.max(rates.length, 1);

  const dayCounts = new Array(7).fill(0) as number[];
  for (const log of habitLogs) {
    if (log.result === 'skipped') {
      continue;
    }
    const day = new Date(log.loggedAt).getDay();
    dayCounts[day] += 1;
  }
  const bestDayCount = Math.max(...dayCounts, 0);
  const bestDayIndex = bestDayCount > 0 ? dayCounts.indexOf(bestDayCount) : -1;

  const levelProgress = progressTowardTarget(habit);
  const estimatedWeeksToTarget = estimateWeeksToTarget(habit, averageCompletion);

  return {
    habitId: habit.id,
    title: habit.title,
    averageCompletion,
    bestDayLabel: bestDayIndex >= 0 ? WEEKDAY_LABELS[bestDayIndex]! : null,
    bestDayCount,
    levelProgress,
    estimatedWeeksToTarget,
    estimatedLabel:
      estimatedWeeksToTarget == null
        ? levelsEqual(habit.current, habit.target)
          ? 'Already at target'
          : 'Need more consistency to estimate'
        : estimatedWeeksToTarget <= 1
          ? 'About 1 week to target at this pace'
          : `About ${estimatedWeeksToTarget} weeks to target at this pace`,
  };
}

export function estimateWeeksToTarget(
  habit: HabitGoal,
  averageCompletion: number,
): number | null {
  if (levelsEqual(habit.current, habit.target)) {
    return 0;
  }

  if (averageCompletion < 0.35) {
    return null;
  }

  const ladder = buildLevelLadder(habit.current, habit.target);
  const remainingSteps = Math.max(0, ladder.length - 1);
  if (remainingSteps === 0) {
    return 0;
  }

  const minStrong = minStrongWeeksForPace(habit.pace);
  const successChance = Math.min(1, Math.max(0.35, averageCompletion));
  const weeksPerStep = minStrong / successChance;
  return Math.max(1, Math.ceil(remainingSteps * weeksPerStep));
}

export function buildPortfolioInsights(
  habits: HabitGoal[],
  logs: SessionLog[],
  now: Date = new Date(),
): PortfolioInsights {
  const active = habits.filter(
    (habit) => habit.status !== 'archived' && habit.status !== 'paused',
  );
  const insights = active.map((habit) => buildHabitInsight(habit, logs, now));
  const overallAverageCompletion =
    insights.length === 0
      ? 0
      : insights.reduce((sum, item) => sum + item.averageCompletion, 0) /
        insights.length;

  const mostConsistent = [...insights].sort(
    (a, b) => b.averageCompletion - a.averageCompletion,
  )[0];

  return {
    habits: insights,
    overallAverageCompletion,
    mostConsistentHabit: mostConsistent?.title ?? null,
    totalSessionsLogged: logs.filter((log) => log.result !== 'skipped').length,
  };
}

export function buildTodaySummaryLine(
  habits: HabitGoal[],
  logs: SessionLog[],
  now: Date = new Date(),
): string {
  const weekId = getWeekId(now);
  const active = habits.filter(
    (habit) => habit.status !== 'paused' && habit.status !== 'archived',
  );

  if (active.length === 0) {
    return 'No active habits today';
  }

  const remaining = active.reduce((sum, habit) => {
    const logged = logs.filter(
      (log) => log.habitId === habit.id && log.weekId === weekId,
    ).length;
    return sum + Math.max(0, habit.current.frequencyPerWeek - logged);
  }, 0);

  return `${active.length} active · ${remaining} sessions left this week`;
}

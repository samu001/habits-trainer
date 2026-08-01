import { getWeekId, getWeekStart } from './dates';
import { formatLevel, levelsEqual, progressTowardTarget } from './habits';
import { weekCompletionRate } from './progression';
import type { HabitGoal } from '../types/habit';
import type { SessionLog } from '../types/logging';

export type Momentum = 'improving' | 'stable' | 'slipping';

export type CoachingSnapshot = {
  momentum: Momentum;
  consistencyScore: number;
  levelProgress: number;
  recentRates: number[];
  identityLine: string;
  headline: string;
  supportLine: string;
  minimumViableMinutes: number;
  minimumViableLabel: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function recentWeekIds(count: number, now: Date = new Date()): string[] {
  const ids: string[] = [];
  let cursor = getWeekStart(now);

  for (let i = 0; i < count; i += 1) {
    ids.push(getWeekId(cursor));
    cursor = new Date(cursor.getTime() - 7 * DAY_MS);
  }

  return ids;
}

export function computeConsistencyScore(
  habit: HabitGoal,
  logs: SessionLog[],
  weekCount = 4,
  now: Date = new Date(),
): { score: number; rates: number[] } {
  const ids = recentWeekIds(weekCount, now);
  const rates = ids.map((weekId) => weekCompletionRate(habit, logs, weekId));
  const scored = rates.filter((rate, index) => {
    // Ignore future-empty leading weeks with no logs at all except current week.
    if (index === 0) {
      return true;
    }
    return (
      logs.some((log) => log.habitId === habit.id && log.weekId === ids[index]) ||
      rate > 0
    );
  });

  if (scored.length === 0) {
    return { score: 0, rates };
  }

  const score =
    scored.reduce((sum, rate) => sum + rate, 0) / Math.max(scored.length, 1);
  return { score: Math.min(1, score), rates };
}

export function computeMomentum(rates: number[]): Momentum {
  if (rates.length < 2) {
    return 'stable';
  }

  const recent = rates[0] ?? 0;
  const prior = rates.slice(1, 3);
  const previous =
    prior.reduce((sum, rate) => sum + rate, 0) / Math.max(1, prior.length);

  if (recent - previous >= 0.15) {
    return 'improving';
  }
  if (previous - recent >= 0.15) {
    return 'slipping';
  }
  return 'stable';
}

export function minimumViableMinutes(durationMinutes: number): number {
  const scaled = Math.round(durationMinutes * 0.4);
  const stepped = Math.max(2, Math.round(scaled / 5) * 5 || scaled);
  return Math.min(durationMinutes, Math.max(2, stepped === 0 ? 2 : stepped));
}

export function inferHabitCategory(title: string): string {
  const value = title.toLowerCase();
  if (/(gym|workout|run|walk|lift|exercise|fitness|yoga)/.test(value)) {
    return 'movement';
  }
  if (/(read|book|page)/.test(value)) {
    return 'reading';
  }
  if (/(meditat|breath|mindful|journal)/.test(value)) {
    return 'mindfulness';
  }
  if (/(language|spanish|french|german|vocab)/.test(value)) {
    return 'learning';
  }
  if (/(write|deep work|focus|study|code)/.test(value)) {
    return 'focus';
  }
  return 'habit';
}

export function identityLine(title: string): string {
  const category = inferHabitCategory(title);
  switch (category) {
    case 'movement':
      return 'You’re becoming someone who moves their body regularly.';
    case 'reading':
      return 'You’re becoming someone who makes time to read.';
    case 'mindfulness':
      return 'You’re becoming someone who protects a calm mind.';
    case 'learning':
      return 'You’re becoming someone who keeps learning in small steps.';
    case 'focus':
      return 'You’re becoming someone who shows up for focused work.';
    default:
      return `You’re becoming someone who keeps “${title}” alive.`;
  }
}

export function buildCoachingSnapshot(
  habit: HabitGoal,
  logs: SessionLog[],
  now: Date = new Date(),
): CoachingSnapshot {
  const { score, rates } = computeConsistencyScore(habit, logs, 4, now);
  const momentum = computeMomentum(rates);
  const levelProgress = progressTowardTarget(habit);
  const minMinutes = minimumViableMinutes(habit.current.durationMinutes);
  const atTarget = levelsEqual(habit.current, habit.target);

  let headline = 'Building steadily';
  let supportLine = `This week’s job is simple: ${formatLevel(habit.current)}.`;

  if (habit.status === 'paused') {
    headline = 'Paused on purpose';
    supportLine = 'Rest is part of the plan. Resume when you’re ready to rebuild.';
  } else if (habit.status === 'maintaining' || atTarget) {
    headline = 'Crushing the goal';
    supportLine = 'You’re at target. Protect consistency instead of adding pressure.';
  } else if (momentum === 'improving' && score >= 0.7) {
    headline = 'Crushing it';
    supportLine = 'Your consistency is rising. Keep the current level honest before rushing ahead.';
  } else if (momentum === 'slipping' || score < 0.45) {
    headline = 'Needs recovery';
    supportLine = `Shrink the win if needed — even ${minMinutes} minutes keeps identity intact.`;
  } else {
    headline = 'Building';
    supportLine = 'Small reps beat perfect plans. Log what you can and review the week.';
  }

  return {
    momentum,
    consistencyScore: score,
    levelProgress,
    recentRates: rates,
    identityLine: identityLine(habit.title),
    headline,
    supportLine,
    minimumViableMinutes: minMinutes,
    minimumViableLabel: `Can’t do ${habit.current.durationMinutes} min? Do ${minMinutes} min to keep the chain alive.`,
  };
}

export function formatMomentum(momentum: Momentum): string {
  switch (momentum) {
    case 'improving':
      return 'Improving';
    case 'stable':
      return 'Stable';
    case 'slipping':
      return 'Slipping';
  }
}

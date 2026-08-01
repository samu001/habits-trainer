import { formatLevel, levelsEqual } from './habits';
import { deriveHabitStatus } from './load';
import { normalizeSchedule, syncScheduleToFrequency } from './schedule';
import type {
  HabitGoal,
  HabitLevel,
  HabitPace,
  ProgressionAction,
  ProgressionEvent,
  WeeklyReflection,
} from '../types/habit';
import type { SessionLog } from '../types/logging';

export type WeekEvaluationDecision = {
  action: ProgressionAction;
  nextLevel: HabitLevel;
  completionRate: number;
  message: string;
  strongWeeksAtLevel: number;
  consecutiveLowWeeks: number;
};

export type WeekEvaluationResult = {
  habit: HabitGoal;
  event: ProgressionEvent;
  decision: WeekEvaluationDecision;
};

const LEVEL_UP_THRESHOLD = 0.8;
const HOLD_THRESHOLD = 0.5;
const LOWS_BEFORE_DOWNSHIFT = 2;

export function minStrongWeeksForPace(pace: HabitPace): number {
  switch (pace) {
    case 'gentle':
      return 2;
    case 'steady':
      return 2;
    case 'ambitious':
      return 1;
  }
}

function durationStep(currentMinutes: number): number {
  return currentMinutes < 20 ? 5 : 10;
}

export function getNextLevel(
  current: HabitLevel,
  target: HabitLevel,
): HabitLevel | null {
  if (levelsEqual(current, target)) {
    return null;
  }

  const frequencyProgress =
    target.frequencyPerWeek === 0
      ? 1
      : current.frequencyPerWeek / target.frequencyPerWeek;
  const durationProgress =
    target.durationMinutes === 0
      ? 1
      : current.durationMinutes / target.durationMinutes;

  if (
    current.durationMinutes < target.durationMinutes &&
    durationProgress <= frequencyProgress
  ) {
    return {
      ...current,
      durationMinutes: Math.min(
        target.durationMinutes,
        current.durationMinutes + durationStep(current.durationMinutes),
      ),
    };
  }

  if (current.frequencyPerWeek < target.frequencyPerWeek) {
    return {
      ...current,
      frequencyPerWeek: current.frequencyPerWeek + 1,
    };
  }

  if (current.durationMinutes < target.durationMinutes) {
    return {
      ...current,
      durationMinutes: Math.min(
        target.durationMinutes,
        current.durationMinutes + durationStep(current.durationMinutes),
      ),
    };
  }

  return null;
}

export function getPreviousLevel(
  current: HabitLevel,
  start: HabitLevel,
  target: HabitLevel,
): HabitLevel | null {
  if (levelsEqual(current, start)) {
    return null;
  }

  const ladder = buildLevelLadder(start, target);
  const index = ladder.findIndex((level) => levelsEqual(level, current));
  if (index > 0) {
    return ladder[index - 1] ?? null;
  }

  // Fallback if current is off-ladder: step down one dimension carefully.
  if (current.durationMinutes > start.durationMinutes) {
    const step = durationStep(Math.max(5, current.durationMinutes - 10));
    return {
      ...current,
      durationMinutes: Math.max(
        start.durationMinutes,
        current.durationMinutes - step,
      ),
    };
  }

  if (current.frequencyPerWeek > start.frequencyPerWeek) {
    return {
      ...current,
      frequencyPerWeek: current.frequencyPerWeek - 1,
    };
  }

  return null;
}

export function buildLevelLadder(
  start: HabitLevel,
  target: HabitLevel,
): HabitLevel[] {
  const ladder: HabitLevel[] = [{ ...start }];
  let guard = 0;

  while (!levelsEqual(ladder[ladder.length - 1]!, target) && guard < 40) {
    const next = getNextLevel(ladder[ladder.length - 1]!, target);
    if (!next || levelsEqual(next, ladder[ladder.length - 1]!)) {
      break;
    }
    ladder.push(next);
    guard += 1;
  }

  if (!levelsEqual(ladder[ladder.length - 1]!, target)) {
    ladder.push({ ...target });
  }

  return ladder;
}

export function decideWeekEvaluation(
  habit: HabitGoal,
  completionRate: number,
): WeekEvaluationDecision {
  const atTarget = levelsEqual(habit.current, habit.target);
  const nextLevel = getNextLevel(habit.current, habit.target);
  const previousLevel = getPreviousLevel(
    habit.current,
    habit.start,
    habit.target,
  );
  const minStrongWeeks = minStrongWeeksForPace(habit.pace);

  if (completionRate >= LEVEL_UP_THRESHOLD) {
    const strongWeeksAtLevel = habit.strongWeeksAtLevel + 1;
    const consecutiveLowWeeks = 0;

    if (habit.holdLevel) {
      return {
        action: 'hold',
        nextLevel: habit.current,
        completionRate,
        strongWeeksAtLevel,
        consecutiveLowWeeks,
        message: `Strong week (${Math.round(completionRate * 100)}%). Holding this level because you turned hold on.`,
      };
    }

    if (atTarget || !nextLevel) {
      return {
        action: 'maintain',
        nextLevel: habit.current,
        completionRate,
        strongWeeksAtLevel,
        consecutiveLowWeeks,
        message: `Great week (${Math.round(completionRate * 100)}%). You're at your target — keep maintaining it.`,
      };
    }

    if (strongWeeksAtLevel >= minStrongWeeks) {
      return {
        action: 'level_up',
        nextLevel,
        completionRate,
        strongWeeksAtLevel: 0,
        consecutiveLowWeeks,
        message: `Level up! ${formatLevel(habit.current)} → ${formatLevel(nextLevel)}`,
      };
    }

    return {
      action: 'hold',
      nextLevel: habit.current,
      completionRate,
      strongWeeksAtLevel,
      consecutiveLowWeeks,
      message: `Strong week (${Math.round(completionRate * 100)}%). ${strongWeeksAtLevel}/${minStrongWeeks} strong weeks needed before the next level.`,
    };
  }

  if (completionRate >= HOLD_THRESHOLD) {
    return {
      action: 'hold',
      nextLevel: habit.current,
      completionRate,
      strongWeeksAtLevel: 0,
      consecutiveLowWeeks: 0,
      message: `Solid effort (${Math.round(completionRate * 100)}%). Holding this level to protect consistency.`,
    };
  }

  const consecutiveLowWeeks = habit.consecutiveLowWeeks + 1;
  if (consecutiveLowWeeks >= LOWS_BEFORE_DOWNSHIFT && previousLevel) {
    return {
      action: 'downshift',
      nextLevel: previousLevel,
      completionRate,
      strongWeeksAtLevel: 0,
      consecutiveLowWeeks: 0,
      message: `Two tough weeks. Downshifting ${formatLevel(habit.current)} → ${formatLevel(previousLevel)} to rebuild momentum.`,
    };
  }

  return {
    action: 'hold',
    nextLevel: habit.current,
    completionRate,
    strongWeeksAtLevel: 0,
    consecutiveLowWeeks,
    message: `Hard week (${Math.round(completionRate * 100)}%). Holding for now${
      previousLevel
        ? ` — one more tough week may downshift to ${formatLevel(previousLevel)}.`
        : '.'
    }`,
  };
}

export function weekCompletionRate(
  habit: HabitGoal,
  logs: SessionLog[],
  weekId: string,
): number {
  const weekLogs = logs.filter(
    (log) => log.habitId === habit.id && log.weekId === weekId,
  );
  const earnedCredits = weekLogs.reduce((sum, log) => sum + log.credit, 0);
  const requiredSessions = habit.current.frequencyPerWeek;
  if (requiredSessions === 0) {
    return 0;
  }
  return Math.min(1, earnedCredits / requiredSessions);
}

export function applyWeekEvaluation(
  habit: HabitGoal,
  logs: SessionLog[],
  weekId: string,
  now: Date = new Date(),
  reflection?: WeeklyReflection,
): WeekEvaluationResult {
  if (habit.status === 'paused' || habit.status === 'archived') {
    throw new Error('Resume this habit before reviewing a week.');
  }

  if (habit.lastEvaluatedWeekId === weekId) {
    throw new Error('This week has already been evaluated.');
  }

  const completionRate = weekCompletionRate(habit, logs, weekId);
  let decision = decideWeekEvaluation(habit, completionRate);

  // Reflection intention can keep the user at the current level.
  if (
    reflection?.intention === 'hold' &&
    (decision.action === 'level_up' || decision.action === 'downshift')
  ) {
    decision = {
      ...decision,
      action: 'hold',
      nextLevel: habit.current,
      strongWeeksAtLevel:
        decision.action === 'level_up'
          ? habit.strongWeeksAtLevel + 1
          : 0,
      message: `${decision.message} You chose to hold this level during reflection.`,
    };
  }

  const event: ProgressionEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    weekId,
    action: decision.action,
    completionRate: decision.completionRate,
    from: { ...habit.current },
    to: { ...decision.nextLevel },
    message: decision.message,
    createdAt: now.toISOString(),
    reflection,
  };

  const nextCurrent = { ...decision.nextLevel };
  const weeksAtTarget = levelsEqual(nextCurrent, habit.target)
    ? habit.weeksAtTarget + (decision.action === 'maintain' || decision.action === 'hold' ? 1 : 0)
    : 0;

  const updatedBase: HabitGoal = {
    ...habit,
    current: nextCurrent,
    schedule: syncScheduleToFrequency(habit.schedule, nextCurrent),
    strongWeeksAtLevel: decision.strongWeeksAtLevel,
    consecutiveLowWeeks: decision.consecutiveLowWeeks,
    weeksAtTarget,
    lastEvaluatedWeekId: weekId,
    progressionHistory: [event, ...habit.progressionHistory].slice(0, 30),
  };

  const updated: HabitGoal = {
    ...updatedBase,
    status: deriveHabitStatus({ ...updatedBase, status: 'building' }),
  };

  return {
    habit: updated,
    event,
    decision,
  };
}

export function formatProgressionAction(action: ProgressionAction): string {
  switch (action) {
    case 'level_up':
      return 'Level up';
    case 'hold':
      return 'Hold';
    case 'downshift':
      return 'Downshift';
    case 'maintain':
      return 'Maintain';
  }
}

export function normalizeHabitGoal(habit: HabitGoal): HabitGoal {
  const rawStatus = habit.status ?? 'building';
  const schedule = normalizeSchedule(
    habit.schedule,
    habit.current?.frequencyPerWeek ?? habit.start?.frequencyPerWeek ?? 2,
  );
  const normalized: HabitGoal = {
    ...habit,
    status: rawStatus,
    schedule,
    holdLevel: Boolean(habit.holdLevel),
    strongWeeksAtLevel: habit.strongWeeksAtLevel ?? 0,
    consecutiveLowWeeks: habit.consecutiveLowWeeks ?? 0,
    weeksAtTarget: habit.weeksAtTarget ?? 0,
    lastEvaluatedWeekId: habit.lastEvaluatedWeekId,
    progressionHistory: Array.isArray(habit.progressionHistory)
      ? habit.progressionHistory
      : [],
  };

  if (rawStatus === 'paused' || rawStatus === 'archived') {
    return normalized;
  }

  return {
    ...normalized,
    status: deriveHabitStatus({ ...normalized, status: 'building' }),
  };
}

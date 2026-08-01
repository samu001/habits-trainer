import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  applyWeekEvaluation,
  buildLevelLadder,
  decideWeekEvaluation,
  getNextLevel,
} from './progression';
import type { HabitGoal } from '../types/habit';
import type { SessionLog } from '../types/logging';

function makeHabit(overrides: Partial<HabitGoal> = {}): HabitGoal {
  return {
    id: 'habit-1',
    title: 'Work out',
    target: { frequencyPerWeek: 5, durationMinutes: 60 },
    start: { frequencyPerWeek: 2, durationMinutes: 15 },
    current: { frequencyPerWeek: 2, durationMinutes: 15 },
    pace: 'steady',
    createdAt: '2026-03-01T00:00:00.000Z',
    holdLevel: false,
    strongWeeksAtLevel: 0,
    consecutiveLowWeeks: 0,
    progressionHistory: [],
    ...overrides,
  };
}

function makeLog(
  weekId: string,
  credit: number,
  habitId = 'habit-1',
): SessionLog {
  return {
    id: `${weekId}-${credit}-${Math.random()}`,
    habitId,
    loggedAt: `${weekId}T12:00:00.000Z`,
    weekId,
    result: credit >= 1 ? 'completed' : credit > 0 ? 'partial' : 'skipped',
    prescribedMinutes: 15,
    minutesDone: Math.round(credit * 15),
    credit,
  };
}

describe('progression engine', () => {
  it('builds the expected ladder for 2x15 -> 5x60', () => {
    const ladder = buildLevelLadder(
      { frequencyPerWeek: 2, durationMinutes: 15 },
      { frequencyPerWeek: 5, durationMinutes: 60 },
    );

    assert.deepEqual(
      ladder.map((level) => [
        level.frequencyPerWeek,
        level.durationMinutes,
      ]),
      [
        [2, 15],
        [2, 20],
        [2, 30],
        [3, 30],
        [3, 40],
        [4, 40],
        [4, 50],
        [5, 50],
        [5, 60],
      ],
    );
  });

  it('increases one dimension at a time', () => {
    const next = getNextLevel(
      { frequencyPerWeek: 2, durationMinutes: 15 },
      { frequencyPerWeek: 5, durationMinutes: 60 },
    );
    assert.deepEqual(next, { frequencyPerWeek: 2, durationMinutes: 20 });
  });

  it('requires enough strong weeks before leveling up', () => {
    const first = decideWeekEvaluation(makeHabit({ strongWeeksAtLevel: 0 }), 1);
    assert.equal(first.action, 'hold');
    assert.equal(first.strongWeeksAtLevel, 1);

    const second = decideWeekEvaluation(
      makeHabit({ strongWeeksAtLevel: 1 }),
      0.9,
    );
    assert.equal(second.action, 'level_up');
    assert.deepEqual(second.nextLevel, {
      frequencyPerWeek: 2,
      durationMinutes: 20,
    });
  });

  it('respects hold override', () => {
    const decision = decideWeekEvaluation(
      makeHabit({ holdLevel: true, strongWeeksAtLevel: 5 }),
      1,
    );
    assert.equal(decision.action, 'hold');
    assert.deepEqual(decision.nextLevel, {
      frequencyPerWeek: 2,
      durationMinutes: 15,
    });
  });

  it('downshifts after two weak weeks', () => {
    const habit = makeHabit({
      current: { frequencyPerWeek: 2, durationMinutes: 20 },
      consecutiveLowWeeks: 1,
    });
    const decision = decideWeekEvaluation(habit, 0.2);
    assert.equal(decision.action, 'downshift');
    assert.deepEqual(decision.nextLevel, {
      frequencyPerWeek: 2,
      durationMinutes: 15,
    });
  });

  it('applies evaluation and records history', () => {
    const habit = makeHabit({
      pace: 'ambitious',
      strongWeeksAtLevel: 0,
    });
    const logs = [makeLog('2026-03-02', 1), makeLog('2026-03-02', 1)];
    const result = applyWeekEvaluation(habit, logs, '2026-03-02');

    assert.equal(result.decision.action, 'level_up');
    assert.deepEqual(result.habit.current, {
      frequencyPerWeek: 2,
      durationMinutes: 20,
    });
    assert.equal(result.habit.lastEvaluatedWeekId, '2026-03-02');
    assert.equal(result.habit.progressionHistory.length, 1);
  });
});

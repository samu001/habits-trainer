import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeWeeklyLoad, deriveHabitStatus } from './load';
import type { HabitGoal } from '../types/habit';

function makeHabit(overrides: Partial<HabitGoal> = {}): HabitGoal {
  return {
    id: 'habit-1',
    title: 'Work out',
    target: { frequencyPerWeek: 5, durationMinutes: 60 },
    start: { frequencyPerWeek: 2, durationMinutes: 15 },
    current: { frequencyPerWeek: 2, durationMinutes: 15 },
    pace: 'steady',
    createdAt: '2026-03-01T00:00:00.000Z',
    status: 'building',
    holdLevel: false,
    strongWeeksAtLevel: 0,
    consecutiveLowWeeks: 0,
    weeksAtTarget: 0,
    progressionHistory: [],
    ...overrides,
  };
}

describe('load management', () => {
  it('derives building vs maintaining status', () => {
    assert.equal(deriveHabitStatus(makeHabit()), 'building');
    assert.equal(
      deriveHabitStatus(
        makeHabit({
          current: { frequencyPerWeek: 5, durationMinutes: 60 },
          status: 'building',
        }),
      ),
      'maintaining',
    );
    assert.equal(
      deriveHabitStatus(makeHabit({ status: 'paused' })),
      'paused',
    );
  });

  it('warns when too many building habits are active', () => {
    const habits = [
      makeHabit({ id: '1', title: 'A' }),
      makeHabit({ id: '2', title: 'B' }),
      makeHabit({ id: '3', title: 'C' }),
      makeHabit({ id: '4', title: 'D' }),
    ];
    const load = computeWeeklyLoad(habits);
    assert.equal(load.buildingHabits.length, 4);
    assert.equal(load.isBuildingAtCapacity, true);
    assert.ok(load.warnings.length > 0);
    assert.ok(load.sequencingTip);
  });

  it('ignores paused and archived habits in load totals', () => {
    const habits = [
      makeHabit({
        id: '1',
        current: { frequencyPerWeek: 2, durationMinutes: 15 },
      }),
      makeHabit({
        id: '2',
        status: 'paused',
        current: { frequencyPerWeek: 5, durationMinutes: 60 },
      }),
      makeHabit({
        id: '3',
        status: 'archived',
        current: { frequencyPerWeek: 5, durationMinutes: 60 },
      }),
    ];
    const load = computeWeeklyLoad(habits);
    assert.equal(load.totalSessions, 2);
    assert.equal(load.totalMinutes, 30);
  });
});

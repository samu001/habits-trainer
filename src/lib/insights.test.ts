import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { estimateWeeksToTarget, buildHabitInsight } from './insights';
import type { HabitGoal } from '../types/habit';
import type { SessionLog } from '../types/logging';

const habit: HabitGoal = {
  id: 'habit-1',
  title: 'Work out',
  target: { frequencyPerWeek: 5, durationMinutes: 60 },
  start: { frequencyPerWeek: 2, durationMinutes: 15 },
  current: { frequencyPerWeek: 2, durationMinutes: 15 },
  pace: 'ambitious',
  createdAt: '2026-03-01T00:00:00.000Z',
  status: 'building',
  schedule: {
    remindersEnabled: true,
    preferredDays: [1, 3],
    hour: 8,
    minute: 0,
  },
  holdLevel: false,
  strongWeeksAtLevel: 0,
  consecutiveLowWeeks: 0,
  weeksAtTarget: 0,
  progressionHistory: [],
};

describe('insights helpers', () => {
  it('estimates weeks to target from consistency', () => {
    const weeks = estimateWeeksToTarget(habit, 0.9);
    assert.ok(weeks != null && weeks > 0);
  });

  it('returns null estimate when consistency is too low', () => {
    assert.equal(estimateWeeksToTarget(habit, 0.1), null);
  });

  it('finds a best day from logs', () => {
    const logs: SessionLog[] = [
      {
        id: '1',
        habitId: 'habit-1',
        loggedAt: '2026-03-02T12:00:00.000Z', // Monday UTC-ish local dependent
        weekId: '2026-03-02',
        result: 'completed',
        prescribedMinutes: 15,
        minutesDone: 15,
        credit: 1,
      },
      {
        id: '2',
        habitId: 'habit-1',
        loggedAt: '2026-03-09T12:00:00.000Z',
        weekId: '2026-03-09',
        result: 'completed',
        prescribedMinutes: 15,
        minutesDone: 15,
        credit: 1,
      },
    ];

    const insight = buildHabitInsight(habit, logs, new Date(2026, 2, 10));
    assert.ok(insight.bestDayLabel);
    assert.ok(insight.bestDayCount >= 1);
  });
});

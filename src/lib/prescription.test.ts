import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildWeeklyProgress,
  createSessionLog,
  sessionCredit,
} from './prescription';
import type { HabitGoal } from '../types/habit';

const habit: HabitGoal = {
  id: 'habit-1',
  title: 'Work out',
  target: { frequencyPerWeek: 5, durationMinutes: 60 },
  start: { frequencyPerWeek: 2, durationMinutes: 15 },
  current: { frequencyPerWeek: 2, durationMinutes: 15 },
  pace: 'steady',
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

describe('prescription helpers', () => {
  it('assigns full, partial, and zero credit', () => {
    assert.equal(sessionCredit('completed', 15, 15), 1);
    assert.equal(sessionCredit('partial', 10, 15), 10 / 15);
    assert.equal(sessionCredit('skipped', 0, 15), 0);
    assert.equal(sessionCredit('completed', 20, 15), 1);
  });

  it('creates completed logs at prescribed duration by default', () => {
    const log = createSessionLog(
      {
        habitId: habit.id,
        result: 'completed',
        loggedAt: new Date(2026, 2, 4, 10, 0),
      },
      15,
    );

    assert.equal(log.minutesDone, 15);
    assert.equal(log.credit, 1);
    assert.equal(log.weekId, '2026-03-02');
  });

  it('builds weekly progress from current level and logs', () => {
    const logs = [
      createSessionLog(
        {
          habitId: habit.id,
          result: 'completed',
          loggedAt: new Date(2026, 2, 3, 8, 0),
        },
        15,
      ),
      createSessionLog(
        {
          habitId: habit.id,
          result: 'partial',
          minutesDone: 5,
          loggedAt: new Date(2026, 2, 5, 8, 0),
        },
        15,
      ),
    ];

    const weekly = buildWeeklyProgress(habit, logs, new Date(2026, 2, 6));

    assert.equal(weekly.requiredSessions, 2);
    assert.equal(weekly.prescribedMinutes, 15);
    assert.equal(weekly.prescriptionLabel, 'Work out 2× this week for 15 minutes');
    assert.equal(weekly.logs.length, 2);
    assert.ok(Math.abs(weekly.earnedCredits - (1 + 5 / 15)) < 1e-9);
    assert.equal(weekly.remainingSessions, 0);
    assert.equal(weekly.isComplete, false);
  });

  it('marks the week complete when credits meet requirement', () => {
    const logs = [
      createSessionLog(
        {
          habitId: habit.id,
          result: 'completed',
          loggedAt: new Date(2026, 2, 2, 8, 0),
        },
        15,
      ),
      createSessionLog(
        {
          habitId: habit.id,
          result: 'completed',
          loggedAt: new Date(2026, 2, 4, 8, 0),
        },
        15,
      ),
    ];

    const weekly = buildWeeklyProgress(habit, logs, new Date(2026, 2, 6));
    assert.equal(weekly.isComplete, true);
    assert.equal(weekly.completionRate, 1);
  });
});

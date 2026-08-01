import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildCoachingSnapshot,
  computeMomentum,
  identityLine,
  minimumViableMinutes,
} from './coaching';
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
  holdLevel: false,
  strongWeeksAtLevel: 0,
  consecutiveLowWeeks: 0,
  weeksAtTarget: 0,
  progressionHistory: [],
};

describe('coaching helpers', () => {
  it('computes minimum viable minutes', () => {
    assert.equal(minimumViableMinutes(15), 5);
    assert.equal(minimumViableMinutes(60), 25);
    assert.ok(minimumViableMinutes(10) <= 10);
  });

  it('detects momentum direction', () => {
    assert.equal(computeMomentum([1, 0.4, 0.4]), 'improving');
    assert.equal(computeMomentum([0.2, 0.8, 0.7]), 'slipping');
    assert.equal(computeMomentum([0.6, 0.55]), 'stable');
  });

  it('builds identity-aware coaching copy', () => {
    assert.match(identityLine('Morning workout'), /moves their body/i);
    const snapshot = buildCoachingSnapshot(habit, []);
    assert.ok(snapshot.minimumViableLabel.includes('keep the chain alive'));
    assert.ok(snapshot.headline.length > 0);
  });
});

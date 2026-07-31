import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createHabitGoal,
  isLevelSmaller,
  progressTowardTarget,
  suggestStartFromTarget,
  validateCreateHabitInput,
} from './habits';

describe('habit helpers', () => {
  it('requires start to be smaller than target', () => {
    assert.equal(
      isLevelSmaller(
        { frequencyPerWeek: 2, durationMinutes: 15 },
        { frequencyPerWeek: 5, durationMinutes: 60 },
      ),
      true,
    );

    assert.equal(
      isLevelSmaller(
        { frequencyPerWeek: 5, durationMinutes: 60 },
        { frequencyPerWeek: 5, durationMinutes: 60 },
      ),
      false,
    );

    assert.equal(
      isLevelSmaller(
        { frequencyPerWeek: 6, durationMinutes: 10 },
        { frequencyPerWeek: 5, durationMinutes: 60 },
      ),
      false,
    );
  });

  it('validates create input', () => {
    assert.equal(
      validateCreateHabitInput({
        title: 'Work out',
        target: { frequencyPerWeek: 5, durationMinutes: 60 },
        start: { frequencyPerWeek: 2, durationMinutes: 15 },
        pace: 'steady',
      }),
      null,
    );

    assert.match(
      validateCreateHabitInput({
        title: '',
        target: { frequencyPerWeek: 5, durationMinutes: 60 },
        start: { frequencyPerWeek: 2, durationMinutes: 15 },
        pace: 'steady',
      }) ?? '',
      /name/i,
    );
  });

  it('creates habit with current equal to start', () => {
    const habit = createHabitGoal({
      title: '  Read  ',
      target: { frequencyPerWeek: 7, durationMinutes: 30 },
      start: { frequencyPerWeek: 3, durationMinutes: 10 },
      pace: 'gentle',
    });

    assert.equal(habit.title, 'Read');
    assert.deepEqual(habit.current, habit.start);
    assert.equal(progressTowardTarget(habit), 0);
  });

  it('suggests a smaller start from target', () => {
    const start = suggestStartFromTarget({
      frequencyPerWeek: 5,
      durationMinutes: 60,
    });

    assert.ok(start.frequencyPerWeek < 5);
    assert.ok(start.durationMinutes < 60);
  });
});

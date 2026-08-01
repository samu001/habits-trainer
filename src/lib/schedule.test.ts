import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  defaultSchedule,
  normalizeSchedule,
  syncScheduleToFrequency,
} from './schedule';

describe('schedule helpers', () => {
  it('defaults preferred days from frequency', () => {
    const schedule = defaultSchedule(3);
    assert.equal(schedule.preferredDays.length, 3);
    assert.equal(schedule.remindersEnabled, true);
  });

  it('normalizes invalid schedule values', () => {
    const schedule = normalizeSchedule(
      {
        remindersEnabled: false,
        preferredDays: [1, 1, 9 as 0],
        hour: 30,
        minute: 12,
      },
      2,
    );

    assert.equal(schedule.remindersEnabled, false);
    assert.deepEqual(schedule.preferredDays, [1]);
    assert.equal(schedule.hour, 23);
    assert.equal(schedule.minute, 0);
  });

  it('syncs preferred days to frequency changes', () => {
    const expanded = syncScheduleToFrequency(
      {
        remindersEnabled: true,
        preferredDays: [1],
        hour: 8,
        minute: 0,
      },
      { frequencyPerWeek: 3, durationMinutes: 20 },
    );
    assert.equal(expanded.preferredDays.length, 3);

    const shrunk = syncScheduleToFrequency(
      {
        remindersEnabled: true,
        preferredDays: [1, 2, 3, 4],
        hour: 8,
        minute: 0,
      },
      { frequencyPerWeek: 2, durationMinutes: 20 },
    );
    assert.equal(shrunk.preferredDays.length, 2);
  });
});

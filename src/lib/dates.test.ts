import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getWeekId, getWeekStart, isDateInWeek } from './dates';

describe('week helpers', () => {
  it('starts weeks on Monday', () => {
    // Wednesday, March 4, 2026 local
    const wednesday = new Date(2026, 2, 4, 15, 30);
    const start = getWeekStart(wednesday);

    assert.equal(start.getFullYear(), 2026);
    assert.equal(start.getMonth(), 2);
    assert.equal(start.getDate(), 2); // Monday
    assert.equal(start.getDay(), 1);
  });

  it('uses Monday date as week id', () => {
    const sunday = new Date(2026, 2, 8, 9, 0);
    assert.equal(getWeekId(sunday), '2026-03-02');
  });

  it('checks whether a timestamp belongs to a week', () => {
    const midWeek = new Date(2026, 2, 4, 12, 0);
    assert.equal(isDateInWeek(midWeek.toISOString(), getWeekId(midWeek)), true);
  });
});

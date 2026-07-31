const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday-start week helpers (local timezone). */
export function getWeekStart(date: Date = new Date()): Date {
  const day = startOfLocalDay(date);
  const dayOfWeek = day.getDay(); // 0 Sun ... 6 Sat
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return new Date(day.getTime() - daysSinceMonday * DAY_MS);
}

export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  return new Date(start.getTime() + 6 * DAY_MS);
}

export function getWeekId(date: Date = new Date()): string {
  const start = getWeekStart(date);
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatWeekRange(date: Date = new Date()): string {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const startLabel = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const endLabel = end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${startLabel} – ${endLabel}`;
}

export function formatLoggedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isDateInWeek(iso: string, weekId: string): boolean {
  return getWeekId(new Date(iso)) === weekId;
}

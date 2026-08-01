import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';

import { normalizeHabitGoal } from './progression';
import type { HabitGoal } from '../types/habit';
import type { SessionLog } from '../types/logging';

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  habits: HabitGoal[];
  logs: SessionLog[];
};

export function createBackupPayload(
  habits: HabitGoal[],
  logs: SessionLog[],
): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    logs,
  };
}

export function serializeBackup(payload: BackupPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function parseBackup(raw: string): BackupPayload {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Backup file is invalid.');
  }

  const data = parsed as Record<string, unknown>;
  if (data.version !== 1 || !Array.isArray(data.habits) || !Array.isArray(data.logs)) {
    throw new Error('Unsupported or invalid backup format.');
  }

  return {
    version: 1,
    exportedAt:
      typeof data.exportedAt === 'string'
        ? data.exportedAt
        : new Date().toISOString(),
    habits: data.habits.map((habit) => normalizeHabitGoal(habit as HabitGoal)),
    logs: data.logs as SessionLog[],
  };
}

export async function shareBackup(habits: HabitGoal[], logs: SessionLog[]) {
  const payload = createBackupPayload(habits, logs);
  const serialized = serializeBackup(payload);
  await Share.share({
    message: serialized,
    title: 'Habits Trainer backup',
  });
  return serialized;
}

export async function copyBackup(habits: HabitGoal[], logs: SessionLog[]) {
  const serialized = serializeBackup(createBackupPayload(habits, logs));
  await Clipboard.setStringAsync(serialized);
  return serialized;
}

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatScheduleTime } from './schedule';
import type { HabitGoal } from '../types/habit';
import { WEEKDAY_LABELS } from '../types/habit';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureReminderPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function syncHabitReminders(habits: HabitGoal[]): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const active = habits.filter(
    (habit) =>
      habit.status !== 'paused' &&
      habit.status !== 'archived' &&
      habit.schedule.remindersEnabled,
  );

  if (active.length === 0) {
    return 0;
  }

  const allowed = await ensureReminderPermissions();
  if (!allowed) {
    return 0;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  let scheduled = 0;

  for (const habit of active) {
    for (const day of habit.schedule.preferredDays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: habit.title,
          body: `Time for your ${habit.current.durationMinutes}-minute session. A nudge — not a judgment.`,
          data: { habitId: habit.id },
          ...(Platform.OS === 'android' ? { channelId: 'habits' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1, // Expo: 1=Sunday
          hour: habit.schedule.hour,
          minute: habit.schedule.minute,
        },
      });
      scheduled += 1;
    }
  }

  return scheduled;
}

export function describeHabitReminder(habit: HabitGoal): string {
  if (!habit.schedule.remindersEnabled) {
    return 'Reminders off';
  }

  const days = habit.schedule.preferredDays
    .slice()
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_LABELS[day])
    .join(', ');

  return `${days} · ${formatScheduleTime(habit.schedule.hour, habit.schedule.minute)}`;
}

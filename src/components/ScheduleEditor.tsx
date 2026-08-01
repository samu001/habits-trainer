import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { formatScheduleTime } from '../lib/schedule';
import type { HabitSchedule, WeekdayIndex } from '../types/habit';
import { WEEKDAY_LABELS } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { Card } from './Card';

type ScheduleEditorProps = {
  schedule: HabitSchedule;
  onChange: (schedule: Partial<HabitSchedule>) => void;
};

const HOUR_OPTIONS = [6, 7, 8, 9, 12, 17, 18, 19, 20, 21];

export function ScheduleEditor({ schedule, onChange }: ScheduleEditorProps) {
  const toggleDay = (day: WeekdayIndex) => {
    const exists = schedule.preferredDays.includes(day);
    const preferredDays = exists
      ? schedule.preferredDays.filter((item) => item !== day)
      : [...schedule.preferredDays, day].sort((a, b) => a - b);

    onChange({
      preferredDays:
        preferredDays.length > 0 ? preferredDays : schedule.preferredDays,
    });
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Mission schedule
      </Text>
      <Text style={styles.help}>
        Gentle nudges only — missed reminders never punish your arc or credits.
      </Text>

      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>Reminders</Text>
          <Text style={styles.help}>
            {schedule.remindersEnabled
              ? `On · ${formatScheduleTime(schedule.hour, schedule.minute)}`
              : 'Off'}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Enable habit reminders"
          value={schedule.remindersEnabled}
          onValueChange={(remindersEnabled) => onChange({ remindersEnabled })}
          trackColor={{ false: colors.borderStrong, true: colors.primary }}
        />
      </View>

      <Text style={styles.label}>Preferred days</Text>
      <View style={styles.days}>
        {WEEKDAY_LABELS.map((label, index) => {
          const day = index as WeekdayIndex;
          const selected = schedule.preferredDays.includes(day);
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label} reminder day`}
              onPress={() => toggleDay(day)}
              style={[styles.day, selected && styles.daySelected]}
            >
              <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Preferred time</Text>
      <View style={styles.times}>
        {HOUR_OPTIONS.map((hour) => {
          const selected = schedule.hour === hour;
          return (
            <Pressable
              key={hour}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Reminder time ${formatScheduleTime(hour, 0)}`}
              onPress={() => onChange({ hour, minute: 0 })}
              style={[styles.time, selected && styles.timeSelected]}
            >
              <Text style={[styles.timeText, selected && styles.timeTextSelected]}>
                {formatScheduleTime(hour, 0)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  help: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  day: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  daySelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  dayText: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayTextSelected: {
    color: colors.primaryDark,
  },
  times: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  time: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  timeSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  timeText: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  timeTextSelected: {
    color: colors.primaryDark,
  },
});

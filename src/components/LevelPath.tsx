import { StyleSheet, Text, View } from 'react-native';

import { formatLevel, levelsEqual } from '../lib/habits';
import { buildLevelLadder } from '../lib/progression';
import type { HabitGoal } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { Card } from './Card';

type LevelPathProps = {
  habit: HabitGoal;
};

export function LevelPath({ habit }: LevelPathProps) {
  const ladder = buildLevelLadder(habit.start, habit.target);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Progress path</Text>
      <Text style={styles.help}>
        One small step at a time — duration and frequency take turns climbing.
      </Text>
      <View style={styles.list}>
        {ladder.map((level, index) => {
          const isCurrent = levelsEqual(level, habit.current);
          const isStart = index === 0;
          const isTarget = index === ladder.length - 1;
          const reached =
            habit.current.frequencyPerWeek * habit.current.durationMinutes >=
            level.frequencyPerWeek * level.durationMinutes;

          return (
            <View
              key={`${level.frequencyPerWeek}-${level.durationMinutes}-${index}`}
              style={[
                styles.row,
                isCurrent && styles.rowCurrent,
                reached && !isCurrent && styles.rowReached,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  isCurrent && styles.dotCurrent,
                  reached && !isCurrent && styles.dotReached,
                ]}
              />
              <View style={styles.rowText}>
                <Text style={[styles.levelText, isCurrent && styles.levelCurrent]}>
                  {formatLevel(level)}
                </Text>
                <Text style={styles.meta}>
                  {isCurrent
                    ? 'Current level'
                    : isStart
                      ? 'Start'
                      : isTarget
                        ? 'Target'
                        : reached
                          ? 'Passed'
                          : 'Upcoming'}
                </Text>
              </View>
            </View>
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
    marginTop: -spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  rowCurrent: {
    backgroundColor: colors.primarySoft,
  },
  rowReached: {
    backgroundColor: colors.successSoft,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
  },
  dotCurrent: {
    backgroundColor: colors.primary,
  },
  dotReached: {
    backgroundColor: colors.success,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  levelCurrent: {
    color: colors.primaryDark,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

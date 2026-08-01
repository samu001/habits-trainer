import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { buildCoachingSnapshot } from '../lib/coaching';
import { progressTowardTarget } from '../lib/habits';
import { deriveHabitStatus, formatHabitStatus } from '../lib/load';
import type { HabitGoal } from '../types/habit';
import type { SessionLog, WeeklyProgress } from '../types/logging';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { Button } from './Button';
import { PathMeter } from './PathMeter';

type QuestCardProps = {
  habit: HabitGoal;
  logs: SessionLog[];
  weekly: WeeklyProgress | null;
  featured?: boolean;
  onPress: () => void;
  onLogPress: () => void;
};

export function QuestCard({
  habit,
  logs,
  weekly,
  featured = false,
  onPress,
  onLogPress,
}: QuestCardProps) {
  const status = deriveHabitStatus(habit);
  const inactive = status === 'paused' || status === 'archived';
  const coaching = buildCoachingSnapshot(habit, logs);
  const progress = progressTowardTarget(habit);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${habit.title}, ${formatHabitStatus(status)}`}
      accessibilityHint="Opens habit journey"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed, inactive && styles.inactive]}
    >
      <LinearGradient
        colors={
          featured
            ? [colors.surfaceInk, '#243B63']
            : [colors.surface, '#FFF9F0']
        }
        style={[styles.card, featured && styles.featuredCard]}
      >
        <View style={styles.topRow}>
          <Text style={[styles.kicker, featured && styles.textOnInkMuted]}>
            {featured ? 'Hero quest' : 'Quest'}
          </Text>
          <Text style={[styles.badge, featured && styles.badgeOnInk]}>
            {formatHabitStatus(status)}
          </Text>
        </View>

        <Text style={[styles.title, featured && styles.textOnInk]}>{habit.title}</Text>
        <Text style={[styles.identity, featured && styles.textOnInkMuted]}>
          {coaching.identityLine}
        </Text>

        {weekly && !inactive ? (
          <Text style={[styles.mission, featured && styles.textOnInk]}>
            This week’s mission: {weekly.requiredSessions}× for{' '}
            {weekly.prescribedMinutes} min
          </Text>
        ) : (
          <Text style={[styles.mission, featured && styles.textOnInk]}>
            {coaching.headline}. {coaching.supportLine}
          </Text>
        )}

        <PathMeter
          start={habit.start}
          current={habit.current}
          target={habit.target}
          progress={progress}
          tone={featured ? 'dark' : 'light'}
        />

        {weekly && !inactive ? (
          <Text style={[styles.meta, featured && styles.textOnInkMuted]}>
            {Math.round(weekly.completionRate * 100)}% this week ·{' '}
            {weekly.remainingSessions} sessions left · {coaching.headline}
          </Text>
        ) : (
          <Text style={[styles.meta, featured && styles.textOnInkMuted]}>
            {Math.round(progress * 100)}% along the arc · {coaching.headline}
          </Text>
        )}

        {!inactive ? (
          <Button
            label="Log today’s rep"
            variant={featured ? 'primary' : 'secondary'}
            onPress={onLogPress}
            style={styles.cta}
          />
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredCard: {
    borderColor: '#334E7A',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    ...typography.eyebrow,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  badge: {
    ...typography.caption,
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    fontWeight: '700',
  },
  badgeOnInk: {
    color: colors.backgroundDeep,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  identity: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  mission: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cta: {
    marginTop: spacing.xs,
  },
  textOnInk: {
    color: colors.textOnInk,
  },
  textOnInkMuted: {
    color: colors.textOnInkMuted,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  inactive: {
    opacity: 0.72,
  },
});

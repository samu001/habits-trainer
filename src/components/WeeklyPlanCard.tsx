import { StyleSheet, Text, View } from 'react-native';

import type { WeeklyProgress } from '../types/logging';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { Button } from './Button';
import { Card } from './Card';

type WeeklyPlanCardProps = {
  progress: WeeklyProgress;
  onLogPress?: () => void;
  compact?: boolean;
};

export function WeeklyPlanCard({
  progress,
  onLogPress,
  compact = false,
}: WeeklyPlanCardProps) {
  const creditLabel = `${progress.earnedCredits.toFixed(
    progress.earnedCredits % 1 === 0 ? 0 : 1,
  )}/${progress.requiredSessions}`;

  return (
    <Card style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>This week</Text>
        <Text style={styles.weekLabel}>{progress.weekLabel}</Text>
      </View>

      <Text style={styles.prescription}>{progress.prescriptionLabel}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{creditLabel}</Text>
          <Text style={styles.statLabel}>credits earned</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{progress.remainingSessions}</Text>
          <Text style={styles.statLabel}>sessions left</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {Math.round(progress.completionRate * 100)}%
          </Text>
          <Text style={styles.statLabel}>completion</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress.completionRate * 100}%` },
          ]}
        />
      </View>

      {progress.isComplete ? (
        <Text style={styles.completeText}>
          Week complete — nice work staying with your current level.
        </Text>
      ) : (
        <Text style={styles.helpText}>
          Aim for {progress.prescribedMinutes} minutes each session.
        </Text>
      )}

      {onLogPress ? (
        <Button
          label="Log session"
          onPress={onLogPress}
          style={styles.logButton}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  compactCard: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  weekLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  prescription: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  helpText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  completeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  logButton: {
    marginTop: spacing.xs,
  },
});

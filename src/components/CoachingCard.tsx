import { StyleSheet, Text, View } from 'react-native';

import {
  formatMomentum,
  type CoachingSnapshot,
} from '../lib/coaching';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { Card } from './Card';

type CoachingCardProps = {
  coaching: CoachingSnapshot;
};

export function CoachingCard({ coaching }: CoachingCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.eyebrow}>Coach</Text>
      <Text style={styles.headline}>{coaching.headline}</Text>
      <Text style={styles.support}>{coaching.supportLine}</Text>
      <Text style={styles.identity}>{coaching.identityLine}</Text>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {Math.round(coaching.consistencyScore * 100)}%
          </Text>
          <Text style={styles.metricLabel}>Consistency</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {Math.round(coaching.levelProgress * 100)}%
          </Text>
          <Text style={styles.metricLabel}>Level path</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {formatMomentum(coaching.momentum)}
          </Text>
          <Text style={styles.metricLabel}>Momentum</Text>
        </View>
      </View>

      <View style={styles.fallbackBox}>
        <Text style={styles.fallbackLabel}>Hard-day fallback</Text>
        <Text style={styles.fallbackText}>{coaching.minimumViableLabel}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  support: {
    ...typography.body,
    color: colors.textSecondary,
  },
  identity: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  fallbackBox: {
    backgroundColor: colors.warningSoft,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 4,
  },
  fallbackLabel: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fallbackText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});

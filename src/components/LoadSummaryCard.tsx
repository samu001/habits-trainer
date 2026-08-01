import { StyleSheet, Text, View } from 'react-native';

import type { WeeklyLoadSummary } from '../lib/load';
import { MAX_RECOMMENDED_BUILDING_HABITS } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { Card } from './Card';

type LoadSummaryCardProps = {
  load: WeeklyLoadSummary;
};

export function LoadSummaryCard({ load }: LoadSummaryCardProps) {
  return (
    <Card style={styles.card} variant={load.isBuildingAtCapacity ? 'gold' : 'default'}>
      <Text style={styles.title}>Training load</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.value}>{load.buildingHabits.length}</Text>
          <Text style={styles.label}>building</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{load.maintainingHabits.length}</Text>
          <Text style={styles.label}>maintaining</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{load.totalSessions}</Text>
          <Text style={styles.label}>sessions</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{load.totalMinutes}</Text>
          <Text style={styles.label}>minutes</Text>
        </View>
      </View>

      <Text style={styles.help}>
        Soft max {MAX_RECOMMENDED_BUILDING_HABITS} building quests at a time —
        pause when life gets heavy.
      </Text>

      {load.sequencingTip ? (
        <Text style={styles.tip}>{load.sequencingTip}</Text>
      ) : null}

      {load.warnings.map((warning) => (
        <Text key={warning} style={styles.warning}>
          {warning}
        </Text>
      ))}
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
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    width: '47%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  help: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tip: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    backgroundColor: colors.warningSoft,
    borderRadius: radii.sm,
    padding: spacing.sm,
    overflow: 'hidden',
    fontWeight: '600',
  },
});

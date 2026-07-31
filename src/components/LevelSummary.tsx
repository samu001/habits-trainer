import { StyleSheet, Text, View } from 'react-native';

import { formatLevel } from '../lib/habits';
import type { HabitLevel } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';

type LevelSummaryProps = {
  label: string;
  level: HabitLevel;
  emphasis?: 'default' | 'primary' | 'success';
};

export function LevelSummary({
  label,
  level,
  emphasis = 'default',
}: LevelSummaryProps) {
  return (
    <View style={[styles.container, styles[emphasis]]}>
      <Text style={[styles.label, styles[`${emphasis}Label`]]}>{label}</Text>
      <Text style={[styles.value, styles[`${emphasis}Value`]]}>
        {formatLevel(level)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.surfaceMuted,
  },
  default: {
    backgroundColor: colors.surfaceMuted,
  },
  primary: {
    backgroundColor: colors.primarySoft,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  defaultLabel: {
    color: colors.textSecondary,
  },
  primaryLabel: {
    color: colors.primaryDark,
  },
  successLabel: {
    color: colors.success,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  defaultValue: {
    color: colors.text,
  },
  primaryValue: {
    color: colors.primaryDark,
  },
  successValue: {
    color: colors.success,
  },
});

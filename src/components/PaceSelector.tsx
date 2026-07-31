import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PACE_OPTIONS, type HabitPace } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';

type PaceSelectorProps = {
  value: HabitPace;
  onChange: (pace: HabitPace) => void;
};

export function PaceSelector({ value, onChange }: PaceSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Progression pace</Text>
      <View style={styles.options}>
        {PACE_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
              <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: 4,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primaryDark,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  optionDescriptionSelected: {
    color: colors.primaryDark,
  },
});

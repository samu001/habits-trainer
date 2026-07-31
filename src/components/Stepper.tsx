import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme/tokens';

type StepperProps = {
  label: string;
  value: number;
  suffix: string;
  minimum: number;
  maximum: number;
  step?: number;
  onChange: (value: number) => void;
  helpText?: string;
};

export function Stepper({
  label,
  value,
  suffix,
  minimum,
  maximum,
  step = 1,
  onChange,
  helpText,
}: StepperProps) {
  const decrease = () => onChange(Math.max(minimum, value - step));
  const increase = () => onChange(Math.min(maximum, value + step));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {helpText ? <Text style={styles.help}>{helpText}</Text> : null}
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          onPress={decrease}
          disabled={value <= minimum}
          style={({ pressed }) => [
            styles.button,
            (value <= minimum || pressed) && styles.buttonMuted,
          ]}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.suffix}>{suffix}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          onPress={increase}
          disabled={value >= maximum}
          style={({ pressed }) => [
            styles.button,
            (value >= maximum || pressed) && styles.buttonMuted,
          ]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    gap: 2,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  help: {
    ...typography.caption,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMuted: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: -2,
  },
  valueBox: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  suffix: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

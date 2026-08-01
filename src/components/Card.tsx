import { type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, shadows, spacing } from '../theme/tokens';

type CardVariant = 'default' | 'ink' | 'gold' | 'ghost';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
};

export function Card({
  children,
  style,
  variant = 'default',
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  return (
    <View
      style={[styles.card, styles[variant], style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    ...shadows.card,
  },
  ink: {
    backgroundColor: colors.surfaceInk,
    borderColor: '#2A3F66',
    ...shadows.card,
  },
  gold: {
    backgroundColor: colors.primarySoft,
    borderColor: '#E2C76A',
    ...shadows.glow,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
});

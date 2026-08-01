import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radii, spacing, typography } from '../theme/tokens';
import { Button } from './Button';

type CelebrationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  emoji?: string;
  tone?: 'gold' | 'calm' | 'warn';
  onClose: () => void;
};

export function CelebrationModal({
  visible,
  title,
  message,
  emoji = '⚡',
  tone = 'gold',
  onClose,
}: CelebrationModalProps) {
  const gradient =
    tone === 'warn'
      ? ([colors.warningSoft, '#FFF8EC'] as const)
      : tone === 'calm'
        ? ([colors.successSoft, '#F4FFF9'] as const)
        : ([colors.primarySoft, '#FFF8E3'] as const);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <LinearGradient colors={gradient} style={styles.gradient}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <Button label="Continue the arc" onPress={onClose} />
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.xxl,
    gap: spacing.md,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 42,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});

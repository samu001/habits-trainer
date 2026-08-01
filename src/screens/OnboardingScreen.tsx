import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useHabits } from '../context/HabitsContext';
import { colors, radii, spacing, typography } from '../theme/tokens';

const STEPS = [
  {
    title: 'Begin embarrassingly small',
    body: 'Big goals are the destination. Tiny starts are the quest. Want 5×60 workouts? Begin at 2×15.',
  },
  {
    title: 'Follow this week’s mission',
    body: 'Each week has one clear prescription at your current level. Log complete, partial, or skipped — honesty beats heroics.',
  },
  {
    title: 'Climb one rung at a time',
    body: 'Strong weeks level you up. Medium weeks hold. Tough weeks can gently reset so the arc stays alive.',
  },
];

export function OnboardingScreen() {
  const { completeOnboarding } = useHabits();

  return (
    <Screen scroll contentStyle={styles.content}>
      <LinearGradient
        colors={[colors.surfaceInk, '#243B63']}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>Training Arc</Text>
        <Text style={styles.heroTitle}>Start small. Build up.</Text>
        <Text style={styles.heroBody}>
          This is a coach, not a guilt checklist. Protect the spark — intensity
          comes later.
        </Text>
      </LinearGradient>

      {STEPS.map((step, index) => (
        <Card key={step.title} style={styles.card} variant={index === 0 ? 'gold' : 'default'}>
          <Text style={styles.stepNumber}>Chapter {index + 1}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>
        </Card>
      ))}

      <View style={styles.footer}>
        <Button
          label="Begin my first quest"
          onPress={() => void completeOnboarding()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  hero: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  heroEyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.title,
    color: colors.textOnInk,
  },
  heroBody: {
    ...typography.body,
    color: colors.textOnInkMuted,
  },
  card: {
    gap: spacing.sm,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  stepBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useHabits } from '../context/HabitsContext';
import { colors, spacing, typography } from '../theme/tokens';

const STEPS = [
  {
    title: 'Start embarrassingly small',
    body: 'Big goals are great. Tiny starts are what stick. Want 5×60 workouts? Begin at 2×15.',
  },
  {
    title: 'Follow this week’s prescription',
    body: 'Each week has one clear job at your current level. Log complete, partial, or skipped.',
  },
  {
    title: 'Grow one step at a time',
    body: 'Strong weeks level you up. Medium weeks hold. Tough weeks can gently downshift.',
  },
];

export function OnboardingScreen() {
  const { completeOnboarding } = useHabits();

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.eyebrow}>Welcome</Text>
      <Text style={styles.title}>Start small. Build up.</Text>
      <Text style={styles.subtitle}>
        Habits Trainer is a coach, not a guilt checklist. Consistency first,
        intensity later.
      </Text>

      {STEPS.map((step, index) => (
        <Card key={step.title} style={styles.card}>
          <Text style={styles.stepNumber}>Step {index + 1}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>
        </Card>
      ))}

      <View style={styles.footer}>
        <Button label="Let’s build a habit" onPress={() => void completeOnboarding()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
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
  },
});

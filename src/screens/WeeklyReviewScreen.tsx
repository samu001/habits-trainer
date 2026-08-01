import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CelebrationModal } from '../components/CelebrationModal';
import { Screen } from '../components/Screen';
import { useHabits } from '../context/HabitsContext';
import { buildCoachingSnapshot } from '../lib/coaching';
import { getWeekId } from '../lib/dates';
import type { RootStackParamList } from '../navigation/types';
import type { ReflectionIntention } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';

type ReviewRoute = RouteProp<RootStackParamList, 'WeeklyReview'>;
type ReviewNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'WeeklyReview'
>;

const INTENTIONS: {
  value: ReflectionIntention;
  label: string;
  description: string;
}[] = [
  {
    value: 'keep',
    label: 'Keep climbing',
    description: 'Trust the arc rules for this week.',
  },
  {
    value: 'hold',
    label: 'Hold this level',
    description: 'Stay here even if you earned a change.',
  },
  {
    value: 'adjust',
    label: 'Stay open',
    description: 'Level up or gently reset based on the data.',
  },
];

type CelebrationState = {
  title: string;
  message: string;
  emoji: string;
  tone: 'gold' | 'calm' | 'warn';
};

export function WeeklyReviewScreen() {
  const navigation = useNavigation<ReviewNavigation>();
  const route = useRoute<ReviewRoute>();
  const { getHabit, getWeeklyProgress, logs, evaluateWeek } = useHabits();

  const habit = getHabit(route.params.habitId);
  const weekly = habit ? getWeeklyProgress(habit.id) : null;
  const coaching = useMemo(
    () => (habit ? buildCoachingSnapshot(habit, logs) : null),
    [habit, logs],
  );

  const [wentWell, setWentWell] = useState('');
  const [intention, setIntention] = useState<ReflectionIntention>('keep');
  const [saving, setSaving] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  if (!habit || !weekly || !coaching) {
    return (
      <Screen contentStyle={styles.missing}>
        <Card style={styles.section}>
          <Text style={styles.title}>Quest not found</Text>
          <Button label="Go back" onPress={() => navigation.goBack()} />
        </Card>
      </Screen>
    );
  }

  const alreadyEvaluated = habit.lastEvaluatedWeekId === getWeekId();

  const onSubmit = async () => {
    setSaving(true);
    try {
      const result = await evaluateWeek(habit.id, getWeekId(), {
        wentWell: wentWell.trim(),
        intention,
      });

      const action = result.decision.action;
      const next: CelebrationState =
        action === 'level_up'
          ? {
              title: 'Level up!',
              message: result.decision.message,
              emoji: '⚡',
              tone: 'gold',
            }
          : action === 'downshift'
            ? {
                title: 'Gentle reset',
                message: result.decision.message,
                emoji: '🛡️',
                tone: 'warn',
              }
            : action === 'maintain'
              ? {
                  title: 'Level held',
                  message: result.decision.message,
                  emoji: '🛡️',
                  tone: 'calm',
                }
              : {
                  title: 'Week sealed',
                  message: result.decision.message,
                  emoji: '✦',
                  tone: 'calm',
                };

      setCelebration(next);
    } catch (err) {
      Alert.alert(
        'Could not review week',
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.eyebrow}>Weekly ritual</Text>
      <Text style={styles.title}>{habit.title}</Text>
      <Text style={styles.subtitle}>
        Reflect first. Then the arc decides: climb, hold, or gently reset.
      </Text>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>This week’s chapter</Text>
        <Text style={styles.body}>
          {Math.round(weekly.completionRate * 100)}% completion ·{' '}
          {weekly.earnedCredits.toFixed(weekly.earnedCredits % 1 === 0 ? 0 : 1)}/
          {weekly.requiredSessions} credits
        </Text>
        <Text style={styles.caption}>
          {coaching.headline}. {coaching.supportLine}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>What went well?</Text>
        <TextInput
          value={wentWell}
          onChangeText={setWentWell}
          placeholder="e.g. Morning sessions felt easier"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>What should the arc do next?</Text>
        <View style={styles.options}>
          {INTENTIONS.map((option) => {
            const selected = option.value === intention;
            return (
              <Pressable
                key={option.value}
                onPress={() => setIntention(option.value)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    selected && styles.optionDescriptionSelected,
                  ]}
                >
                  {option.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Button
        label={alreadyEvaluated ? 'Week already sealed' : 'Seal the week'}
        onPress={() => void onSubmit()}
        loading={saving}
        disabled={alreadyEvaluated}
      />
      <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />

      <CelebrationModal
        visible={celebration !== null}
        title={celebration?.title ?? ''}
        message={celebration?.message ?? ''}
        emoji={celebration?.emoji}
        tone={celebration?.tone}
        onClose={() => {
          setCelebration(null);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  missing: {
    justifyContent: 'center',
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.heading,
    color: colors.text,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.surface,
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

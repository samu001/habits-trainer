import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
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
    label: 'Keep going',
    description: 'Trust the progression rules for this week.',
  },
  {
    value: 'hold',
    label: 'Hold level',
    description: 'Stay at the current level even if you earned a change.',
  },
  {
    value: 'adjust',
    label: 'Be ready to adjust',
    description: 'Open to level-up or downshift based on the data.',
  },
];

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

  if (!habit || !weekly || !coaching) {
    return (
      <Screen contentStyle={styles.missing}>
        <Card style={styles.section}>
          <Text style={styles.title}>Habit not found</Text>
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

      const title =
        result.decision.action === 'level_up'
          ? 'Level up!'
          : result.decision.action === 'downshift'
            ? 'Downshift'
            : result.decision.action === 'maintain'
              ? 'Target maintained'
              : 'Week reviewed';

      Alert.alert(title, result.decision.message, [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]);
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
        Reflect first, then let the coach apply this week’s progression decision.
      </Text>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>This week</Text>
        <Text style={styles.body}>
          {Math.round(weekly.completionRate * 100)}% completion ·{' '}
          {weekly.earnedCredits.toFixed(weekly.earnedCredits % 1 === 0 ? 0 : 1)}/
          {weekly.requiredSessions} credits
        </Text>
        <Text style={styles.caption}>{coaching.headline}. {coaching.supportLine}</Text>
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
        <Text style={styles.sectionTitle}>What should we do next?</Text>
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
        label={alreadyEvaluated ? 'Week already reviewed' : 'Finish weekly review'}
        onPress={() => void onSubmit()}
        loading={saving}
        disabled={alreadyEvaluated}
      />
      <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
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
    color: colors.primary,
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

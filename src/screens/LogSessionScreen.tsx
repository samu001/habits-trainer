import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Stepper } from '../components/Stepper';
import { useHabits } from '../context/HabitsContext';
import { minimumViableMinutes } from '../lib/coaching';
import type { RootStackParamList } from '../navigation/types';
import type { SessionResult } from '../types/logging';
import { colors, radii, spacing, typography } from '../theme/tokens';

type LogRoute = RouteProp<RootStackParamList, 'LogSession'>;
type LogNavigation = NativeStackNavigationProp<RootStackParamList, 'LogSession'>;

const RESULT_OPTIONS: {
  value: SessionResult;
  label: string;
  description: string;
}[] = [
  {
    value: 'completed',
    label: 'Completed',
    description: 'Did the full prescribed session.',
  },
  {
    value: 'partial',
    label: 'Partial',
    description: 'Did some of it — every bit still counts.',
  },
  {
    value: 'skipped',
    label: 'Skipped',
    description: 'Couldn’t do it today. No shame — just log it.',
  },
];

export function LogSessionScreen() {
  const navigation = useNavigation<LogNavigation>();
  const route = useRoute<LogRoute>();
  const { getHabit, getWeeklyProgress, logSession } = useHabits();

  const habit = getHabit(route.params.habitId);
  const weekly = habit ? getWeeklyProgress(habit.id) : null;

  const [result, setResult] = useState<SessionResult>('completed');
  const [minutesDone, setMinutesDone] = useState(
    weekly?.prescribedMinutes ?? 15,
  );
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const prescribedMinutes = weekly?.prescribedMinutes ?? habit?.current.durationMinutes ?? 0;
  const minViable = minimumViableMinutes(prescribedMinutes || 15);

  const creditPreview = useMemo(() => {
    if (result === 'skipped') {
      return 0;
    }
    if (result === 'completed' || minutesDone >= prescribedMinutes) {
      return 1;
    }
    if (minutesDone <= 0 || prescribedMinutes <= 0) {
      return 0;
    }
    return minutesDone / prescribedMinutes;
  }, [result, minutesDone, prescribedMinutes]);

  if (!habit || !weekly) {
    return (
      <Screen contentStyle={styles.missingContent}>
        <Card style={styles.section}>
          <Text style={styles.title}>Habit not found</Text>
          <Button label="Go back" onPress={() => navigation.goBack()} />
        </Card>
      </Screen>
    );
  }

  const onSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await logSession({
        habitId: habit.id,
        result,
        minutesDone: result === 'skipped' ? 0 : minutesDone,
        note: note.trim() ? note.trim() : undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Log session</Text>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={styles.subtitle}>
          This week’s prescription: {weekly.requiredSessions}× for{' '}
          {prescribedMinutes} minutes.
        </Text>
      </View>

      <Card style={styles.fallbackCard}>
        <Text style={styles.fallbackLabel}>Hard-day fallback</Text>
        <Text style={styles.fallbackText}>
          Can’t do {prescribedMinutes} min? Do {minViable} min to keep the chain
          alive — log it as partial.
        </Text>
        <Button
          label={`Use ${minViable}-min fallback`}
          variant="secondary"
          onPress={() => {
            setResult('partial');
            setMinutesDone(minViable);
            setError(null);
          }}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>How did it go?</Text>
        <View style={styles.options}>
          {RESULT_OPTIONS.map((option) => {
            const selected = option.value === result;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  setResult(option.value);
                  setError(null);
                  if (option.value === 'completed') {
                    setMinutesDone(prescribedMinutes);
                  } else if (option.value === 'partial') {
                    setMinutesDone(
                      Math.max(1, Math.round(prescribedMinutes / 2)),
                    );
                  }
                }}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    selected && styles.optionLabelSelected,
                  ]}
                >
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

      {result === 'partial' ? (
        <Card style={styles.section}>
          <Stepper
            label="Minutes completed"
            value={minutesDone}
            suffix="minutes"
            minimum={1}
            maximum={Math.max(prescribedMinutes * 2, prescribedMinutes)}
            step={minutesDone < 15 ? 1 : 5}
            onChange={(value) => {
              setMinutesDone(value);
              setError(null);
            }}
            helpText={`Prescribed: ${prescribedMinutes} minutes`}
          />
        </Card>
      ) : null}

      {result === 'completed' ? (
        <Card style={styles.section}>
          <Stepper
            label="Minutes completed"
            value={minutesDone}
            suffix="minutes"
            minimum={1}
            maximum={Math.max(prescribedMinutes * 3, 180)}
            step={5}
            onChange={(value) => {
              setMinutesDone(value);
              setError(null);
            }}
            helpText="Defaults to the full prescription. Increase if you did more."
          />
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.label}>
          {result === 'skipped' ? 'Reason (optional)' : 'Note (optional)'}
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={
            result === 'skipped'
              ? 'e.g. Travel day, low energy'
              : 'e.g. Felt strong today'
          }
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
      </Card>

      <Card style={styles.previewCard}>
        <Text style={styles.previewLabel}>Credit preview</Text>
        <Text style={styles.previewValue}>
          {creditPreview >= 1
            ? 'Full credit (1.0)'
            : creditPreview <= 0
              ? 'No credit (0)'
              : `${creditPreview.toFixed(2)} credit`}
        </Text>
        <Text style={styles.previewHelp}>
          Weekly completion uses earned credits ÷ required sessions.
        </Text>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Save session" onPress={() => void onSave()} loading={saving} />
      <Button
        label="Cancel"
        variant="ghost"
        onPress={() => navigation.goBack()}
        disabled={saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  missingContent: {
    justifyContent: 'center',
  },
  header: {
    gap: spacing.sm,
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
  label: {
    ...typography.label,
    color: colors.text,
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
    minHeight: 88,
    textAlignVertical: 'top',
  },
  previewCard: {
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
  },
  previewLabel: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  previewHelp: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  fallbackCard: {
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
  },
  fallbackLabel: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fallbackText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  error: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
  },
});

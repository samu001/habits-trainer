import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PaceSelector } from '../components/PaceSelector';
import { Screen } from '../components/Screen';
import { Stepper } from '../components/Stepper';
import { useHabits, useWeeklyLoad } from '../context/HabitsContext';
import {
  formatLevel,
  suggestStartFromTarget,
  validateCreateHabitInput,
} from '../lib/habits';
import type { RootStackParamList } from '../navigation/types';
import {
  MAX_RECOMMENDED_BUILDING_HABITS,
  type HabitPace,
} from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';

type CreateNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CreateHabit'
>;

export function CreateHabitScreen() {
  const navigation = useNavigation<CreateNavigation>();
  const { addHabit } = useHabits();
  const load = useWeeklyLoad();
  const atCapacity = load.isBuildingAtCapacity;

  const [title, setTitle] = useState('');
  const [targetFrequency, setTargetFrequency] = useState(5);
  const [targetDuration, setTargetDuration] = useState(60);
  const [startFrequency, setStartFrequency] = useState(2);
  const [startDuration, setStartDuration] = useState(15);
  const [pace, setPace] = useState<HabitPace>('steady');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasEditedStart, setHasEditedStart] = useState(false);

  useEffect(() => {
    if (hasEditedStart) {
      return;
    }

    const suggestion = suggestStartFromTarget({
      frequencyPerWeek: targetFrequency,
      durationMinutes: targetDuration,
    });
    setStartFrequency(suggestion.frequencyPerWeek);
    setStartDuration(suggestion.durationMinutes);
  }, [targetFrequency, targetDuration, hasEditedStart]);

  const preview = useMemo(
    () => ({
      target: {
        frequencyPerWeek: targetFrequency,
        durationMinutes: targetDuration,
      },
      start: {
        frequencyPerWeek: startFrequency,
        durationMinutes: startDuration,
      },
    }),
    [targetFrequency, targetDuration, startFrequency, startDuration],
  );

  const onSave = async () => {
    const input = {
      title,
      target: preview.target,
      start: preview.start,
      pace,
    };

    const validationError = validateCreateHabitInput(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    const save = async () => {
      setSaving(true);
      setError(null);

      try {
        const habit = await addHabit(input);
        navigation.replace('HabitDetail', { habitId: habit.id });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save habit.');
      } finally {
        setSaving(false);
      }
    };

    if (atCapacity) {
      Alert.alert(
        'That’s a lot of building habits',
        `You already have ${load.buildingHabits.length} building habits. Most people succeed with ${MAX_RECOMMENDED_BUILDING_HABITS} or fewer. Add another anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add anyway', onPress: () => void save() },
        ],
      );
      return;
    }

    await save();
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.title}>Create a habit goal</Text>
      <Text style={styles.subtitle}>
        Define where you want to end up, then choose how small you want to
        start. You can adjust the starting level freely.
      </Text>

      {atCapacity ? (
        <Card style={styles.warningCard}>
          <Text style={styles.warningTitle}>Load caution</Text>
          <Text style={styles.warningBody}>
            You already have {load.buildingHabits.length} building habits.
            Consider locking one in (or pausing one) before adding another.
          </Text>
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.label}>Habit name</Text>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setError(null);
          }}
          placeholder="e.g. Work out"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={60}
          returnKeyType="done"
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your target</Text>
        <Text style={styles.sectionHelp}>
          The full habit you eventually want to keep.
        </Text>
        <Stepper
          label="Frequency"
          value={targetFrequency}
          suffix="times / week"
          minimum={1}
          maximum={7}
          onChange={setTargetFrequency}
        />
        <Stepper
          label="Duration"
          value={targetDuration}
          suffix="minutes / session"
          minimum={5}
          maximum={180}
          step={5}
          onChange={setTargetDuration}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your starting point</Text>
        <Text style={styles.sectionHelp}>
          Start smaller than the target. Suggested values update as you change
          the target — edit them anytime.
        </Text>
        <Stepper
          label="Starting frequency"
          value={startFrequency}
          suffix="times / week"
          minimum={1}
          maximum={7}
          onChange={(value) => {
            setHasEditedStart(true);
            setStartFrequency(value);
          }}
        />
        <Stepper
          label="Starting duration"
          value={startDuration}
          suffix="minutes / session"
          minimum={1}
          maximum={180}
          step={startDuration < 15 ? 1 : 5}
          onChange={(value) => {
            setHasEditedStart(true);
            setStartDuration(value);
          }}
        />
      </Card>

      <Card style={styles.section}>
        <PaceSelector value={pace} onChange={setPace} />
      </Card>

      <Card style={styles.previewCard}>
        <Text style={styles.sectionTitle}>Plan preview</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Start</Text>
          <Text style={styles.previewValue}>{formatLevel(preview.start)}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Target</Text>
          <Text style={styles.previewValue}>{formatLevel(preview.target)}</Text>
        </View>
        <Text style={styles.previewNote}>
          Your current level begins here. Each week you’ll get a prescription
          at this level and log sessions against it.
        </Text>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Save habit goal" onPress={() => void onSave()} loading={saving} />
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
  title: {
    ...typography.heading,
    color: colors.text,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  sectionHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
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
  },
  previewCard: {
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  previewLabel: {
    ...typography.label,
    color: colors.primaryDark,
  },
  previewValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  previewNote: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },
  warningCard: {
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.warning,
  },
  warningBody: {
    ...typography.body,
    color: colors.text,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
  },
});

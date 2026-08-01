import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
import {
  HABIT_TEMPLATES,
  type HabitTemplate,
} from '../lib/templates';
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (hasEditedStart || selectedTemplateId) {
      return;
    }

    const suggestion = suggestStartFromTarget({
      frequencyPerWeek: targetFrequency,
      durationMinutes: targetDuration,
    });
    setStartFrequency(suggestion.frequencyPerWeek);
    setStartDuration(suggestion.durationMinutes);
  }, [targetFrequency, targetDuration, hasEditedStart, selectedTemplateId]);

  const applyTemplate = (template: HabitTemplate) => {
    setSelectedTemplateId(template.id);
    setTitle(template.title);
    setTargetFrequency(template.target.frequencyPerWeek);
    setTargetDuration(template.target.durationMinutes);
    setStartFrequency(template.start.frequencyPerWeek);
    setStartDuration(template.start.durationMinutes);
    setPace(template.pace);
    setHasEditedStart(true);
    setError(null);
  };

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
        'That’s a lot of building quests',
        `You already have ${load.buildingHabits.length} building quests. Most people succeed with ${MAX_RECOMMENDED_BUILDING_HABITS} or fewer. Add another anyway?`,
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
      <Text style={styles.eyebrow}>New quest</Text>
      <Text style={styles.title}>Begin a training arc</Text>
      <Text style={styles.subtitle}>
        Pick a template, set the dream target, then start smaller than you think.
      </Text>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Templates</Text>
        <View style={styles.templates}>
          {HABIT_TEMPLATES.map((template) => {
            const selected = selectedTemplateId === template.id;
            return (
              <Pressable
                key={template.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${template.category} template`}
                onPress={() => applyTemplate(template)}
                style={[styles.template, selected && styles.templateSelected]}
              >
                <Text
                  style={[
                    styles.templateCategory,
                    selected && styles.templateCategorySelected,
                  ]}
                >
                  {template.category}
                </Text>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateBody}>{template.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {atCapacity ? (
        <Card style={styles.warningCard}>
          <Text style={styles.warningTitle}>Capacity stretched</Text>
          <Text style={styles.warningBody}>
            You already have {load.buildingHabits.length} building quests.
            Consider locking one in (or pausing one) before adding another.
          </Text>
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.label}>Quest name</Text>
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
        <Text style={styles.sectionTitle}>Dream target</Text>
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
        <Text style={styles.sectionTitle}>Starting rung</Text>
        <Text style={styles.sectionHelp}>
          Start smaller than the target. Suggested values update as you change
          the dream — edit them anytime.
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

      <Card style={styles.previewCard} variant="gold">
        <Text style={styles.sectionTitle}>Arc preview</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Start</Text>
          <Text style={styles.previewValue}>{formatLevel(preview.start)}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Target</Text>
          <Text style={styles.previewValue}>{formatLevel(preview.target)}</Text>
        </View>
        <Text style={styles.previewNote}>
          Your current level begins here. Each week you’ll get a mission at this
          rung — log honestly, climb slowly.
        </Text>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Begin this quest" onPress={() => void onSave()} loading={saving} />
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
  templates: {
    gap: spacing.sm,
  },
  template: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  templateSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  templateCategory: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  templateCategorySelected: {
    color: colors.primaryDark,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  templateBody: {
    ...typography.caption,
    color: colors.textSecondary,
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

import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useHabits } from '../context/HabitsContext';
import { copyBackup, shareBackup } from '../lib/backup';
import { buildPortfolioInsights } from '../lib/insights';
import { colors, radii, spacing, typography } from '../theme/tokens';

export function InsightsScreen() {
  const { habits, logs, restoreBackup } = useHabits();
  const insights = useMemo(
    () => buildPortfolioInsights(habits, logs),
    [habits, logs],
  );
  const [importText, setImportText] = useState('');
  const [busy, setBusy] = useState(false);

  const onShare = async () => {
    setBusy(true);
    try {
      await shareBackup(habits, logs);
    } catch (err) {
      Alert.alert(
        'Could not share backup',
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => {
    setBusy(true);
    try {
      await copyBackup(habits, logs);
      Alert.alert('Copied', 'Backup JSON copied to clipboard.');
    } catch (err) {
      Alert.alert(
        'Could not copy backup',
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setBusy(false);
    }
  };

  const onRestore = () => {
    Alert.alert(
      'Restore backup?',
      'This replaces your current habits and logs on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                await restoreBackup(importText);
                setImportText('');
                Alert.alert('Restored', 'Backup imported successfully.');
              } catch (err) {
                Alert.alert(
                  'Could not restore',
                  err instanceof Error ? err.message : 'Invalid backup.',
                );
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.eyebrow} accessibilityRole="header">
        Arc insights
      </Text>
      <Text style={styles.title}>Patterns across your quests</Text>
      <Text style={styles.subtitle}>
        See what’s working, estimate time-to-target, and back up your training
        arc.
      </Text>

      <Card style={styles.section} variant="ink">
        <Text style={styles.inkSectionTitle}>Overview</Text>
        <View style={styles.statRow}>
          <Text style={styles.inkStatLabel}>Avg completion</Text>
          <Text style={styles.inkStatValue}>
            {Math.round(insights.overallAverageCompletion * 100)}%
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.inkStatLabel}>Reps logged</Text>
          <Text style={styles.inkStatValue}>{insights.totalSessionsLogged}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.inkStatLabel}>Most consistent</Text>
          <Text style={styles.inkStatValue}>
            {insights.mostConsistentHabit ?? '—'}
          </Text>
        </View>
      </Card>

      {insights.habits.length === 0 ? (
        <Card style={styles.section} variant="gold">
          <Text style={styles.empty}>
            Begin a quest and log a few reps to unlock arc insights.
          </Text>
        </Card>
      ) : (
        insights.habits.map((habit) => (
          <Card key={habit.habitId} style={styles.section}>
            <Text style={styles.sectionTitle}>{habit.title}</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg completion</Text>
              <Text style={styles.statValue}>
                {Math.round(habit.averageCompletion * 100)}%
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Best day</Text>
              <Text style={styles.statValue}>
                {habit.bestDayLabel
                  ? `${habit.bestDayLabel} (${habit.bestDayCount})`
                  : 'Not enough data'}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Arc progress</Text>
              <Text style={styles.statValue}>
                {Math.round(habit.levelProgress * 100)}%
              </Text>
            </View>
            <Text style={styles.eta}>{habit.estimatedLabel}</Text>
          </Card>
        ))
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Backup & restore</Text>
        <Text style={styles.help}>
          Export a local JSON backup of your training arc. Cloud sync and Apple
          Health are future options.
        </Text>
        <Button label="Share backup" onPress={() => void onShare()} loading={busy} />
        <Button
          label="Copy backup JSON"
          variant="secondary"
          onPress={() => void onCopy()}
          disabled={busy}
        />
        <Text style={styles.label}>Paste backup JSON to restore</Text>
        <TextInput
          value={importText}
          onChangeText={setImportText}
          placeholder='{"version":1,...}'
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          accessibilityLabel="Backup JSON input"
        />
        <Button
          label="Restore from paste"
          variant="danger"
          onPress={onRestore}
          disabled={busy || !importText.trim()}
        />
      </Card>
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
  inkSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textOnInk,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  inkStatLabel: {
    ...typography.label,
    color: colors.textOnInkMuted,
  },
  inkStatValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textOnInk,
    flexShrink: 1,
    textAlign: 'right',
  },
  eta: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
  },
  help: {
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
    minHeight: 120,
    padding: spacing.md,
    color: colors.text,
    textAlignVertical: 'top',
    backgroundColor: colors.surface,
  },
});

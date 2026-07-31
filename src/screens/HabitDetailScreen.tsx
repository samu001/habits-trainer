import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LevelSummary } from '../components/LevelSummary';
import { Screen } from '../components/Screen';
import { WeeklyPlanCard } from '../components/WeeklyPlanCard';
import { useHabits } from '../context/HabitsContext';
import { formatLoggedAt } from '../lib/dates';
import { formatPace, progressTowardTarget } from '../lib/habits';
import {
  formatCredit,
  formatSessionResult,
} from '../lib/prescription';
import type { RootStackParamList } from '../navigation/types';
import type { SessionLog } from '../types/logging';
import { colors, radii, spacing, typography } from '../theme/tokens';

type DetailRoute = RouteProp<RootStackParamList, 'HabitDetail'>;
type DetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'HabitDetail'
>;

function HistoryItem({
  log,
  onDelete,
}: {
  log: SessionLog;
  onDelete: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onLongPress={onDelete}
      style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}
    >
      <View style={styles.historyHeader}>
        <Text style={styles.historyResult}>
          {formatSessionResult(log.result)}
        </Text>
        <Text style={styles.historyCredit}>{formatCredit(log.credit)}</Text>
      </View>
      <Text style={styles.historyMeta}>{formatLoggedAt(log.loggedAt)}</Text>
      <Text style={styles.historyMeta}>
        {log.result === 'skipped'
          ? 'Skipped'
          : `${log.minutesDone} / ${log.prescribedMinutes} min`}
      </Text>
      {log.note ? <Text style={styles.historyNote}>{log.note}</Text> : null}
      <Text style={styles.historyHint}>Long-press to delete</Text>
    </Pressable>
  );
}

export function HabitDetailScreen() {
  const navigation = useNavigation<DetailNavigation>();
  const route = useRoute<DetailRoute>();
  const { getHabit, deleteHabit, getWeeklyProgress, getLogsForHabit, deleteLog } =
    useHabits();

  const habit = getHabit(route.params.habitId);

  if (!habit) {
    return (
      <Screen contentStyle={styles.missingContent}>
        <Card style={styles.section}>
          <Text style={styles.title}>Habit not found</Text>
          <Text style={styles.subtitle}>
            This habit may have been deleted.
          </Text>
          <Button label="Back to home" onPress={() => navigation.navigate('Home')} />
        </Card>
      </Screen>
    );
  }

  const progress = progressTowardTarget(habit);
  const weekly = getWeeklyProgress(habit.id);
  const history = getLogsForHabit(habit.id);

  const onDelete = () => {
    Alert.alert(
      'Delete habit?',
      `Remove “${habit.title}” and its session history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await deleteHabit(habit.id);
              navigation.navigate('Home');
            })();
          },
        },
      ],
    );
  };

  const onDeleteLog = (log: SessionLog) => {
    Alert.alert('Delete session log?', 'Remove this logged session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteLog(log.id);
        },
      },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Habit goal</Text>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={styles.subtitle}>
          Follow this week’s prescription at your current level. Logging keeps
          your progress honest.
        </Text>
      </View>

      {weekly ? (
        <WeeklyPlanCard
          progress={weekly}
          onLogPress={() =>
            navigation.navigate('LogSession', { habitId: habit.id })
          }
        />
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your path</Text>
        <LevelSummary label="Start" level={habit.start} />
        <LevelSummary label="Current" level={habit.current} emphasis="primary" />
        <LevelSummary label="Target" level={habit.target} emphasis="success" />

        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {Math.round(progress * 100)}% from start toward target
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Session history</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyHistory}>
            No sessions logged yet. Complete, partially complete, or skip — just
            keep the record going.
          </Text>
        ) : (
          <View style={styles.historyList}>
            {history.map((log) => (
              <HistoryItem
                key={log.id}
                log={log}
                onDelete={() => onDeleteLog(log)}
              />
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Plan details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pace</Text>
          <Text style={styles.detailValue}>{formatPace(habit.pace)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created</Text>
          <Text style={styles.detailValue}>
            {new Date(habit.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.comingSoon}>
          Next up in Phase 3: automatic level-up, hold, and downshift based on
          weekly completion.
        </Text>
      </Card>

      <Button label="Back to habits" variant="secondary" onPress={() => navigation.navigate('Home')} />
      <Button label="Delete habit" variant="danger" onPress={onDelete} />
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
  progressBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  comingSoon: {
    ...typography.caption,
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  emptyHistory: {
    ...typography.body,
    color: colors.textSecondary,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.surface,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  historyResult: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  historyCredit: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyNote: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
  },
  historyHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});

import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LevelPath } from '../components/LevelPath';
import { LevelSummary } from '../components/LevelSummary';
import { Screen } from '../components/Screen';
import { WeeklyPlanCard } from '../components/WeeklyPlanCard';
import { useHabits } from '../context/HabitsContext';
import { formatLoggedAt, getWeekId } from '../lib/dates';
import { formatLevel, formatPace, progressTowardTarget } from '../lib/habits';
import {
  formatCredit,
  formatSessionResult,
} from '../lib/prescription';
import {
  formatProgressionAction,
  minStrongWeeksForPace,
} from '../lib/progression';
import type { RootStackParamList } from '../navigation/types';
import type { ProgressionEvent } from '../types/habit';
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

function ProgressionHistoryItem({ event }: { event: ProgressionEvent }) {
  return (
    <View style={styles.progressionItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyResult}>
          {formatProgressionAction(event.action)}
        </Text>
        <Text style={styles.historyCredit}>
          {Math.round(event.completionRate * 100)}%
        </Text>
      </View>
      <Text style={styles.historyMeta}>
        {formatLevel(event.from)} → {formatLevel(event.to)}
      </Text>
      <Text style={styles.historyNote}>{event.message}</Text>
    </View>
  );
}

export function HabitDetailScreen() {
  const navigation = useNavigation<DetailNavigation>();
  const route = useRoute<DetailRoute>();
  const {
    getHabit,
    deleteHabit,
    getWeeklyProgress,
    getLogsForHabit,
    deleteLog,
    setHoldLevel,
    evaluateWeek,
  } = useHabits();
  const [evaluating, setEvaluating] = useState(false);

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
  const weekId = getWeekId();
  const alreadyEvaluated = habit.lastEvaluatedWeekId === weekId;
  const minStrongWeeks = minStrongWeeksForPace(habit.pace);

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

  const onEvaluateWeek = async () => {
    setEvaluating(true);
    try {
      const result = await evaluateWeek(habit.id, weekId);
      const title =
        result.decision.action === 'level_up'
          ? 'Level up!'
          : result.decision.action === 'downshift'
            ? 'Downshift'
            : result.decision.action === 'maintain'
              ? 'Target maintained'
              : 'Week reviewed';

      Alert.alert(title, result.decision.message);
    } catch (err) {
      Alert.alert(
        'Could not evaluate week',
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Habit goal</Text>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={styles.subtitle}>
          Log sessions this week, then review to level up, hold, or gently
          downshift.
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
        <Text style={styles.sectionTitle}>Weekly review</Text>
        <Text style={styles.reviewHelp}>
          Strong week (≥80%) builds toward a level-up. Medium weeks hold. Two
          weak weeks (&lt;50%) can downshift.
        </Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Strong weeks at level</Text>
          <Text style={styles.detailValue}>
            {habit.strongWeeksAtLevel}/{minStrongWeeks}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tough weeks streak</Text>
          <Text style={styles.detailValue}>{habit.consecutiveLowWeeks}/2</Text>
        </View>
        <View style={styles.holdRow}>
          <View style={styles.holdCopy}>
            <Text style={styles.detailLabel}>Hold this level</Text>
            <Text style={styles.holdHelp}>
              Stay here even after strong weeks.
            </Text>
          </View>
          <Switch
            value={habit.holdLevel}
            onValueChange={(value) => {
              void setHoldLevel(habit.id, value);
            }}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
          />
        </View>
        <Button
          label={alreadyEvaluated ? 'Week already reviewed' : 'Review this week'}
          onPress={() => void onEvaluateWeek()}
          loading={evaluating}
          disabled={alreadyEvaluated}
        />
      </Card>

      <LevelPath habit={habit} />

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your path snapshot</Text>
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
        <Text style={styles.sectionTitle}>Progression history</Text>
        {habit.progressionHistory.length === 0 ? (
          <Text style={styles.emptyHistory}>
            No weekly reviews yet. After logging, tap “Review this week”.
          </Text>
        ) : (
          <View style={styles.historyList}>
            {habit.progressionHistory.map((event) => (
              <ProgressionHistoryItem key={event.id} event={event} />
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
          Next up in Phase 4: coaching copy, weekly reflection prompts, and
          momentum metrics.
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
  reviewHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  holdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  holdCopy: {
    flex: 1,
    gap: 2,
  },
  holdHelp: {
    ...typography.caption,
    color: colors.textMuted,
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
  progressionItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    backgroundColor: colors.surfaceMuted,
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

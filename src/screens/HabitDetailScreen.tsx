import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CoachingCard } from '../components/CoachingCard';
import { LevelPath } from '../components/LevelPath';
import { PathMeter } from '../components/PathMeter';
import { ScheduleEditor } from '../components/ScheduleEditor';
import { Screen } from '../components/Screen';
import { WeeklyPlanCard } from '../components/WeeklyPlanCard';
import { useHabits } from '../context/HabitsContext';
import { buildCoachingSnapshot } from '../lib/coaching';
import { formatLoggedAt, getWeekId } from '../lib/dates';
import { formatLevel, formatPace, progressTowardTarget } from '../lib/habits';
import { deriveHabitStatus, formatHabitStatus } from '../lib/load';
import {
  formatCredit,
  formatSessionResult,
} from '../lib/prescription';
import {
  formatProgressionAction,
  minStrongWeeksForPace,
} from '../lib/progression';
import { describeHabitReminder } from '../lib/reminders';
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
    setHabitStatus,
    updateSchedule,
    logs,
  } = useHabits();

  const habit = getHabit(route.params.habitId);
  const coaching = useMemo(
    () => (habit ? buildCoachingSnapshot(habit, logs) : null),
    [habit, logs],
  );

  if (!habit || !coaching) {
    return (
      <Screen contentStyle={styles.missingContent}>
        <Card style={styles.section}>
          <Text style={styles.title}>Quest not found</Text>
          <Button
            label="Back to arc"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Today' })}
          />
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
  const status = deriveHabitStatus(habit);
  const inactive = status === 'paused' || status === 'archived';

  const onDelete = () => {
    Alert.alert(
      'Delete this quest?',
      `Remove “${habit.title}” and its history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await deleteHabit(habit.id);
              navigation.navigate('MainTabs', { screen: 'Today' });
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <LinearGradient colors={[colors.surfaceInk, '#243B63']} style={styles.hero}>
        <Text style={styles.heroEyebrow}>
          {formatHabitStatus(status)} · {formatPace(habit.pace)} pace
        </Text>
        <Text style={styles.heroTitle}>{habit.title}</Text>
        <Text style={styles.heroIdentity}>{coaching.identityLine}</Text>
        <PathMeter
          start={habit.start}
          current={habit.current}
          target={habit.target}
          progress={progress}
          tone="dark"
        />
        <Text style={styles.heroMeta}>
          {Math.round(progress * 100)}% along the arc · {coaching.headline}
        </Text>
      </LinearGradient>

      <CoachingCard coaching={coaching} />

      {weekly && !inactive ? (
        <WeeklyPlanCard
          progress={weekly}
          onLogPress={() =>
            navigation.navigate('LogSession', { habitId: habit.id })
          }
        />
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly ritual</Text>
        <Text style={styles.reviewHelp}>
          Reflect first. Then the arc decides: level up, hold, or gently reset.
        </Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Strong weeks</Text>
          <Text style={styles.detailValue}>
            {habit.strongWeeksAtLevel}/{minStrongWeeks}
          </Text>
        </View>
        <View style={styles.holdRow}>
          <View style={styles.holdCopy}>
            <Text style={styles.detailLabel}>Hold this level</Text>
            <Text style={styles.holdHelp}>Stay here even after strong weeks.</Text>
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
          label={
            inactive
              ? 'Resume to review'
              : alreadyEvaluated
                ? 'Week already reviewed'
                : 'Enter weekly ritual'
          }
          onPress={() =>
            navigation.navigate('WeeklyReview', { habitId: habit.id })
          }
          disabled={inactive || alreadyEvaluated}
        />
      </Card>

      <ScheduleEditor
        schedule={habit.schedule}
        onChange={(schedule) => {
          void updateSchedule(habit.id, schedule);
        }}
      />
      <Text style={styles.reminderSummary}>{describeHabitReminder(habit)}</Text>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Protect the load</Text>
        {status === 'paused' ? (
          <Button
            label="Resume quest"
            variant="secondary"
            onPress={() => void setHabitStatus(habit.id, 'building')}
          />
        ) : (
          <Button
            label="Pause quest"
            variant="secondary"
            onPress={() => void setHabitStatus(habit.id, 'paused')}
            disabled={status === 'archived'}
          />
        )}
        {status === 'archived' ? (
          <Button
            label="Unarchive quest"
            variant="ghost"
            onPress={() => void setHabitStatus(habit.id, 'building')}
          />
        ) : (
          <Button
            label="Archive quest"
            variant="ghost"
            onPress={() => void setHabitStatus(habit.id, 'archived')}
          />
        )}
      </Card>

      <LevelPath habit={habit} />

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Session chronicle</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyHistory}>
            No reps logged yet. Every complete, partial, or skip still counts as
            honesty.
          </Text>
        ) : (
          <View style={styles.historyList}>
            {history.map((log) => (
              <HistoryItem
                key={log.id}
                log={log}
                onDelete={() =>
                  Alert.alert('Delete session?', 'Remove this log?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => void deleteLog(log.id),
                    },
                  ])
                }
              />
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Arc history</Text>
        {habit.progressionHistory.length === 0 ? (
          <Text style={styles.emptyHistory}>
            No reviews yet. Finish a week, then enter the ritual.
          </Text>
        ) : (
          <View style={styles.historyList}>
            {habit.progressionHistory.map((event) => (
              <ProgressionHistoryItem key={event.id} event={event} />
            ))}
          </View>
        )}
      </Card>

      <Button
        label="Back to arc"
        variant="ink"
        onPress={() => navigation.navigate('MainTabs', { screen: 'Today' })}
      />
      <Button label="Delete quest" variant="danger" onPress={onDelete} />
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
  hero: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
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
  heroIdentity: {
    ...typography.body,
    color: colors.textOnInkMuted,
    marginTop: -spacing.sm,
  },
  heroMeta: {
    ...typography.caption,
    color: colors.textOnInkMuted,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
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
  reminderSummary: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.md,
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
  title: {
    ...typography.heading,
    color: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
});

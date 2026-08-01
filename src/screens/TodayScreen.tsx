import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { QuestCard } from '../components/QuestCard';
import { Screen } from '../components/Screen';
import { useHabits, useWeeklyLoad } from '../context/HabitsContext';
import { buildTodaySummaryLine } from '../lib/insights';
import { deriveHabitStatus } from '../lib/load';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type TodayNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Today'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function coachOpening(activeCount: number, remainingSessions: number): string {
  if (activeCount === 0) {
    return 'Your training arc is waiting for its first quest.';
  }
  if (remainingSessions === 0) {
    return 'This week’s reps are done. Protect the win.';
  }
  if (remainingSessions <= 2) {
    return 'Almost there — finish clean, not perfect.';
  }
  return 'This week: protect the spark. Small reps, honest logs.';
}

export function TodayScreen() {
  const navigation = useNavigation<TodayNavigation>();
  const { habits, logs, isLoading, error, refresh, getWeeklyProgress } =
    useHabits();
  const load = useWeeklyLoad();

  const activeHabits = useMemo(
    () =>
      habits.filter((habit) => {
        const status = deriveHabitStatus(habit);
        return status === 'building' || status === 'maintaining';
      }),
    [habits],
  );

  const dueHabits = useMemo(
    () =>
      activeHabits.filter((habit) => {
        const weekly = getWeeklyProgress(habit.id);
        return (weekly?.remainingSessions ?? 0) > 0;
      }),
    [activeHabits, getWeeklyProgress],
  );

  const hero = dueHabits[0] ?? activeHabits[0];
  const rest = dueHabits.filter((habit) => habit.id !== hero?.id);

  const remainingSessions = useMemo(
    () =>
      activeHabits.reduce((sum, habit) => {
        const weekly = getWeeklyProgress(habit.id);
        return sum + (weekly?.remainingSessions ?? 0);
      }, 0),
    [activeHabits, getWeeklyProgress],
  );

  const todaySummary = useMemo(
    () => buildTodaySummaryLine(habits, logs),
    [habits, logs],
  );

  return (
    <Screen style={styles.screen} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Today</Text>
        <Text style={styles.title}>
          {coachOpening(activeHabits.length, remainingSessions)}
        </Text>
        <Text style={styles.subtitle}>{todaySummary}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Begin a new quest"
          onPress={() => navigation.navigate('CreateHabit')}
          accessibilityHint="Create a habit goal"
        />
        <Button
          label="See all quests"
          variant="secondary"
          onPress={() => navigation.navigate('Quests')}
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.centeredText}>Loading your arc...</Text>
        </View>
      ) : error ? (
        <Card style={styles.messageCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            label="Try again"
            variant="secondary"
            onPress={() => void refresh()}
          />
        </Card>
      ) : activeHabits.length === 0 ? (
        <Card variant="gold" style={styles.messageCard}>
          <Text style={styles.emptyEmoji}>⚔️</Text>
          <Text style={styles.emptyTitle}>No active quests</Text>
          <Text style={styles.emptyBody}>
            Want 5×60 workouts someday? Start at 2×15. The arc rewards honesty
            over heroics.
          </Text>
        </Card>
      ) : (
        <FlatList
          style={styles.list}
          data={rest}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {hero ? (
                <QuestCard
                  habit={hero}
                  logs={logs}
                  weekly={getWeeklyProgress(hero.id)}
                  featured
                  onPress={() =>
                    navigation.navigate('HabitDetail', { habitId: hero.id })
                  }
                  onLogPress={() =>
                    navigation.navigate('LogSession', { habitId: hero.id })
                  }
                />
              ) : null}

              <Card style={styles.loadCard}>
                <Text style={styles.loadTitle}>Weekly load</Text>
                <Text style={styles.loadBody}>
                  {load.buildingHabits.length} building ·{' '}
                  {load.maintainingHabits.length} maintaining ·{' '}
                  {load.totalSessions} sessions · {load.totalMinutes} min
                </Text>
                {load.sequencingTip ? (
                  <Text style={styles.loadTip}>{load.sequencingTip}</Text>
                ) : null}
              </Card>

              {remainingSessions === 0 ? (
                <Card variant="gold" style={styles.messageCard}>
                  <Text style={styles.emptyTitle}>Chapter complete</Text>
                  <Text style={styles.emptyBody}>
                    No missions left this week. Rest, or open Quests to review
                    your arcs.
                  </Text>
                </Card>
              ) : rest.length > 0 ? (
                <Text style={styles.sectionLabel}>Still due this week</Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <QuestCard
              habit={item}
              logs={logs}
              weekly={getWeeklyProgress(item.id)}
              onPress={() =>
                navigation.navigate('HabitDetail', { habitId: item.id })
              }
              onLogPress={() =>
                navigation.navigate('LogSession', { habitId: item.id })
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    flex: 1,
  },
  listHeader: {
    gap: spacing.md,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.huge,
  },
  loadCard: {
    gap: spacing.sm,
  },
  loadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  loadBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loadTip: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  sectionLabel: {
    ...typography.eyebrow,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  centeredText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  messageCard: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  emptyEmoji: {
    fontSize: 34,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
});

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
import { deriveHabitStatus } from '../lib/load';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type QuestsNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Quests'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function QuestsScreen() {
  const navigation = useNavigation<QuestsNavigation>();
  const { habits, logs, isLoading, error, refresh, getWeeklyProgress } =
    useHabits();
  const load = useWeeklyLoad();

  const visibleHabits = useMemo(
    () => habits.filter((habit) => habit.status !== 'archived'),
    [habits],
  );

  const archivedCount = habits.length - visibleHabits.length;

  const sortedHabits = useMemo(() => {
    const rank = (status: ReturnType<typeof deriveHabitStatus>) => {
      if (status === 'building') return 0;
      if (status === 'maintaining') return 1;
      if (status === 'paused') return 2;
      return 3;
    };

    return [...visibleHabits].sort((a, b) => {
      const statusDiff =
        rank(deriveHabitStatus(a)) - rank(deriveHabitStatus(b));
      if (statusDiff !== 0) {
        return statusDiff;
      }
      return a.title.localeCompare(b.title);
    });
  }, [visibleHabits]);

  return (
    <Screen style={styles.screen} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Quests</Text>
        <Text style={styles.title}>Your training arcs</Text>
        <Text style={styles.subtitle}>
          {load.buildingHabits.length} building ·{' '}
          {load.maintainingHabits.length} maintaining
          {archivedCount > 0 ? ` · ${archivedCount} archived` : ''}
        </Text>
      </View>

      <Button
        label="Begin a new quest"
        onPress={() => navigation.navigate('CreateHabit')}
        accessibilityHint="Create a habit goal"
        style={styles.createButton}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={styles.centeredText}>Loading quests...</Text>
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
      ) : sortedHabits.length === 0 ? (
        <Card variant="gold" style={styles.messageCard}>
          <Text style={styles.emptyEmoji}>⚔</Text>
          <Text style={styles.emptyTitle}>No quests yet</Text>
          <Text style={styles.emptyBody}>
            Start one small arc. You can pause or archive anytime if load gets
            heavy.
          </Text>
        </Card>
      ) : (
        <FlatList
          style={styles.list}
          data={sortedHabits}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
  createButton: {
    marginBottom: spacing.lg,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.huge,
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

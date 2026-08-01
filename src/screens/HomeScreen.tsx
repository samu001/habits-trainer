import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useHabits } from '../context/HabitsContext';
import { getWeekId } from '../lib/dates';
import { formatLevel, formatPace, progressTowardTarget } from '../lib/habits';
import { minStrongWeeksForPace } from '../lib/progression';
import type { RootStackParamList } from '../navigation/types';
import type { HabitGoal } from '../types/habit';
import type { WeeklyProgress } from '../types/logging';
import { colors, radii, spacing, typography } from '../theme/tokens';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function HabitListItem({
  habit,
  weekly,
  onPress,
  onLogPress,
}: {
  habit: HabitGoal;
  weekly: WeeklyProgress | null;
  onPress: () => void;
  onLogPress: () => void;
}) {
  const progress = progressTowardTarget(habit);
  const reviewed = habit.lastEvaluatedWeekId === getWeekId();
  const minStrong = minStrongWeeksForPace(habit.pace);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.habitCard}>
        <View style={styles.habitHeader}>
          <Text style={styles.habitTitle}>{habit.title}</Text>
          <Text style={styles.paceBadge}>{formatPace(habit.pace)}</Text>
        </View>

        <Text style={styles.habitMeta}>Current: {formatLevel(habit.current)}</Text>

        {weekly ? (
          <>
            <Text style={styles.prescription}>{weekly.prescriptionLabel}</Text>
            <View style={styles.weekStats}>
              <Text style={styles.habitMeta}>
                This week: {weekly.earnedCredits.toFixed(
                  weekly.earnedCredits % 1 === 0 ? 0 : 1,
                )}
                /{weekly.requiredSessions} credits
              </Text>
              <Text style={styles.habitMeta}>
                {weekly.remainingSessions} left
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${weekly.completionRate * 100}%` },
                ]}
              />
            </View>
          </>
        ) : (
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        )}

        <Text style={styles.progressLabel}>
          Goal path: {Math.round(progress * 100)}% · Strong weeks{' '}
          {habit.strongWeeksAtLevel}/{minStrong}
          {habit.holdLevel ? ' · Holding' : ''}
          {reviewed ? ' · Reviewed' : ''}
        </Text>

        <Button
          label="Log session"
          variant="secondary"
          onPress={onLogPress}
          style={styles.logButton}
        />
      </Card>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const { habits, isLoading, error, refresh, getWeeklyProgress } = useHabits();

  return (
    <Screen style={styles.screen} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Habits Trainer</Text>
        <Text style={styles.title}>This week’s plan</Text>
        <Text style={styles.subtitle}>
          Start small, log honestly, and build toward your real goal one
          manageable week at a time.
        </Text>
      </View>

      <Button
        label="Create habit goal"
        onPress={() => navigation.navigate('CreateHabit')}
        style={styles.createButton}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.centeredText}>Loading your habits...</Text>
        </View>
      ) : error ? (
        <Card style={styles.messageCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Try again" variant="secondary" onPress={() => void refresh()} />
        </Card>
      ) : habits.length === 0 ? (
        <Card style={styles.messageCard}>
          <Text style={styles.emptyTitle}>No habit goals yet</Text>
          <Text style={styles.emptyBody}>
            Example: want to work out 5× / week for 60 minutes? Start with 2× /
            week for 15 minutes, then log each session as you go.
          </Text>
        </Card>
      ) : (
        <FlatList
          style={styles.list}
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HabitListItem
              habit={item}
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
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
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
    paddingBottom: spacing.xxxl,
  },
  habitCard: {
    gap: spacing.sm,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  habitTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  paceBadge: {
    ...typography.caption,
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    fontWeight: '700',
  },
  prescription: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 21,
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  habitMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logButton: {
    marginTop: spacing.xs,
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
  },
  emptyTitle: {
    fontSize: 18,
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
  pressed: {
    opacity: 0.9,
  },
});

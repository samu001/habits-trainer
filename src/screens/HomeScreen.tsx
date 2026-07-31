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
import { formatLevel, formatPace, progressTowardTarget } from '../lib/habits';
import type { RootStackParamList } from '../navigation/types';
import type { HabitGoal } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function HabitListItem({
  habit,
  onPress,
}: {
  habit: HabitGoal;
  onPress: () => void;
}) {
  const progress = progressTowardTarget(habit);

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
        <Text style={styles.habitMeta}>Target: {formatLevel(habit.target)}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {Math.round(progress * 100)}% of the way to your goal
        </Text>
      </Card>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const { habits, isLoading, error, refresh } = useHabits();

  return (
    <Screen style={styles.screen} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Habits Trainer</Text>
        <Text style={styles.title}>Start small. Build up.</Text>
        <Text style={styles.subtitle}>
          Set a big habit goal, begin at a level you can actually keep, and grow
          it little by little.
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
            week for 15 minutes and ramp from there.
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
              onPress={() =>
                navigation.navigate('HabitDetail', { habitId: item.id })
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

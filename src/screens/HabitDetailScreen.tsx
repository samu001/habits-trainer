import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LevelSummary } from '../components/LevelSummary';
import { Screen } from '../components/Screen';
import { useHabits } from '../context/HabitsContext';
import { formatPace, progressTowardTarget } from '../lib/habits';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../theme/tokens';

type DetailRoute = RouteProp<RootStackParamList, 'HabitDetail'>;
type DetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'HabitDetail'
>;

export function HabitDetailScreen() {
  const navigation = useNavigation<DetailNavigation>();
  const route = useRoute<DetailRoute>();
  const { getHabit, deleteHabit } = useHabits();

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

  const onDelete = () => {
    Alert.alert(
      'Delete habit?',
      `Remove “${habit.title}” from your goals? This cannot be undone.`,
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

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Habit goal</Text>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={styles.subtitle}>
          You are building toward your target one small level at a time.
        </Text>
      </View>

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
          Next up in Phase 2: weekly prescriptions and session logging based on
          your current level.
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
});

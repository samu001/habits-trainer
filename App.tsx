import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Habit = {
  id: string;
  title: string;
  completed: boolean;
};

const INITIAL_HABITS: Habit[] = [
  { id: '1', title: 'Drink water', completed: true },
  { id: '2', title: 'Read for 20 minutes', completed: false },
  { id: '3', title: 'Take a walk', completed: false },
];

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [newHabit, setNewHabit] = useState('');

  const completedCount = useMemo(
    () => habits.filter((habit) => habit.completed).length,
    [habits],
  );

  const progress = habits.length === 0 ? 0 : completedCount / habits.length;

  const toggleHabit = (id: string) => {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit,
      ),
    );
  };

  const addHabit = () => {
    const title = newHabit.trim();
    if (!title) {
      return;
    }

    setHabits((current) => [
      ...current,
      {
        id: String(Date.now()),
        title,
        completed: false,
      },
    ]);
    setNewHabit('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Habits Trainer</Text>
        <Text style={styles.title}>Build better days</Text>
        <Text style={styles.subtitle}>
          A sample React Native app you can run on iPhone with Expo.
        </Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Today</Text>
            <Text style={styles.progressValue}>
              {completedCount}/{habits.length} done
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={newHabit}
            onChangeText={setNewHabit}
            placeholder="Add a new habit"
            placeholderTextColor="#8B93A7"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={addHabit}
          />
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={addHabit}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {habits.map((habit) => (
            <Pressable
              key={habit.id}
              style={({ pressed }) => [styles.habitCard, pressed && styles.pressed]}
              onPress={() => toggleHabit(habit.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  habit.completed && styles.checkboxCompleted,
                ]}
              >
                {habit.completed ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text
                style={[
                  styles.habitTitle,
                  habit.completed && styles.habitTitleCompleted,
                ]}
              >
                {habit.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  eyebrow: {
    color: '#5B6CFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#121826',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5B6475',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#1B2437',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#121826',
    fontSize: 16,
    fontWeight: '700',
  },
  progressValue: {
    color: '#5B6475',
    fontSize: 15,
    fontWeight: '600',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E7ECF5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#5B6CFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9E1F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#121826',
  },
  addButton: {
    backgroundColor: '#5B6CFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#1B2437',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#C7D0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#5B6CFF',
    borderColor: '#5B6CFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  habitTitle: {
    flex: 1,
    color: '#121826',
    fontSize: 17,
    fontWeight: '600',
  },
  habitTitleCompleted: {
    color: '#8B93A7',
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.85,
  },
});

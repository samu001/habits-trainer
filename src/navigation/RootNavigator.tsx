import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateHabitScreen } from '../screens/CreateHabitScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LogSessionScreen } from '../screens/LogSessionScreen';
import { WeeklyReviewScreen } from '../screens/WeeklyReviewScreen';
import { colors } from '../theme/tokens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.primaryDark,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontWeight: '700',
            color: colors.text,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateHabit"
          component={CreateHabitScreen}
          options={{ title: 'New habit' }}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{ title: 'Habit details' }}
        />
        <Stack.Screen
          name="LogSession"
          component={LogSessionScreen}
          options={{ title: 'Log session' }}
        />
        <Stack.Screen
          name="WeeklyReview"
          component={WeeklyReviewScreen}
          options={{ title: 'Weekly review' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

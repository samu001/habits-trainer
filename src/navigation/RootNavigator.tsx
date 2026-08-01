import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateHabitScreen } from '../screens/CreateHabitScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { LogSessionScreen } from '../screens/LogSessionScreen';
import { WeeklyReviewScreen } from '../screens/WeeklyReviewScreen';
import { colors } from '../theme/tokens';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
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
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateHabit"
          component={CreateHabitScreen}
          options={{ title: 'New quest' }}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{ title: 'Quest journey' }}
        />
        <Stack.Screen
          name="LogSession"
          component={LogSessionScreen}
          options={{ title: 'Log a rep' }}
        />
        <Stack.Screen
          name="WeeklyReview"
          component={WeeklyReviewScreen}
          options={{ title: 'Weekly ritual' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

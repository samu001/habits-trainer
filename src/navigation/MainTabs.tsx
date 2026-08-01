import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';

import { InsightsScreen } from '../screens/InsightsScreen';
import { QuestsScreen } from '../screens/QuestsScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { colors, typography } from '../theme/tokens';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Today: '✦',
    Quests: '⚔',
    Insights: '◈',
  };

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[label] ?? '•'}
    </Text>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: 'Today' }}
      />
      <Tab.Screen
        name="Quests"
        component={QuestsScreen}
        options={{ title: 'Quests' }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: 'Insights' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  icon: {
    fontSize: 16,
    color: colors.textMuted,
  },
  iconFocused: {
    color: colors.primaryDark,
  },
});

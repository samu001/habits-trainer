import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Today: undefined;
  Quests: undefined;
  Insights: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  CreateHabit: undefined;
  HabitDetail: { habitId: string };
  LogSession: { habitId: string };
  WeeklyReview: { habitId: string };
};

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HabitsProvider } from './src/context/HabitsContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitsProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </HabitsProvider>
    </SafeAreaProvider>
  );
}

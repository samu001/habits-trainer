import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function safe(run: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    await run();
  } catch {
    // Haptics are optional polish.
  }
}

export function hapticSuccess() {
  return safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticLight() {
  return safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticWarning() {
  return safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

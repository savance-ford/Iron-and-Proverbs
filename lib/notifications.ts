import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export const REMINDER_CHANNEL_ID = 'daily-reminders';
export const REMINDER_TITLE = 'Daily Strength';
export const REMINDER_BODY = 'Your daily verse and challenge are ready.';

// Keep foreground behavior calm. Users mainly need reminders when the app is backgrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureReminderChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
    lightColor: '#C9A84C',
    description: 'Daily verse reminders for Iron & Proverbs.',
  });
}

export async function requestReminderPermissionsAsync(): Promise<boolean> {
  await ensureReminderChannelAsync();

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });

  return !!requested.granted;
}

export async function scheduleDailyReminderAsync(hour: number, minute: number): Promise<string> {
  await ensureReminderChannelAsync();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: REMINDER_TITLE,
      body: REMINDER_BODY,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelScheduledReminderAsync(notificationId?: string | null): Promise<void> {
  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // No-op if it was already removed.
  }
}

export function formatReminderTime(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export async function openDeviceNotificationSettingsAsync(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // Fallback intentionally ignored.
  }
}

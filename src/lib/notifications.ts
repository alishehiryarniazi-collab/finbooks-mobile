import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// How notifications behave when the app is in the FOREGROUND (show a banner + play sound).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// The EAS project id is needed to mint an Expo push token. It only exists after `eas init`
// (i.e. once this is a dev/production build), so we read it defensively.
function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId
  );
}

// Asks permission and returns this device's Expo push token (or null if unavailable —
// simulator, permission denied, running in Expo Go, or before the app is EAS-linked).
// The returned token is what the backend stores and sends notifications to.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null; // push tokens don't work on simulators/emulators

  // Android needs a channel before notifications will show.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#5ff0d4",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null; // user said no

  const projectId = getProjectId();
  if (!projectId) return null; // not EAS-linked yet (e.g. Expo Go) — can't mint a remote token

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data; // e.g. "ExponentPushToken[xxxxxxxx]"
  } catch {
    return null;
  }
}

// --- Local (on-device) reminders -------------------------------------------
// These don't need a server or Firebase — the phone schedules and fires them itself.

// Schedules a one-off local reminder `seconds` from now. Returns its id (to cancel later).
export async function scheduleLocalReminder(title: string, body: string, seconds: number): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor(seconds)),
    },
  });
}

// Schedules a reminder that repeats every day at the given hour/minute (e.g. a 9am "bills due" nudge).
export async function scheduleDailyReminder(title: string, body: string, hour: number, minute = 0): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledCount(): Promise<number> {
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}

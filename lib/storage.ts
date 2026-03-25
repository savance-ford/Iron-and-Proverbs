import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  STREAK: "iron_streak_count",
  LAST_OPENED: "iron_last_opened_date",
  SAVED_VERSES: "iron_saved_verses",
  CHALLENGE_COMPLETIONS: "iron_challenge_completions",
  REMINDER_ENABLED: "iron_reminder_enabled",
  REMINDER_HOUR: "iron_reminder_hour",
  REMINDER_MINUTE: "iron_reminder_minute",
  REMINDER_NOTIFICATION_ID: "iron_reminder_notification_id",
  APP_OPEN_COUNT: "iron_app_open_count",
  REMINDER_PROMPT_DISMISSED_UNTIL: "iron_reminder_prompt_dismissed_until",
} as const;

/**
 * Returns today's date as YYYY-MM-DD string (local time).
 */
export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Returns a YYYY-MM-DD string for N days ago.
 */
function daysAgoString(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Load and update the streak.
 * - If the user opened the app yesterday, streak increases by 1.
 * - If already opened today, streak stays the same.
 * - Otherwise streak resets to 1.
 * Returns the current streak count.
 */
export async function updateAndGetStreak(): Promise<number> {
  const today = todayString();
  const [rawStreak, lastOpened] = await Promise.all([
    AsyncStorage.getItem(KEYS.STREAK),
    AsyncStorage.getItem(KEYS.LAST_OPENED),
  ]);

  let streak = parseInt(rawStreak ?? "0", 10);

  if (lastOpened === today) {
    return streak;
  }

  const yesterdayStr = daysAgoString(1);

  if (lastOpened === yesterdayStr) {
    streak += 1;
  } else {
    streak = 1;
  }

  await Promise.all([
    AsyncStorage.setItem(KEYS.STREAK, String(streak)),
    AsyncStorage.setItem(KEYS.LAST_OPENED, today),
  ]);

  return streak;
}

/**
 * Get the current streak without modifying it.
 */
export async function getStreak(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  return parseInt(raw ?? "0", 10);
}

/**
 * Get all saved verse IDs as an array.
 */
export async function getSavedVerseIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.SAVED_VERSES);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/**
 * Check if a specific verse is saved.
 */
export async function isVerseSaved(id: string): Promise<boolean> {
  const saved = await getSavedVerseIds();
  return saved.includes(id);
}

/**
 * Save a verse by its ID. No-op if already saved.
 */
export async function saveVerse(id: string): Promise<void> {
  const saved = await getSavedVerseIds();
  if (!saved.includes(id)) {
    await AsyncStorage.setItem(KEYS.SAVED_VERSES, JSON.stringify([...saved, id]));
  }
}

/**
 * Unsave (remove) a verse by its ID.
 */
export async function unsaveVerse(id: string): Promise<void> {
  const saved = await getSavedVerseIds();
  await AsyncStorage.setItem(
    KEYS.SAVED_VERSES,
    JSON.stringify(saved.filter((v) => v !== id))
  );
}

/**
 * Toggle saved state and return the new state.
 */
export async function toggleSaveVerse(id: string): Promise<boolean> {
  const saved = await getSavedVerseIds();
  const isSaved = saved.includes(id);
  if (isSaved) {
    await AsyncStorage.setItem(
      KEYS.SAVED_VERSES,
      JSON.stringify(saved.filter((v) => v !== id))
    );
    return false;
  } else {
    await AsyncStorage.setItem(
      KEYS.SAVED_VERSES,
      JSON.stringify([...saved, id])
    );
    return true;
  }
}

// ─── Daily Challenge ────────────────────────────────────────────────────────

/**
 * Load all stored challenge completion dates.
 */
async function getCompletionDates(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.CHALLENGE_COMPLETIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/**
 * Check if today's challenge has been marked complete.
 */
export async function isChallengeCompletedToday(): Promise<boolean> {
  const dates = await getCompletionDates();
  return dates.includes(todayString());
}

/**
 * Mark today's challenge as complete. Idempotent.
 */
export async function markChallengeCompleteToday(): Promise<void> {
  const today = todayString();
  const dates = await getCompletionDates();
  if (!dates.includes(today)) {
    // Keep only the last 30 days to avoid unbounded growth
    const trimmed = [...dates, today].slice(-30);
    await AsyncStorage.setItem(KEYS.CHALLENGE_COMPLETIONS, JSON.stringify(trimmed));
  }
}

/**
 * Count how many challenges were completed in the last 7 days
 * (today + the 6 days before it).
 */
export async function getWeeklyChallengeCount(): Promise<number> {
  const dates = await getCompletionDates();
  const last7 = Array.from({ length: 7 }, (_, i) => daysAgoString(i));
  return dates.filter((d) => last7.includes(d)).length;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

const ONBOARDING_KEY = "iron_has_seen_onboarding";

/**
 * Returns true if the user has already completed (or skipped) onboarding.
 * Returns false on a brand-new install or after clearing storage.
 * This is checked in the root layout immediately after fonts load so the
 * correct initial route can be chosen before anything is rendered.
 */
export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch (error) {
    console.error("Failed to get onboarding status from storage", error);
    return false;
  }
}

/**
 * Persists the fact that the user has seen onboarding so that on every
 * subsequent launch the app skips straight to the main tab flow.
 * Called when the user taps "Get Started" on the last slide or "Skip" on
 * any slide.
 */
export async function setHasSeenOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch (error) {
    console.error("Failed to set onboarding status in storage", error);
  }
}


// ─── Daily Reminders ─────────────────────────────────────────────────────────

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId: string | null;
}

const DEFAULT_REMINDER_HOUR = 8;
const DEFAULT_REMINDER_MINUTE = 0;

/**
 * Load persisted daily reminder settings for the Settings screen.
 */
export async function getReminderSettings(): Promise<ReminderSettings> {
  const [enabledRaw, hourRaw, minuteRaw, notificationId] = await Promise.all([
    AsyncStorage.getItem(KEYS.REMINDER_ENABLED),
    AsyncStorage.getItem(KEYS.REMINDER_HOUR),
    AsyncStorage.getItem(KEYS.REMINDER_MINUTE),
    AsyncStorage.getItem(KEYS.REMINDER_NOTIFICATION_ID),
  ]);

  const hour = Number.isFinite(Number(hourRaw)) ? Number(hourRaw) : DEFAULT_REMINDER_HOUR;
  const minute = Number.isFinite(Number(minuteRaw)) ? Number(minuteRaw) : DEFAULT_REMINDER_MINUTE;

  return {
    enabled: enabledRaw === 'true',
    hour,
    minute,
    notificationId: notificationId ?? null,
  };
}

/**
 * Persist the enabled state, time, and scheduled notification identifier.
 */
export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.REMINDER_ENABLED, String(settings.enabled)),
    AsyncStorage.setItem(KEYS.REMINDER_HOUR, String(settings.hour)),
    AsyncStorage.setItem(KEYS.REMINDER_MINUTE, String(settings.minute)),
    settings.notificationId
      ? AsyncStorage.setItem(KEYS.REMINDER_NOTIFICATION_ID, settings.notificationId)
      : AsyncStorage.removeItem(KEYS.REMINDER_NOTIFICATION_ID),
  ]);
}


// ─── Reminder Prompt ───────────────────────────────────────────────────────

/**
 * Increment and return the number of times the app has been opened.
 * This is used to avoid showing the reminder prompt on the very first launch.
 */
export async function incrementAndGetAppOpenCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.APP_OPEN_COUNT);
  const current = parseInt(raw ?? "0", 10) || 0;
  const next = current + 1;
  await AsyncStorage.setItem(KEYS.APP_OPEN_COUNT, String(next));
  return next;
}

/**
 * Returns whether the Home reminder prompt should be shown.
 * Rules:
 * - never show if reminders are enabled
 * - wait until the second app open
 * - if the user dismissed it, hide until the stored reappear date
 */
export async function shouldShowReminderPrompt(): Promise<boolean> {
  const [settings, rawCount, dismissedUntil] = await Promise.all([
    getReminderSettings(),
    AsyncStorage.getItem(KEYS.APP_OPEN_COUNT),
    AsyncStorage.getItem(KEYS.REMINDER_PROMPT_DISMISSED_UNTIL),
  ]);

  if (settings.enabled) return false;

  const openCount = parseInt(rawCount ?? "0", 10) || 0;
  if (openCount < 2) return false;

  if (dismissedUntil) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const until = new Date(dismissedUntil);
    until.setHours(0, 0, 0, 0);
    if (!Number.isNaN(until.getTime()) && today < until) return false;
  }

  return true;
}

/**
 * Hide the Home reminder prompt temporarily. It reappears after the specified
 * number of days if reminders are still off.
 */
export async function dismissReminderPrompt(days = 3): Promise<void> {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  await AsyncStorage.setItem(KEYS.REMINDER_PROMPT_DISMISSED_UNTIL, d.toISOString());
}

/**
 * Clear any temporary dismissal so the reminder prompt will no longer be held
 * back by a previous "Not now" action. Useful once reminders are enabled.
 */
export async function clearReminderPromptDismissal(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.REMINDER_PROMPT_DISMISSED_UNTIL);
}

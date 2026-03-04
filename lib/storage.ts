import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  STREAK: "iron_streak_count",
  LAST_OPENED: "iron_last_opened_date",
  SAVED_VERSES: "iron_saved_verses",
} as const;

/**
 * Returns today's date as YYYY-MM-DD string (local time).
 */
function todayString(): string {
  const d = new Date();
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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

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

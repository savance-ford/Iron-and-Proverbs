import versesData from "@/data/verses.json";

export interface Verse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  tags: string[];
  application: string;
  challenge?: string;
}

/** All verses loaded from the local JSON file. */
export const ALL_VERSES: Verse[] = versesData as Verse[];

/** All unique categories derived from verse tags. */
export const ALL_CATEGORIES: string[] = [
  "Discipline",
  "Purpose",
  "Self-Control",
  "Courage",
  "Anxiety/Fear",
  "Anger",
  "Leadership",
  "Work/Provision",
  "Patience",
  "Faith",
];

/**
 * Get the "Verse of the Day" based on today's local date.
 * The same verse is shown all day; the selection rotates daily
 * by using the day-of-year as an index into the verse list.
 */
export function getDailyVerse(): Verse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % ALL_VERSES.length;
  return ALL_VERSES[index];
}

/**
 * Get a random verse, optionally excluding specific IDs.
 * Use this for the "Next" feature without affecting the daily verse.
 */
export function getRandomVerse(excludeIds: string[] = []): Verse {
  const pool = ALL_VERSES.filter((v) => !excludeIds.includes(v.id));
  const source = pool.length > 0 ? pool : ALL_VERSES;
  const randomIndex = Math.floor(Math.random() * source.length);
  return source[randomIndex];
}

/**
 * Get verses filtered by a category tag.
 */
export function getVersesByCategory(category: string): Verse[] {
  return ALL_VERSES.filter((v) => v.tags.includes(category));
}

/**
 * Search verses by text or reference within a category.
 * Pass null for category to search all verses.
 */
export function searchVerses(query: string, category: string | null): Verse[] {
  const q = query.toLowerCase().trim();
  const source = category ? getVersesByCategory(category) : ALL_VERSES;
  if (!q) return source;
  return source.filter(
    (v) =>
      v.text.toLowerCase().includes(q) ||
      v.reference.toLowerCase().includes(q) ||
      v.application.toLowerCase().includes(q)
  );
}

/**
 * Get a verse by its ID. Returns undefined if not found.
 */
export function getVerseById(id: string): Verse | undefined {
  return ALL_VERSES.find((v) => v.id === id);
}

/**
 * Category metadata for display.
 */
export const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  Discipline: { icon: "shield", description: "Build habits that outlast motivation." },
  Purpose: { icon: "compass", description: "Discover and walk in your calling." },
  "Self-Control": { icon: "lock-closed", description: "Master yourself before the fight." },
  Courage: { icon: "flame", description: "Stand firm when others retreat." },
  "Anxiety/Fear": { icon: "cloud-outline", description: "Trade worry for peace through faith." },
  Anger: { icon: "flash", description: "Channel strength without losing control." },
  Leadership: { icon: "people", description: "Lead by example, serve with strength." },
  "Work/Provision": { icon: "hammer", description: "Honor God through diligent labor." },
  Patience: { icon: "hourglass", description: "Endure with purpose, reap in due season." },
  Faith: { icon: "infinite", description: "Trust what you cannot see, stand on what is true." },
};

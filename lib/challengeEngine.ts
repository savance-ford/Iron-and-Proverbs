import { Verse } from "@/lib/verseEngine";

const TAG_CHALLENGES: Record<string, string> = {
  Discipline:
    "Complete one task you have been avoiding — commit to starting it within the next 10 minutes.",
  Courage:
    "Have the difficult conversation you have been putting off — no more delays.",
  Faith:
    "Spend 10 minutes in prayer or Scripture before picking up your phone today.",
  "Self-Control":
    "Identify one habit where the flesh has been winning and eliminate one trigger that feeds it today.",
  "Anxiety/Fear":
    "Write down your biggest worry, then write two things God has already faithfully provided.",
  Purpose:
    "Write your three most important priorities for this season and review them at day's end.",
  Patience:
    "Let someone else go first today — in traffic, conversation, or at work — without frustration.",
  "Work/Provision":
    "Do your most important work first today, before email, social media, or distractions.",
  Leadership:
    "Encourage one person under your care today with specific, genuine, and timely words.",
  Anger:
    "Before reacting in any tension today, count to five and ask: is this worth my peace?",
};

const DEFAULT_CHALLENGE =
  "Do one hard thing today that your future self will thank you for — no excuses.";

/**
 * Returns the challenge text for a given verse.
 * Uses the verse's own challenge field if present,
 * otherwise falls back to the first matching tag fallback,
 * then a universal default.
 */
export function getChallengeForVerse(verse: Verse & { challenge?: string }): string {
  if (verse.challenge) return verse.challenge;
  for (const tag of verse.tags) {
    if (TAG_CHALLENGES[tag]) return TAG_CHALLENGES[tag];
  }
  return DEFAULT_CHALLENGE;
}

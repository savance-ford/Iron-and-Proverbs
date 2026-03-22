import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import {
  updateAndGetStreak,
  getSavedVerseIds,
  toggleSaveVerse,
  isChallengeCompletedToday,
  markChallengeCompleteToday,
  getWeeklyChallengeCount,
  incrementAndGetAppOpenCount,
} from "@/lib/storage";
import { getDailyVerse, getRandomVerse, Verse } from "@/lib/verseEngine";
import { getChallengeForVerse } from "@/lib/challengeEngine";

interface AppContextValue {
  streak: number;
  savedIds: string[];
  dailyVerse: Verse;
  activeVerse: Verse;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => Promise<void>;
  nextVerse: () => void;
  resetToDaily: () => void;
  dailyChallenge: string;
  challengeCompleted: boolean;
  weeklyCount: number;
  markChallenge: () => Promise<void>;
  appOpenCount: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const daily = useMemo(() => getDailyVerse(), []);
  const [activeVerse, setActiveVerse] = useState<Verse>(daily);

  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [appOpenCount, setAppOpenCount] = useState(0);

  // Derived challenge text — always tied to the daily verse, never the active verse
  const dailyChallenge = useMemo(
    () => getChallengeForVerse(daily),
    [daily]
  );

  useEffect(() => {
    updateAndGetStreak().then(setStreak);
    incrementAndGetAppOpenCount().then(setAppOpenCount);
    getSavedVerseIds().then(setSavedIds);
    isChallengeCompletedToday().then(setChallengeCompleted);
    getWeeklyChallengeCount().then(setWeeklyCount);
  }, []);

  const isSaved = (id: string) => savedIds.includes(id);

  const toggleSave = async (id: string) => {
    await toggleSaveVerse(id);
    getSavedVerseIds().then(setSavedIds);
  };

  const nextVerse = () => {
    setActiveVerse((prev) => getRandomVerse([prev.id]));
  };

  const resetToDaily = () => {
    setActiveVerse(daily);
  };

  const markChallenge = async () => {
    if (challengeCompleted) return;
    await markChallengeCompleteToday();
    setChallengeCompleted(true);
    setWeeklyCount((n) => Math.min(n + 1, 7));
  };

  const value = useMemo(
    () => ({
      streak,
      savedIds,
      dailyVerse: daily,
      activeVerse,
      isSaved,
      toggleSave,
      nextVerse,
      resetToDaily,
      dailyChallenge,
      challengeCompleted,
      weeklyCount,
      markChallenge,
      appOpenCount,
    }),
    [streak, savedIds, activeVerse, daily, challengeCompleted, weeklyCount, dailyChallenge, appOpenCount]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

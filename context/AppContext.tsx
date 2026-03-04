import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import {
  updateAndGetStreak,
  getSavedVerseIds,
  toggleSaveVerse,
} from "@/lib/storage";
import { getDailyVerse, getRandomVerse, Verse } from "@/lib/verseEngine";

interface AppContextValue {
  streak: number;
  savedIds: string[];
  dailyVerse: Verse;
  activeVerse: Verse;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => Promise<void>;
  nextVerse: () => void;
  resetToDaily: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const daily = useMemo(() => getDailyVerse(), []);
  const [activeVerse, setActiveVerse] = useState<Verse>(daily);

  useEffect(() => {
    updateAndGetStreak().then(setStreak);
    getSavedVerseIds().then(setSavedIds);
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
    }),
    [streak, savedIds, activeVerse, daily]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

# Iron & Proverbs — replit.md

## Overview

**Iron & Proverbs** is a Bible-based daily discipline mobile app for men, built with Expo React Native (TypeScript). The app delivers a "Verse of the Day" based on the local device date, organizes scripture into thematic categories (Discipline, Courage, Faith, etc.), tracks a daily streak, allows saving favorite verses, and lets users share a styled verse card as an image.

The app is fully offline-first — all data comes from a local JSON file, all persistence is handled with AsyncStorage, and there is no backend, authentication, or subscription system.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend Architecture (Expo React Native)

- **Framework**: Expo SDK ~54 with Expo Router v6 for file-based navigation
- **Language**: TypeScript with strict mode enabled
- **UI Style**: Dark, masculine, minimal. Colors are defined in `constants/colors.ts` (amber accent on near-black backgrounds)
- **Fonts**: Inter family (Regular, Medium, SemiBold, Bold) via `@expo-google-fonts/inter`, loaded at app startup

**Routing structure (Expo Router):**
- `app/(tabs)/home.tsx` — Daily verse, streak badge, Save/Share/Next buttons
- `app/(tabs)/categories.tsx` — Searchable list of category cards
- `app/(tabs)/saved.tsx` — List of bookmarked verses
- `app/(tabs)/settings.tsx` — About + Disclaimer (no auth, no notifications)
- `app/verse/[id].tsx` — Individual verse detail screen
- `app/category/[name].tsx` — Filtered verse list within a category

**Tab bar:**
- On iOS (when Liquid Glass is available): uses `expo-router/unstable-native-tabs` with SF Symbols
- Otherwise: classic `expo-router` Tabs with Ionicons, BlurView background on iOS

### State Management

- **Global state**: React Context (`context/AppContext.tsx`) holds streak, savedIds, dailyVerse, and activeVerse
- **Data fetching**: `@tanstack/react-query` is installed and a `QueryClient` is configured (with `staleTime: Infinity` and no refetch), ready for any future API use
- The context is the main source of truth for in-session state

### Data Layer

- **Verse data**: Static JSON at `data/verses.json` (80+ entries across 10 categories), loaded directly into the app bundle — no network required
- **Verse engine** (`lib/verseEngine.ts`): Pure functions for daily verse selection (day-of-year index), random verse, category filtering, and text search
- **Persistence** (`lib/storage.ts`): AsyncStorage with three keys:
  - `iron_streak_count` — current streak integer
  - `iron_last_opened_date` — last open date (YYYY-MM-DD) for streak logic
  - `iron_saved_verses` — JSON array of saved verse IDs

### Key Components

| Component | Purpose |
|---|---|
| `VerseCard` | Main verse display with Save, Share, Next actions |
| `ShareCard` | Off-screen styled card rendered by `react-native-view-shot` for sharing |
| `VerseRow` | Compact list item for saved/category verse lists |
| `CategoryCard` | Tap target showing category icon, name, count |
| `ErrorBoundary` / `ErrorFallback` | Catches render errors gracefully |
| `KeyboardAwareScrollViewCompat` | Cross-platform keyboard-aware scroll (native-keyboard-controller on mobile, plain ScrollView on web) |

### Sharing

- `react-native-view-shot` captures the off-screen `ShareCard` as a PNG
- `expo-sharing` sends the image to the device share sheet
- This is image-based sharing only — no deep links or text-only sharing

### Animations & Haptics

- `react-native-reanimated` and `react-native-gesture-handler` are included for gesture-driven animations
- `expo-haptics` is used on all interactive taps (impact and selection feedback)
- `expo-linear-gradient` used in `ShareCard` and accent elements

### Platform Handling

- Web padding uses hardcoded offsets (e.g., `paddingTop: 67`) since safe area insets behave differently
- Tab bar on web has explicit height
- Keyboard controller falls back to plain `ScrollView` on web

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `@react-native-async-storage/async-storage` | Local persistence (streak, saved verses) |
| `react-native-view-shot` | Capture off-screen share card as image |
| `expo-sharing` | Share image via native share sheet |
| `expo-haptics` | Tactile feedback on interactions |
| `expo-linear-gradient` | Gradient backgrounds in share card |
| `expo-blur` | Frosted glass tab bar on iOS |
| `expo-glass-effect` | Detect and use iOS Liquid Glass native tabs |
| `@tanstack/react-query` | Query client infrastructure (currently minimal use) |
| `@expo-google-fonts/inter` | Inter font family |
| `expo-image-picker` | (Installed, not actively used in current screens) |
| `expo-location` | (Installed, not actively used in current screens) |
| `react-native-reanimated` | Animation primitives |
| `react-native-gesture-handler` | Gesture detection |
| `react-native-keyboard-controller` | Keyboard-aware scroll on native |
| `react-native-safe-area-context` | Safe area insets for notch/status bar |
| `zod` | (Installed for schema validation, available for future use) |

**No backend, no database, no authentication, no push notifications, no external APIs are used.** The app is entirely self-contained.
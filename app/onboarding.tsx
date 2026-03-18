import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { setHasSeenOnboarding } from "@/lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

/**
 * The three onboarding slides. Copy is intentionally minimal and premium.
 */
const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "flame-outline",
    title: "Forge Your Mindset",
    subtitle:
      "Daily verses and challenges designed to build mental toughness, discipline, and purpose — one day at a time.",
  },
  {
    id: "2",
    icon: "book-outline",
    title: "Ancient Wisdom, Modern Strength",
    subtitle:
      "Stoic, biblical, and philosophical teachings distilled into focused lessons you can actually live by.",
  },
  {
    id: "3",
    icon: "shield-checkmark-outline",
    title: "Stay Consistent",
    subtitle:
      "Track your streak, complete daily challenges, and build the habits that separate ordinary from iron.",
  },
];

/**
 * Dismisses onboarding by persisting the "seen" flag and navigating to tabs.
 * After this runs, all future launches skip onboarding entirely.
 */
async function dismissOnboarding() {
  await setHasSeenOnboarding();
  router.replace("/(tabs)/home");
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  /**
   * Derive the active slide index from scroll position.
   * Works reliably on both native and web.
   */
  const handleScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const goToNext = React.useCallback(() => {
    if (isLastSlide) {
      dismissOnboarding();
    } else {
      const nextIndex = activeIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setActiveIndex(nextIndex);
    }
  }, [isLastSlide, activeIndex]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Skip button — always visible and functional on all slides */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => dismissOnboarding()}
        accessibilityLabel="Skip onboarding"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides rendered in a horizontal paging ScrollView */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide) => (
          <SlideItem key={slide.id} slide={slide} />
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      {/* Primary action button */}
      <View style={[styles.buttonContainer, { paddingBottom: bottomPadding + 24 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={goToNext}
          activeOpacity={0.85}
          accessibilityLabel={isLastSlide ? "Get Started" : "Next"}
          testID={isLastSlide ? "get-started-button" : "next-button"}
        >
          <Text style={styles.primaryButtonText}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SlideItem({ slide }: { slide: Slide }) {
  return (
    <View style={styles.slide}>
      <View style={styles.iconWrapper}>
        <Ionicons name={slide.icon} size={56} color={Colors.amber} />
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.subtitle}>{slide.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.amber,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.border,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: Colors.amber,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
});

import React, { useRef, useState } from "react";
import {
  Alert,
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
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/colors";
import {
  clearReminderPromptDismissal,
  getReminderSettings,
  saveReminderSettings,
  setHasSeenOnboarding,
} from "@/lib/storage";
import {
  requestReminderPermissionsAsync,
  scheduleDailyReminderAsync,
  formatReminderTime,
} from "@/lib/notifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "flame-outline",
    title: "Daily Strength",
    subtitle:
      "Start each day with a verse and challenge built to strengthen discipline, courage, and purpose.",
  },
  {
    id: "2",
    icon: "book-outline",
    title: "Find What You Need",
    subtitle:
      "Browse Scripture by topic like fear, anger, leadership, faith, and more.",
  },
  {
    id: "3",
    icon: "notifications-outline",
    title: "Stay Consistent",
    subtitle:
      "Turn on one daily reminder for your verse and challenge.",
  },
];

async function dismissOnboarding() {
  await setHasSeenOnboarding();
  router.replace("/(tabs)/home");
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeReady, setTimeReady] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date(0, 0, 0, 8, 0));

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const goToNext = React.useCallback(() => {
    if (isLastSlide) return;
    const nextIndex = activeIndex + 1;
    scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
    setActiveIndex(nextIndex);
  }, [isLastSlide, activeIndex]);

  const finishOnboarding = React.useCallback(async () => {
    await dismissOnboarding();
  }, []);

  const enableReminder = React.useCallback(async () => {
    if (reminderBusy) return;
    setReminderBusy(true);

    try {
      const granted = await requestReminderPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Notifications are off",
          "You can enable reminders later in Settings.",
          [{ text: "Continue", onPress: () => finishOnboarding() }]
        );
        return;
      }

      const existing = await getReminderSettings();
      const initial = new Date(0, 0, 0, existing.hour, existing.minute);
      setSelectedTime(initial);

      if (Platform.OS === "android") {
        setShowTimePicker(true);
      } else {
        setTimeReady(true);
      }
    } catch {
      Alert.alert("Reminder setup failed", "Please try again later in Settings.", [
        { text: "Continue", onPress: () => finishOnboarding() },
      ]);
    } finally {
      setReminderBusy(false);
    }
  }, [reminderBusy, finishOnboarding]);

  const saveReminderAndFinish = React.useCallback(async (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();

    try {
      setReminderBusy(true);
      const notificationId = await scheduleDailyReminderAsync(hour, minute);
      await saveReminderSettings({
        enabled: true,
        hour,
        minute,
        notificationId,
      });
      await clearReminderPromptDismissal();

      Alert.alert(
        "Daily reminder set",
        `You'll get one reminder each day at ${formatReminderTime(hour, minute)}. You can change this anytime in Settings.`,
        [{ text: "Continue", onPress: () => finishOnboarding() }]
      );
    } catch {
      Alert.alert("Reminder setup failed", "Please try again later in Settings.", [
        { text: "Continue", onPress: () => finishOnboarding() },
      ]);
    } finally {
      setReminderBusy(false);
      setShowTimePicker(false);
      setTimeReady(false);
    }
  }, [finishOnboarding]);

  const handleTimeChange = React.useCallback(async (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    if (Platform.OS === "ios") {
      setSelectedTime(selectedDate);
      return;
    }

    await saveReminderAndFinish(selectedDate);
  }, [saveReminderAndFinish]);

  const handleIosDone = React.useCallback(async () => {
    await saveReminderAndFinish(selectedTime);
  }, [saveReminderAndFinish, selectedTime]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={dismissOnboarding}
        accessibilityLabel="Skip onboarding"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

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
        {SLIDES.map((slide, index) => (
          <SlideItem
            key={slide.id}
            slide={slide}
            isLast={index === SLIDES.length - 1}
            timeReady={timeReady}
            selectedTime={selectedTime}
            onTimeChange={handleTimeChange}
          />
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <View style={[styles.buttonContainer, { paddingBottom: bottomPadding + 24 }]}>
        {isLastSlide ? (
          <>
            {Platform.OS === "ios" && timeReady && (
              <View style={styles.iosPickerCard}>
                <DateTimePicker
                  mode="time"
                  display="spinner"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  textColor={Colors.textPrimary}
                  themeVariant="dark"
                />
                <View style={styles.iosPickerActions}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={finishOnboarding} activeOpacity={0.85}>
                    <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryButtonHalf} onPress={handleIosDone} activeOpacity={0.85}>
                    <Text style={styles.primaryButtonText}>Set Reminder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={styles.helperText}>You can change this anytime in Settings.</Text>
            {!timeReady && (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, reminderBusy && styles.buttonDisabled]}
                  onPress={enableReminder}
                  activeOpacity={0.85}
                  accessibilityLabel="Enable Reminder"
                  disabled={reminderBusy}
                >
                  <Text style={styles.primaryButtonText}>{reminderBusy ? "Preparing" : "Enable Reminder"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={finishOnboarding}
                  activeOpacity={0.85}
                  accessibilityLabel="Maybe Later"
                >
                  <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={goToNext}
            activeOpacity={0.85}
            accessibilityLabel="Next"
            testID="next-button"
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {showTimePicker && Platform.OS === "android" && (
        <DateTimePicker
          mode="time"
          display="default"
          value={selectedTime}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

function SlideItem({
  slide,
  isLast,
  timeReady,
  selectedTime,
  onTimeChange,
}: {
  slide: Slide;
  isLast: boolean;
  timeReady: boolean;
  selectedTime: Date;
  onTimeChange: (event: DateTimePickerEvent, date?: Date) => void;
}) {
  return (
    <View style={styles.slide}>
      <View style={styles.iconWrapper}>
        <Ionicons name={slide.icon} size={56} color={Colors.amber} />
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.subtitle}>{slide.subtitle}</Text>
      {isLast && timeReady && Platform.OS === "ios" && (
        <Text style={styles.previewText}>Reminder time: {formatReminderTime(selectedTime.getHours(), selectedTime.getMinutes())}</Text>
      )}
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
    maxWidth: 340,
  },
  previewText: {
    marginTop: 18,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
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
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.amber,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonHalf: {
    flex: 1,
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
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  helperText: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  iosPickerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 6,
  },
  iosPickerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
});

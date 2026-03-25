import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { VerseCard } from "@/components/VerseCard";
import { DailyChallengeCard } from "@/components/DailyChallengeCard";
import { Colors } from "@/constants/colors";
import { useFocusEffect, useRouter } from "expo-router";
import {
  clearReminderPromptDismissal,
  dismissReminderPrompt,
  getReminderSettings,
  saveReminderSettings,
  shouldShowReminderPrompt,
} from "@/lib/storage";
import {
  openDeviceNotificationSettingsAsync,
  requestReminderPermissionsAsync,
  scheduleDailyReminderAsync,
} from "@/lib/notifications";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    streak,
    activeVerse,
    dailyVerse,
    isSaved,
    toggleSave,
    nextVerse,
    dailyChallenge,
    challengeCompleted,
    weeklyCount,
    markChallenge,
  } = useApp();
  const isToday = activeVerse.id === dailyVerse.id;
  const [showReminderPrompt, setShowReminderPrompt] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);

  const refreshReminderPrompt = useCallback(async () => {
    const visible = await shouldShowReminderPrompt();
    setShowReminderPrompt(visible);
  }, []);

  useEffect(() => {
    refreshReminderPrompt();
  }, [refreshReminderPrompt]);

  useFocusEffect(
    useCallback(() => {
      refreshReminderPrompt();
    }, [refreshReminderPrompt])
  );

  const handleEnableReminder = async () => {
    if (reminderBusy) return;

    setReminderBusy(true);
    try {
      const granted = await requestReminderPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Notifications disabled",
          "Enable notifications in your device settings to get a daily verse reminder.",
          [
            { text: "Not now", style: "cancel" },
            { text: "Open Settings", onPress: () => openDeviceNotificationSettingsAsync() },
          ]
        );
        return;
      }

      const existing = await getReminderSettings();
      const notificationId = await scheduleDailyReminderAsync(existing.hour, existing.minute);

      await saveReminderSettings({
        enabled: true,
        hour: existing.hour,
        minute: existing.minute,
        notificationId,
      });
      await clearReminderPromptDismissal();
      setShowReminderPrompt(false);

      Alert.alert(
        "Daily reminder enabled",
        `You'll get one reminder each day at ${existing.hour === 0 ? '12' : ((existing.hour + 11) % 12 + 1)}:${String(existing.minute).padStart(2, '0')} ${existing.hour >= 12 ? 'PM' : 'AM'}. You can change this anytime in Settings.`
      );
    } catch {
      Alert.alert("Reminder update failed", "Please try again in a moment.");
    } finally {
      setReminderBusy(false);
    }
  };

  const handleDismissReminder = async () => {
    await dismissReminderPrompt(3);
    setShowReminderPrompt(false);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            Platform.OS === "web" ? 67 + 16 : insets.top + 16,
          paddingBottom:
            Platform.OS === "web" ? 34 + 80 : 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Daily Word</Text>
          <Text style={styles.subtitle}>For the man who seeks wisdom</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={Colors.amber} />
          <Text style={styles.streakNumber}>{streak}</Text>
        </View>
      </View>

      {!isToday && (
        <View style={styles.exploreBanner}>
          <Ionicons name="shuffle" size={14} color={Colors.textMuted} />
          <Text style={styles.exploreBannerText}>
            Exploring — your daily verse is still set
          </Text>
        </View>
      )}

      {showReminderPrompt && (
        <View style={styles.reminderCard}>
          <View style={styles.reminderCopy}>
            <View style={styles.reminderIconWrap}>
              <Ionicons name="notifications-outline" size={18} color={Colors.amber} />
            </View>
            <View style={styles.reminderTextWrap}>
              <Text style={styles.reminderHeadline}>Never Miss Your Daily Word</Text>
              <Text style={styles.reminderBody}>
                Turn on one daily reminder for your verse and challenge.
              </Text>
            </View>
          </View>
          <View style={styles.reminderActions}>
            <Pressable
              onPress={handleDismissReminder}
              style={({ pressed }) => [styles.reminderSecondaryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.reminderSecondaryText}>Not Now</Text>
            </Pressable>
            <Pressable
              onPress={handleEnableReminder}
              disabled={reminderBusy}
              style={({ pressed }) => [styles.reminderPrimaryButton, pressed && styles.buttonPressed, reminderBusy && styles.buttonDisabled]}
            >
              <Text style={styles.reminderPrimaryText}>{reminderBusy ? "Preparing" : "Enable"}</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={({ pressed }) => [styles.reminderManageLink, pressed && styles.buttonPressed]}>
            <Text style={styles.reminderManageText}>Manage in Settings</Text>
          </Pressable>
        </View>
      )}

      <VerseCard
        verse={activeVerse}
        isSaved={isSaved(activeVerse.id)}
        onSave={() => toggleSave(activeVerse.id)}
        onNext={nextVerse}
        showNext
        isDaily={isToday}
      />

      <DailyChallengeCard
        challenge={dailyChallenge}
        completed={challengeCompleted}
        weeklyCount={weeklyCount}
        onMarkComplete={markChallenge}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>

      <View style={styles.categoryGrid}>
        {["Discipline", "Courage", "Faith", "Self-Control"].map((cat) => (
          <View key={cat} style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{cat}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  streakNumber: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.amber,
  },
  exploreBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exploreBannerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  reminderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.18)',
    gap: 14,
  },
  reminderCopy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reminderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.18)',
  },
  reminderTextWrap: {
    flex: 1,
    gap: 4,
  },
  reminderHeadline: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  reminderBody: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reminderSecondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reminderSecondaryText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  reminderPrimaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.amber,
  },
  reminderPrimaryText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#111111',
  },
  reminderManageLink: {
    alignSelf: 'flex-start',
  },
  reminderManageText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.8 },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
});

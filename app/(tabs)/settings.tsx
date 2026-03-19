import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
  Linking,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/colors";
import {
  ReminderSettings,
  getReminderSettings,
  saveReminderSettings,
} from "@/lib/storage";
import {
  cancelScheduledReminderAsync,
  formatReminderTime,
  openDeviceNotificationSettingsAsync,
  requestReminderPermissionsAsync,
  scheduleDailyReminderAsync,
} from "@/lib/notifications";

const PRIVACY_POLICY_URL = "https://savance-ford.github.io/Iron-and-Proverbs/privacy-policy.html";
const TERMS_OF_SERVICE_URL = "https://savance-ford.github.io/Iron-and-Proverbs/terms-of-service.html";
const SUPPORT_EMAIL = "quoteverseapps@gmail.com";

const DEFAULT_REMINDER_TIME = { hour: 8, minute: 0 };

interface SectionRowProps {
  icon: string;
  label: string;
  value?: string;
}

interface SectionLinkRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  disabled?: boolean;
}

interface SectionToggleRowProps {
  icon: string;
  label: string;
  value?: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

function SectionRow({ icon, label, value }: SectionRowProps) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon as any} size={18} color={Colors.textSecondary} />
      </View>
      <View style={rowStyles.content}>
        <Text style={rowStyles.label}>{label}</Text>
        {value && <Text style={rowStyles.value}>{value}</Text>}
      </View>
    </View>
  );
}

function SectionLinkRow({ icon, label, value, onPress, disabled = false }: SectionLinkRowProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        rowStyles.row,
        disabled && rowStyles.rowDisabled,
        pressed && !disabled && rowStyles.rowPressed,
      ]}
    >
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon as any} size={18} color={disabled ? Colors.textMuted : Colors.textSecondary} />
      </View>
      <View style={rowStyles.content}>
        <Text style={[rowStyles.label, disabled && rowStyles.labelDisabled]}>{label}</Text>
        {value && <Text style={[rowStyles.value, disabled && rowStyles.valueDisabled]}>{value}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={disabled ? Colors.textMuted : Colors.textMuted} />
    </Pressable>
  );
}

function SectionToggleRow({
  icon,
  label,
  value,
  enabled,
  onToggle,
  disabled = false,
}: SectionToggleRowProps) {
  return (
    <View style={[rowStyles.row, disabled && rowStyles.rowDisabled]}>
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon as any} size={18} color={disabled ? Colors.textMuted : Colors.textSecondary} />
      </View>
      <View style={rowStyles.content}>
        <Text style={[rowStyles.label, disabled && rowStyles.labelDisabled]}>{label}</Text>
        {value && <Text style={[rowStyles.value, disabled && rowStyles.valueDisabled]}>{value}</Text>}
      </View>
      <Switch
        value={enabled}
        disabled={disabled}
        onValueChange={onToggle}
        trackColor={{ false: Colors.borderLight, true: "rgba(201, 168, 76, 0.35)" }}
        thumbColor={enabled ? Colors.amber : "#D5D5D5"}
        ios_backgroundColor={Colors.borderLight}
      />
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowDisabled: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  labelDisabled: {
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  valueDisabled: {
    color: Colors.textMuted,
  },
});

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: false,
    hour: DEFAULT_REMINDER_TIME.hour,
    minute: DEFAULT_REMINDER_TIME.minute,
    notificationId: null,
  });
  const [reminderLoading, setReminderLoading] = useState(true);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pendingTime, setPendingTime] = useState(
    new Date(0, 0, 0, DEFAULT_REMINDER_TIME.hour, DEFAULT_REMINDER_TIME.minute)
  );

  useEffect(() => {
    let active = true;

    const loadReminderState = async () => {
      const stored = await getReminderSettings();
      if (!active) return;
      setReminderSettings(stored);
      setPendingTime(new Date(0, 0, 0, stored.hour, stored.minute));
      setReminderLoading(false);
    };

    loadReminderState();

    return () => {
      active = false;
    };
  }, []);

  const reminderTimeLabel = useMemo(
    () => formatReminderTime(reminderSettings.hour, reminderSettings.minute),
    [reminderSettings.hour, reminderSettings.minute]
  );

  const openExternalUrl = async (url: string, fallbackLabel: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          "Link unavailable",
          `Add your ${fallbackLabel} URL in app/(tabs)/settings.tsx before using this action.`
        );
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open link", "Please try again in a moment.");
    }
  };

  const openSupportEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Iron%20%26%20Proverbs%20Support`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Email unavailable", SUPPORT_EMAIL);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open email", "Please try again in a moment.");
    }
  };

  const persistReminderState = async (next: ReminderSettings) => {
    setReminderSettings(next);
    await saveReminderSettings(next);
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (reminderBusy || reminderLoading) return;

    setReminderBusy(true);
    try {
      if (enabled) {
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
          await persistReminderState({
            ...reminderSettings,
            enabled: false,
            notificationId: null,
          });
          return;
        }

        await cancelScheduledReminderAsync(reminderSettings.notificationId);
        const notificationId = await scheduleDailyReminderAsync(
          reminderSettings.hour,
          reminderSettings.minute
        );

        await persistReminderState({
          ...reminderSettings,
          enabled: true,
          notificationId,
        });
      } else {
        await cancelScheduledReminderAsync(reminderSettings.notificationId);
        await persistReminderState({
          ...reminderSettings,
          enabled: false,
          notificationId: null,
        });
      }
    } catch {
      Alert.alert("Reminder update failed", "Please try again in a moment.");
    } finally {
      setReminderBusy(false);
    }
  };

  const commitReminderTime = async (date: Date) => {
    const nextHour = date.getHours();
    const nextMinute = date.getMinutes();

    const nextSettings: ReminderSettings = {
      ...reminderSettings,
      hour: nextHour,
      minute: nextMinute,
    };

    setPendingTime(new Date(0, 0, 0, nextHour, nextMinute));
    setReminderBusy(true);

    try {
      if (reminderSettings.enabled) {
        await cancelScheduledReminderAsync(reminderSettings.notificationId);
        const notificationId = await scheduleDailyReminderAsync(nextHour, nextMinute);
        nextSettings.notificationId = notificationId;
      }

      await persistReminderState(nextSettings);
    } catch {
      Alert.alert("Time update failed", "Please try again in a moment.");
    } finally {
      setReminderBusy(false);
    }
  };

  const handleTimeChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    if (Platform.OS === "ios") {
      setPendingTime(selectedDate);
      return;
    }

    await commitReminderTime(selectedDate);
  };

  const handleOpenTimePicker = () => {
    if (!reminderSettings.enabled || reminderBusy || reminderLoading) return;
    setPendingTime(new Date(0, 0, 0, reminderSettings.hour, reminderSettings.minute));
    setShowTimePicker(true);
  };

  const handleIosTimeDone = async () => {
    setShowTimePicker(false);
    await commitReminderTime(pendingTime);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.appBranding}>
        <View style={styles.brandIcon}>
          <Ionicons name="shield-half" size={28} color={Colors.amber} />
        </View>
        <Text style={styles.appName}>Iron & Proverbs</Text>
        <Text style={styles.appTagline}>Daily discipline through Scripture</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>APP INFO</Text>
        <View style={styles.sectionCard}>
          <SectionRow
            icon="book-outline"
            label="Translation"
            value="English Standard Version (ESV)"
          />
          <View style={styles.separator} />
          <SectionRow icon="globe-outline" label="Topics" value="10 focus areas" />
          <View style={styles.separator} />
          <SectionRow
            icon="server-outline"
            label="Data Storage"
            value="Stored locally on your device"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>REMINDERS</Text>
        <View style={styles.sectionCard}>
          <SectionToggleRow
            icon="notifications-outline"
            label="Daily Reminder"
            value="Get one daily reminder to read your verse."
            enabled={reminderSettings.enabled}
            disabled={reminderLoading || reminderBusy}
            onToggle={handleReminderToggle}
          />
          <View style={styles.separator} />
          <SectionLinkRow
            icon="time-outline"
            label="Reminder Time"
            value={
              reminderSettings.enabled
                ? reminderTimeLabel
                : "Enable daily reminder first"
            }
            disabled={!reminderSettings.enabled || reminderLoading || reminderBusy}
            onPress={handleOpenTimePicker}
          />
        </View>

        {showTimePicker && Platform.OS === "ios" && (
          <View style={styles.pickerCard}>
            <DateTimePicker
              mode="time"
              display="spinner"
              value={pendingTime}
              onChange={handleTimeChange}
              textColor={Colors.textPrimary}
              themeVariant="dark"
            />
            <View style={styles.pickerActions}>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={() => {
                  setPendingTime(
                    new Date(0, 0, 0, reminderSettings.hour, reminderSettings.minute)
                  );
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={handleIosTimeDone}
              >
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        )}

        {showTimePicker && Platform.OS === "android" && (
          <DateTimePicker
            mode="time"
            display="default"
            value={pendingTime}
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.sectionCard}>
          <SectionLinkRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            value="View how the app handles data"
            onPress={() => openExternalUrl(PRIVACY_POLICY_URL, "Privacy Policy")}
          />
          <View style={styles.separator} />
          <SectionLinkRow
            icon="document-text-outline"
            label="Terms of Service"
            value="Review the app terms"
            onPress={() => openExternalUrl(TERMS_OF_SERVICE_URL, "Terms of Service")}
          />
          <View style={styles.separator} />
          <SectionLinkRow
            icon="mail-outline"
            label="Contact Support"
            value={SUPPORT_EMAIL}
            onPress={openSupportEmail}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DISCLAIMER</Text>
        <View style={styles.disclaimerCard}>
          <Ionicons name="alert-circle-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>
            This app provides Scripture for encouragement and is not a substitute
            for pastoral or professional counseling. If you are struggling with
            serious mental health concerns, please reach out to a qualified
            professional or pastor.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MISSION</Text>
        <View style={styles.missionCard}>
          <Text style={styles.missionText}>
            Iron & Proverbs exists to put the Word of God in front of men daily —
            not as a feel-good ritual, but as a sharpening stone. Read it. Apply it.
            Live it.
          </Text>
          <Text style={styles.missionVerse}>
            "Iron sharpens iron, and one man sharpens another." — Proverbs 27:17
          </Text>
        </View>
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
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  appBranding: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 24,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
    marginBottom: 4,
  },
  appName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  appTagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  appVersion: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 66,
  },
  pickerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 12,
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.amber,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  disclaimerCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "flex-start",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  missionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  missionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  missionVerse: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.amber,
    fontStyle: "italic",
    lineHeight: 20,
  },
});

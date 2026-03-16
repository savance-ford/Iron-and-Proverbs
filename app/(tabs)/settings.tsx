import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

// Replace these with your real hosted URLs before shipping.
const PRIVACY_POLICY_URL = "https://savance-ford.github.io/Iron-and-Proverbs/privacy-policy.html";
const TERMS_OF_SERVICE_URL = "https://savance-ford.github.io/Iron-and-Proverbs/terms-of-service.html";
const SUPPORT_EMAIL = "quoteverseapps@gmail.com";

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

function SectionLinkRow({ icon, label, value, onPress }: SectionLinkRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [rowStyles.row, pressed && rowStyles.rowPressed]}
    >
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon as any} size={18} color={Colors.textSecondary} />
      </View>
      <View style={rowStyles.content}>
        <Text style={rowStyles.label}>{label}</Text>
        {value && <Text style={rowStyles.value}>{value}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
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
  value: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

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
      Alert.alert("Email unavailable", SUPPORT_EMAIL);
    }
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
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.sectionCard}>
          <SectionRow
            icon="book-outline"
            label="Scripture Source"
            value="English Standard Version (ESV)"
          />
          <View style={styles.separator} />
          <SectionRow
            icon="layers-outline"
            label="Verses Available"
            value="84 hand-selected verses"
          />
          <View style={styles.separator} />
          <SectionRow
            icon="globe-outline"
            label="Categories"
            value="10 masculine-focused themes"
          />
          <View style={styles.separator} />
          <SectionRow
            icon="server-outline"
            label="Data Storage"
            value="All data stored locally on your device"
          />
        </View>
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

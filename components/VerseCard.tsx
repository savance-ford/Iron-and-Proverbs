import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Colors } from "@/constants/colors";
import { Verse } from "@/lib/verseEngine";
import { ShareCard } from "@/components/ShareCard";

interface VerseCardProps {
  verse: Verse;
  isSaved: boolean;
  onSave: () => void;
  onNext?: () => void;
  showNext?: boolean;
  isDaily?: boolean;
  shareLabel?: string;
}

export function VerseCard({
  verse,
  isSaved,
  onSave,
  onNext,
  showNext = false,
  isDaily = false,
  shareLabel,
}: VerseCardProps) {
  // This ref points at the off-screen ShareCard — not the on-screen display
  const shotRef = useRef<ViewShot>(null);

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave();
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === "web") {
      Alert.alert(
        "Share on Mobile",
        "Open Iron & Proverbs on your iPhone or Android to share verse images."
      );
      return;
    }
    try {
      const uri = await (shotRef.current as any)?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share this verse",
        });
      }
    } catch (e) {
      console.warn("Share failed", e);
    }
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext?.();
  };

  return (
    <View style={styles.container}>
      {/* Off-screen premium share card — native only, rendered but invisible, captured by ViewShot */}
      {Platform.OS !== "web" && (
        <View style={styles.offScreen} pointerEvents="none">
          <ViewShot
            ref={shotRef}
            options={{ format: "png", quality: 1.0, result: "tmpfile" }}
          >
            <ShareCard verse={verse} label={shareLabel} />
          </ViewShot>
        </View>
      )}

      {/* On-screen in-app display card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.translationBadge}>{verse.translation}</Text>
          {isDaily && (
            <View style={styles.dailyBadge}>
              <Ionicons name="sunny" size={11} color={Colors.amber} />
              <Text style={styles.dailyText}>DAILY</Text>
            </View>
          )}
        </View>

        <Text style={styles.verseText}>"{verse.text}"</Text>

        <Text style={styles.reference}>— {verse.reference}</Text>

        <View style={styles.divider} />

        <View style={styles.applicationSection}>
          <Text style={styles.applicationLabel}>APPLICATION</Text>
          <Text style={styles.applicationText}>{verse.application}</Text>
        </View>

        <View style={styles.tagsRow}>
          {verse.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            isSaved && styles.actionButtonActive,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={handleSave}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isSaved ? Colors.amber : Colors.textSecondary}
          />
          <Text
            style={[styles.actionLabel, isSaved && { color: Colors.amber }]}
          >
            {isSaved ? "Saved" : "Save"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>

        {showNext && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleNext}
          >
            <Ionicons
              name="arrow-forward-circle-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.actionLabel}>Next</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  // Positioned far off-screen so it's laid out and rendered but never visible to the user
  offScreen: {
    position: "absolute",
    left: -9999,
    top: 0,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  translationBadge: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  dailyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  dailyText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    color: Colors.amber,
  },
  verseText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 16,
    fontStyle: "italic",
  },
  reference: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amber,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  applicationSection: {
    gap: 8,
    marginBottom: 16,
  },
  applicationLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    color: Colors.textMuted,
  },
  applicationText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonActive: {
    borderColor: "rgba(201, 168, 76, 0.35)",
    backgroundColor: "rgba(201, 168, 76, 0.06)",
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
});

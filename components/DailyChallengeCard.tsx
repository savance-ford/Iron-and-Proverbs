import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";

interface DailyChallengeCardProps {
  challenge: string;
  completed: boolean;
  weeklyCount: number;
  onMarkComplete: () => void;
}

export function DailyChallengeCard({
  challenge,
  completed,
  weeklyCount,
  onMarkComplete,
}: DailyChallengeCardProps) {
  const handlePress = async () => {
    if (completed) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onMarkComplete();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield" size={14} color={Colors.amber} />
          <Text style={styles.headerLabel}>TODAY'S CHALLENGE</Text>
        </View>
        {completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#27AE60" />
            <Text style={styles.completedBadgeText}>Done</Text>
          </View>
        )}
      </View>

      {/* Challenge text */}
      <Text style={styles.challengeText}>{challenge}</Text>

      {/* Mark complete button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          completed && styles.buttonCompleted,
          pressed && !completed && styles.buttonPressed,
        ]}
        onPress={handlePress}
        disabled={completed}
      >
        <Ionicons
          name={completed ? "checkmark-circle" : "ellipse-outline"}
          size={18}
          color={completed ? "#27AE60" : Colors.textSecondary}
        />
        <Text style={[styles.buttonText, completed && styles.buttonTextCompleted]}>
          {completed ? "Completed" : "Mark Complete"}
        </Text>
      </Pressable>

      {/* Weekly progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>THIS WEEK</Text>
          <Text style={styles.progressCount}>
            <Text style={styles.progressNumber}>{weeklyCount}</Text>
            <Text style={styles.progressDivider}>/7</Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
          {Array.from({ length: 7 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < weeklyCount && styles.progressDotFilled,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
    color: Colors.amber,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(39, 174, 96, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(39, 174, 96, 0.2)",
  },
  completedBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#27AE60",
    letterSpacing: 0.5,
  },
  challengeText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonCompleted: {
    backgroundColor: "rgba(39, 174, 96, 0.07)",
    borderColor: "rgba(39, 174, 96, 0.25)",
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  buttonTextCompleted: {
    color: "#27AE60",
  },
  progressSection: {
    gap: 8,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 2,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  progressLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    color: Colors.textMuted,
  },
  progressCount: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  progressNumber: {
    color: Colors.amber,
    fontFamily: "Inter_700Bold",
  },
  progressDivider: {
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  progressTrack: {
    flexDirection: "row",
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceElevated,
  },
  progressDotFilled: {
    backgroundColor: Colors.amber,
  },
});

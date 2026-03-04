import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { Verse } from "@/lib/verseEngine";

interface VerseRowProps {
  verse: Verse;
  onPress: () => void;
  onUnsave?: () => void;
  showUnsave?: boolean;
}

export function VerseRow({ verse, onPress, onUnsave, showUnsave }: VerseRowProps) {
  const handlePress = async () => {
    await Haptics.selectionAsync();
    onPress();
  };

  const handleUnsave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUnsave?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <Text style={styles.reference}>{verse.reference}</Text>
        <Text style={styles.text} numberOfLines={2}>
          {verse.text}
        </Text>
        <View style={styles.tags}>
          {verse.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      {showUnsave ? (
        <Pressable
          style={({ pressed }) => [styles.unsaveBtn, pressed && { opacity: 0.5 }]}
          onPress={handleUnsave}
          hitSlop={8}
        >
          <Ionicons name="bookmark" size={20} color={Colors.amber} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.65,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  reference: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amber,
    letterSpacing: 0.3,
  },
  text: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  tag: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  unsaveBtn: {
    padding: 4,
  },
});

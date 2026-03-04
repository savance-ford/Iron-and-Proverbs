import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { CATEGORY_META, getVersesByCategory } from "@/lib/verseEngine";

interface CategoryCardProps {
  category: string;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const meta = CATEGORY_META[category] ?? { icon: "book-outline", description: "" };
  const count = getVersesByCategory(category).length;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={meta.icon as any} size={22} color={Colors.amber} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{category}</Text>
        <Text style={styles.description}>{meta.description}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.count}>{count}</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  cardPressed: {
    opacity: 0.65,
    backgroundColor: Colors.surfaceElevated,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.15)",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  count: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
});

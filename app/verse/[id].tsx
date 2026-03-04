import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { VerseCard } from "@/components/VerseCard";
import { getVerseById } from "@/lib/verseEngine";
import { Colors } from "@/constants/colors";

export default function VerseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSave } = useApp();

  const verse = getVerseById(id ?? "");

  if (!verse) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + 16 }]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>Verse not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleBack = async () => {
    await Haptics.selectionAsync();
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View
        style={[
          styles.navBar,
          {
            paddingTop:
              Platform.OS === "web" ? 67 : insets.top + 8,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.tagRow}>
          {verse.tags.map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Platform.OS === "web" ? 34 + 40 : insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <VerseCard
          verse={verse}
          isSaved={isSaved(verse.id)}
          onSave={() => toggleSave(verse.id)}
          isDaily={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
  },
  tagBadge: {
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.amber,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
});

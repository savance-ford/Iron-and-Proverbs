import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { VerseCard } from "@/components/VerseCard";
import { Colors } from "@/constants/colors";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { streak, activeVerse, dailyVerse, isSaved, toggleSave, nextVerse } = useApp();
  const isToday = activeVerse.id === dailyVerse.id;

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
          <Text style={styles.exploreBannerText}>Exploring — your daily verse is still set</Text>
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

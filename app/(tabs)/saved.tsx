import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { VerseRow } from "@/components/VerseRow";
import { getVerseById } from "@/lib/verseEngine";
import { Colors } from "@/constants/colors";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { savedIds, toggleSave } = useApp();

  const savedVerses = savedIds
    .map((id) => getVerseById(id))
    .filter(Boolean) as ReturnType<typeof getVerseById>[];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            Platform.OS === "web" ? 67 : insets.top,
        },
      ]}
    >
      <View style={styles.headerArea}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>
          {savedVerses.length} verse{savedVerses.length !== 1 ? "s" : ""} collected
        </Text>
      </View>

      <FlatList
        data={savedVerses}
        keyExtractor={(item) => item!.id}
        renderItem={({ item }) =>
          item ? (
            <VerseRow
              verse={item}
              onPress={() =>
                router.push({
                  pathname: "/verse/[id]",
                  params: { id: item.id },
                })
              }
              onUnsave={() => toggleSave(item.id)}
              showUnsave
            />
          ) : null
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 + 80 : 100 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No saved verses yet</Text>
            <Text style={styles.emptyText}>
              Save verses from the Home screen or when viewing a verse
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
  },
});

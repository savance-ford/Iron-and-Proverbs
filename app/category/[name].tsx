import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { VerseRow } from "@/components/VerseRow";
import { useApp } from "@/context/AppContext";
import { searchVerses, CATEGORY_META } from "@/lib/verseEngine";
import { Colors } from "@/constants/colors";

export default function CategoryDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const insets = useSafeAreaInsets();
  const { toggleSave } = useApp();
  const [search, setSearch] = useState("");

  const category = name ?? "";
  const meta = CATEGORY_META[category] ?? { icon: "book-outline", description: "" };
  const verses = searchVerses(search, category);

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
      </View>

      <View style={styles.categoryHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={meta.icon as any} size={26} color={Colors.amber} />
        </View>
        <Text style={styles.categoryName}>{category}</Text>
        <Text style={styles.categoryDesc}>{meta.description}</Text>
        <Text style={styles.verseCount}>{verses.length} verses</Text>
      </View>

      <View style={styles.searchArea}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search verses..."
            placeholderTextColor={Colors.textMuted}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={verses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VerseRow
            verse={item}
            onPress={() =>
              router.push({
                pathname: "/verse/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 40 : insets.bottom + 40,
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No verses match your search</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  categoryHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  categoryDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  verseCount: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  searchArea: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    padding: 0,
  },
  list: {
    paddingHorizontal: 20,
  },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
});

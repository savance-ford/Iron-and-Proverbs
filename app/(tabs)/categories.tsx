import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CategoryCard } from "@/components/CategoryCard";
import { Colors } from "@/constants/colors";
import { ALL_CATEGORIES } from "@/lib/verseEngine";

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? ALL_CATEGORIES.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_CATEGORIES;

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
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>Scripture organized for the man in the arena</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search categories..."
            placeholderTextColor={Colors.textMuted}
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={16}
              color={Colors.textMuted}
              onPress={() => setSearch("")}
            />
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() =>
              router.push({
                pathname: "/category/[name]",
                params: { name: item },
              })
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 80 : 100,
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No categories match your search</Text>
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
    gap: 6,
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
    marginBottom: 6,
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
    paddingTop: 4,
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

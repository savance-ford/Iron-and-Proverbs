import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Verse } from "@/lib/verseEngine";

interface ShareCardProps {
  verse: Verse;
  label?: string;
}

const CARD_WIDTH = 360;
const AMBER = "#C9A84C";
const AMBER_DIM = "#8A6E2F";
const TEXT_PRIMARY = "#F0EDE8";
const TEXT_SECONDARY = "#A09A92";
const TEXT_MUTED = "#585350";
const BORDER = "rgba(201, 168, 76, 0.18)";

export function ShareCard({ verse, label }: ShareCardProps) {
  const displayLabel = label ?? (verse.tags[0] ?? "IRON & PROVERBS");

  return (
    <LinearGradient
      colors={["#161412", "#0E0D0B", "#141210"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Subtle top-left corner glow */}
      <View style={styles.cornerGlow} />

      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.appBrand}>
          <View style={styles.brandDot} />
          <Text style={styles.appName}>IRON & PROVERBS</Text>
        </View>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{displayLabel.toUpperCase()}</Text>
        </View>
      </View>

      {/* Amber accent line */}
      <LinearGradient
        colors={[AMBER_DIM, AMBER, AMBER_DIM]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />

      {/* Verse text */}
      <View style={styles.verseSection}>
        <Text style={styles.openQuote}>"</Text>
        <Text style={styles.verseText}>{verse.text}</Text>
        <Text style={styles.closeQuote}>"</Text>
      </View>

      {/* Reference */}
      <View style={styles.referenceRow}>
        <View style={styles.referenceAccent} />
        <Text style={styles.reference}>{verse.reference}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.translation}>{verse.translation}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Application */}
      <View style={styles.applicationSection}>
        <Text style={styles.applicationLabel}>APPLICATION</Text>
        <Text style={styles.applicationText}>{verse.application}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.watermark}>Iron & Proverbs</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  cornerGlow: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(201, 168, 76, 0.06)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  appBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AMBER,
  },
  appName: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
    color: AMBER,
  },
  labelBadge: {
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  labelText: {
    fontSize: 8,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    color: AMBER,
  },
  accentLine: {
    height: 1,
    borderRadius: 1,
    marginBottom: 24,
    opacity: 0.6,
  },
  verseSection: {
    marginBottom: 18,
    position: "relative",
  },
  openQuote: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: "rgba(201, 168, 76, 0.15)",
    lineHeight: 44,
    marginBottom: -8,
    letterSpacing: -2,
  },
  verseText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: TEXT_PRIMARY,
    lineHeight: 28,
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  closeQuote: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: "rgba(201, 168, 76, 0.15)",
    lineHeight: 36,
    textAlign: "right",
    marginTop: 4,
    letterSpacing: -2,
  },
  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  referenceAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: AMBER,
  },
  reference: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: AMBER,
    letterSpacing: 0.3,
  },
  dot: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontFamily: "Inter_400Regular",
  },
  translation: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
  applicationSection: {
    gap: 7,
    marginBottom: 20,
  },
  applicationLabel: {
    fontSize: 8,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
    color: TEXT_MUTED,
  },
  applicationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: TEXT_SECONDARY,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  watermark: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: TEXT_MUTED,
    letterSpacing: 1.5,
  },
});

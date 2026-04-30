import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { theme } from "../../constants/theme";

interface CardProps {
  children: ReactNode;
  accent?: string;
  style?: StyleProp<ViewStyle>;
  tone?: "default" | "highlight" | "danger";
}

export function Card({ accent, children, style, tone = "default" }: CardProps) {
  const borderColor =
    tone === "highlight"
      ? theme.alpha.primary22
      : tone === "danger"
        ? theme.alpha.danger50
        : theme.colors.border;

  return (
    <View style={[styles.card, { borderColor }, style]}>
      {accent ? <View style={[styles.accent, { backgroundColor: accent }]} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  accent: {
    alignSelf: "stretch",
    borderRadius: 999,
    width: 4,
  },
});

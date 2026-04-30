import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { theme } from "../../constants/theme";

type CardPadding = keyof typeof theme.spacing;
type CardRadius = keyof typeof theme.radius;

interface CardProps {
  children: ReactNode;
  accent?: string;
  padding?: CardPadding;
  radius?: CardRadius;
  style?: StyleProp<ViewStyle>;
  tone?: "default" | "highlight" | "danger";
}

export function Card({
  accent,
  children,
  padding = "lg",
  radius = "md",
  style,
  tone = "default",
}: CardProps) {
  const borderColor =
    tone === "highlight"
      ? theme.alpha.primary22
      : tone === "danger"
        ? theme.alpha.danger50
        : theme.colors.border;

  return (
    <View
      style={[
        styles.card,
        { borderColor, borderRadius: theme.radius[radius], padding: theme.spacing[padding] },
        style,
      ]}
    >
      {accent ? <View style={[styles.accent, { backgroundColor: accent }]} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.md,
  },
  accent: {
    alignSelf: "stretch",
    borderRadius: 999,
    width: 4,
  },
});

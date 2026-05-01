import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";

interface BadgeProps {
  label: string;
  tone?: "default" | "highlight" | "success";
}

export function Badge({ label, tone = "default" }: BadgeProps) {
  const backgroundColor =
    tone === "highlight"
      ? theme.alpha.primary18
      : tone === "success"
        ? theme.alpha.success18
        : theme.colors.surfaceAlt;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});

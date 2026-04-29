import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";

interface StatCardProps {
  label: string;
  value: string;
  accent: string;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  value: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  label: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});

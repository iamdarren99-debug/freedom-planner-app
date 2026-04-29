import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { PlannerBlock } from "../../types/planner";

interface PlannerCardProps {
  block: PlannerBlock;
}

export function PlannerCard({ block }: PlannerCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{block.title}</Text>
      <Text style={styles.meta}>
        {block.timeWindow} · {block.focus}
      </Text>
      {block.items.map((item) => (
        <Text key={item} style={styles.item}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  item: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});

import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";

interface PlannerCardProps {
  title: string;
  meta: string;
  items: string[];
}

export function PlannerCard({ title, meta, items }: PlannerCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{meta}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.item}>
          - {item}
        </Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
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

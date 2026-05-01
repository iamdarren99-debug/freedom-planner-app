import { StyleSheet, Text } from "react-native";

import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";

export function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    flexBasis: "47%",
    flexGrow: 1,
    gap: theme.spacing.xs,
    minWidth: 140,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});

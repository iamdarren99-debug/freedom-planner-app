import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { ReviewRow } from "../../utils/reviewMetrics";
import { Card } from "../ui/Card";

export function ReviewCard({ rows, title }: { rows: ReviewRow[]; title: string }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.stack}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            {Array.isArray(row.value) ? (
              row.value.length > 0 ? (
                row.value.map((item) => (
                  <Text key={item} style={styles.value}>
                    - {item}
                  </Text>
                ))
              ) : (
                <Text style={styles.value}>No signal yet</Text>
              )
            ) : (
              <Text style={styles.value}>{row.value}</Text>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  stack: {
    gap: theme.spacing.md,
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  label: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  value: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});

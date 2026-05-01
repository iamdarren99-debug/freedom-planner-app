import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function ProgressBarRow({
  color,
  label,
  note,
  value,
}: {
  color: string;
  label: string;
  note?: string;
  value: number;
}) {
  return (
    <Card style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>{label}</Text>
        <Text style={styles.progressValue}>{value}%</Text>
      </View>
      <ProgressBar color={color} value={value} />
      {note ? <Text style={styles.progressNote}>{note}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    gap: theme.spacing.sm,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  progressTitle: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  progressValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  progressNote: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});

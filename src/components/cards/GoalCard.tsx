import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AREA_META } from "../../constants/app";
import { theme } from "../../constants/theme";
import { Goal } from "../../types/planner";
import { Badge } from "../ui/Badge";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const area = AREA_META[goal.area];

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/goals/[id]",
          params: { id: goal.id },
        })
      }
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.94 : 1 }]}
    >
      <View style={styles.row}>
        <Text style={[styles.area, { color: area.color }]}>{area.label}</Text>
        <Badge
          label={goal.priority}
          tone={goal.priority === "high" ? "highlight" : "default"}
        />
      </View>

      <Text style={styles.title}>{goal.title}</Text>
      <Text style={styles.description}>{goal.description}</Text>

      <View style={styles.row}>
        <Badge label={goal.status} tone={goal.status === "active" ? "success" : "default"} />
        <Text style={styles.timeline}>{goal.timeline}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${goal.progress}%`, backgroundColor: area.color },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{goal.progress}% progress</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  area: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  timeline: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceAlt,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
});

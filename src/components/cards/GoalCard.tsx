import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Goal } from "../../types/planner";
import { getAreaMeta } from "../../utils/areaMeta";
import { goalStatusLabel } from "../../utils/planning";
import { useAppStore } from "../../store/useAppStore";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const appSettings = useAppStore((state) => state.appSettings);
  const area = getAreaMeta(goal.targetAreaId, appSettings);
  const deleteGoal = useAppStore((state) => state.deleteGoal);

  const confirmDelete = () => {
    Alert.alert(
      "Delete goal?",
      "This removes the goal, linked tasks, progress logs, and daily completions.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteGoal(goal.id) },
      ],
    );
  };

  return (
    <Pressable
      android_ripple={{ color: theme.alpha.white06 }}
      onLongPress={confirmDelete}
      onPress={() =>
        router.push({
          pathname: "/goals/[id]",
          params: { id: goal.id },
        })
      }
      style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1 })}
    >
      <Card>
        <View style={styles.row}>
          <Text numberOfLines={1} style={[styles.area, { color: area.color }]}>
            {area.label}
          </Text>
          <Badge
            label={goal.priority}
            tone={goal.priority === "HIGH" ? "highlight" : "default"}
          />
        </View>

        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.description}>{goal.description}</Text>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Success metric</Text>
          <Text style={styles.metricText}>{goal.successMetric}</Text>
        </View>

        <View style={styles.row}>
          <Badge
            label={goalStatusLabel(goal.status)}
            tone={goal.status === "IN_PROGRESS" ? "success" : "default"}
          />
          <Text style={styles.timeline}>{goal.timeline}</Text>
        </View>

        <ProgressBar color={area.color} height={8} value={goal.progressPercentage} />
        <Text style={styles.progressText}>{goal.progressPercentage}% progress</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  metricBox: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.spacing.md,
    gap: 3,
  },
  metricLabel: {
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metricText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  progressText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
});

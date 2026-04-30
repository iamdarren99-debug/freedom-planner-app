import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AREA_META } from "../../src/constants/app";
import { theme } from "../../src/constants/theme";
import { Badge } from "../../src/components/ui/Badge";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { useAppStore } from "../../src/store/useAppStore";
import { goalStatusLabel } from "../../src/utils/planning";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goal = useAppStore((state) => state.goals.find((item) => item.id === id));

  if (!goal) {
    return (
      <Screen>
        <EmptyState
          title="Goal not found"
          description="The selected goal could not be loaded."
        />
      </Screen>
    );
  }

  const area = AREA_META[goal.targetAreaId];

  return (
    <Screen>
      <Stack.Screen options={{ title: goal.title }} />
      <View style={styles.hero}>
        <Text style={[styles.area, { color: area.color }]}>{area.label}</Text>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.description}>{goal.description}</Text>

        <View style={styles.badges}>
          <Badge label={goal.priority} tone={goal.priority === "HIGH" ? "highlight" : "default"} />
          <Badge
            label={goalStatusLabel(goal.status)}
            tone={goal.status === "IN_PROGRESS" ? "success" : "default"}
          />
          <Badge label={goal.timeline} />
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader title="Execution method" />
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Success metric</Text>
          <Text style={styles.metricValue}>{goal.successMetric}</Text>
        </View>
        <View style={styles.list}>
          {goal.executionMethod.map((item) => (
            <Text key={item} style={styles.item}>
              - {item}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader title="Weekly actions" subtitle="Actions that feed the daily loop." />
        <View style={styles.list}>
          {goal.weeklyActions.map((item) => (
            <Text key={item} style={styles.item}>
              - {item}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader title="Current progress" subtitle="Updated by completed focus actions." />
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${goal.progressPercentage}%`, backgroundColor: area.color },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{goal.progressPercentage}% complete</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  area: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  panel: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
  },
  metricBox: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.spacing.md,
    gap: 4,
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  item: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});

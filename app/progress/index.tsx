import { StyleSheet, Text, View } from "react-native";

import { AREA_META } from "../../src/constants/app";
import { theme } from "../../src/constants/theme";
import { useAppStore } from "../../src/store/useAppStore";
import { averageProgress, goalsByArea } from "../../src/utils/planning";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";

export default function ProgressScreen() {
  const goals = useAppStore((state) => state.goals);

  return (
    <Screen>
      <SectionHeader
        eyebrow="Progress"
        title="Progress overview"
        subtitle="This screen stays intentionally simple in Phase 0: just enough to validate the shape."
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Overall average</Text>
        <Text style={styles.summaryValue}>{averageProgress(goals)}%</Text>
      </View>

      <View style={styles.stack}>
        {Object.entries(AREA_META).map(([key, area]) => {
          const areaGoals = goalsByArea(goals, key as keyof typeof AREA_META);
          const progress = averageProgress(areaGoals);

          return (
            <View key={key} style={styles.areaCard}>
              <Text style={[styles.areaTitle, { color: area.color }]}>{area.label}</Text>
              <Text style={styles.areaDescription}>{area.description}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: area.color },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress}% average progress</Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: "800",
  },
  stack: {
    gap: theme.spacing.md,
  },
  areaCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  areaDescription: {
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
    fontSize: 12,
    fontWeight: "700",
  },
});

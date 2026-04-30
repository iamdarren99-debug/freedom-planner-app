import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "../../../src/constants/theme";
import { GoalCard } from "../../../src/components/cards/GoalCard";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { Card } from "../../../src/components/ui/Card";
import { Screen } from "../../../src/components/ui/Screen";
import { SectionHeader } from "../../../src/components/ui/SectionHeader";
import { useAppStore } from "../../../src/store/useAppStore";
import { getAreaMeta } from "../../../src/utils/areaMeta";
import { averageProgress, goalsByArea } from "../../../src/utils/planning";
import { TargetAreaId } from "../../../src/types/planner";

const AREA_ORDER: TargetAreaId[] = [
  "financial",
  "career-business",
  "skills",
  "personal-relationship",
];

export default function GoalsScreen() {
  const goals = useAppStore((state) => state.goals);
  const appSettings = useAppStore((state) => state.appSettings);
  const [expandedAreas, setExpandedAreas] = useState<Record<TargetAreaId, boolean>>({
    financial: true,
    "career-business": true,
    skills: true,
    "personal-relationship": true,
  });

  const toggleArea = (areaId: TargetAreaId) => {
    setExpandedAreas((current) => ({
      ...current,
      [areaId]: !current[areaId],
    }));
  };

  return (
    <Screen>
      <SectionHeader
        title="Goal library"
      />

      <View style={styles.stack}>
        {AREA_ORDER.map((areaId) => {
          const area = getAreaMeta(areaId, appSettings);
          const areaGoals = goalsByArea(goals, areaId);
          const expanded = expandedAreas[areaId];

          return (
            <Card
              key={areaId}
              radius="lg"
              style={[styles.areaPanel, { borderColor: `${area.color}55` }]}
            >
              <Pressable
                android_ripple={{ color: theme.alpha.white06 }}
                onPress={() => toggleArea(areaId)}
                style={styles.areaHeader}
              >
                <View style={styles.areaHeaderText}>
                  <Text style={[styles.areaTitle, { color: area.color }]}>{area.label}</Text>
                  <Text style={styles.areaDescription}>{area.description}</Text>
                  <Text style={styles.areaMeta}>
                    {areaGoals.length} goals - {averageProgress(areaGoals)}% average
                  </Text>
                </View>
                <MaterialCommunityIcons
                  color={theme.colors.text}
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={24}
                />
              </Pressable>

              {expanded ? (
                <View style={styles.goalStack}>
                  {areaGoals.length === 0 ? (
                    <EmptyState
                      title="No goals in this area"
                      description="New goals for this target area will appear here."
                    />
                  ) : (
                    areaGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
                  )}
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
  areaPanel: {
    overflow: "hidden",
    padding: 0,
  },
  areaHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  areaHeaderText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  areaTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  areaDescription: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  areaMeta: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  goalStack: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
});

import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "../../constants/theme";
import { AppSettings, Goal, ProgressLog } from "../../types/planner";
import { getAreaMeta } from "../../utils/areaMeta";
import { ProgressBarRow } from "./ProgressBarRow";

export function GoalProgressGroup({
  goals,
  logs,
  appSettings,
  goalIds,
}: {
  appSettings?: AppSettings;
  goalIds: string[];
  goals: Goal[];
  logs: ProgressLog[];
}) {
  const latestLogsByGoal = useMemo(() => {
    const latest = new Map<string, ProgressLog>();

    for (const log of logs) {
      const existing = latest.get(log.goalId);

      if (!existing || log.date > existing.date) {
        latest.set(log.goalId, log);
      }
    }

    return latest;
  }, [logs]);

  return (
    <View style={styles.stack}>
      {goalIds.map((goalId) => {
        const goal = goals.find((item) => item.id === goalId);

        if (!goal) {
          return null;
        }

        const latestLog = latestLogsByGoal.get(goal.id);

        return (
          <ProgressBarRow
            color={getAreaMeta(goal.targetAreaId, appSettings).color}
            key={goal.id}
            label={goal.title}
            note={latestLog?.note}
            value={goal.progressPercentage}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
});

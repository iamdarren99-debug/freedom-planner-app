import { StyleSheet, View } from "react-native";

import { theme } from "../../constants/theme";
import { AppSettings, Goal, ProgressLog } from "../../types/planner";
import { getAreaMeta } from "../../utils/areaMeta";
import { latestLogForGoal } from "../../utils/progressMetrics";
import { ProgressBarRow } from "./ProgressBarRow";

export function GoalProgressGroup({
  goals,
  logs,
  appSettings,
  titles,
}: {
  appSettings?: AppSettings;
  goals: Goal[];
  logs: ProgressLog[];
  titles: string[];
}) {
  return (
    <View style={styles.stack}>
      {titles.map((title) => {
        const goal = goals.find((item) => item.title === title);

        if (!goal) {
          return null;
        }

        const latestLog = latestLogForGoal(logs, goal.id);

        return (
          <ProgressBarRow
            color={getAreaMeta(goal.targetAreaId, appSettings).color}
            key={goal.id}
            label={goal.title}
            note={latestLog?.note}
            value={latestLog?.value ?? goal.progressPercentage}
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

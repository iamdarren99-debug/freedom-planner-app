import { StyleSheet, View } from "react-native";

import { AREA_META } from "../../constants/app";
import { theme } from "../../constants/theme";
import { Goal, ProgressLog } from "../../types/planner";
import { latestLogForGoal } from "../../utils/progressMetrics";
import { ProgressBarRow } from "./ProgressBarRow";

export function GoalProgressGroup({
  goals,
  logs,
  titles,
}: {
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
            color={AREA_META[goal.targetAreaId].color}
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

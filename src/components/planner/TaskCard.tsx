import { Alert, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AREA_META } from "../../constants/app";
import { theme } from "../../constants/theme";
import { Goal, JournalEntry, Task } from "../../types/planner";
import { formatDate } from "../../utils/planning";
import { SmallAction } from "../forms/SmallAction";
import { Card } from "../ui/Card";

interface TaskCardProps {
  goal?: Goal;
  journalEntries?: JournalEntry[];
  onComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSkip: () => void;
  task: Task;
}

export function TaskCard({
  goal,
  journalEntries = [],
  onComplete,
  onDelete,
  onEdit,
  onSkip,
  task,
}: TaskCardProps) {
  const accentColor = goal ? AREA_META[goal.targetAreaId].color : theme.colors.primary;
  const done = task.status === "DONE";
  const skipped = task.status === "SKIPPED";

  return (
    <Card style={[styles.taskCard, done ? styles.taskCardDone : null]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleBlock}>
          <Text style={[styles.taskTitle, skipped ? styles.mutedText : null]}>{task.title}</Text>
          <Text style={styles.taskMeta}>
            {task.timeBlock ?? "Flexible"} - {task.priority} - {task.status}
          </Text>
          {goal ? <Text style={[styles.goalLink, { color: accentColor }]}>{goal.title}</Text> : null}
        </View>
        <StatusIcon accentColor={accentColor} status={task.status} />
      </View>
      {task.description ? <Text style={styles.taskBody}>{task.description}</Text> : null}
      {task.notes ? <Text style={styles.taskNotes}>{task.notes}</Text> : null}
      {journalEntries.length > 0 ? (
        <View style={styles.journalBlock}>
          <Text style={styles.journalHeading}>Linked journal</Text>
          {journalEntries.slice(0, 2).map((entry) => (
            <View key={entry.id} style={styles.journalItem}>
              <Text style={styles.journalTitle}>{entry.title}</Text>
              <Text style={styles.journalMeta}>{formatDate(entry.date)}</Text>
              {entry.progressReflection ? (
                <Text style={styles.journalBody}>{entry.progressReflection}</Text>
              ) : (
                <Text style={styles.journalBody}>{entry.content}</Text>
              )}
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.taskActions}>
        <SmallAction label={done ? "Undo done" : "Done"} onPress={onComplete} />
        <SmallAction label={skipped ? "Undo skip" : "Skip"} onPress={onSkip} disabled={done} />
        <SmallAction label="Edit" onPress={onEdit} />
        <SmallAction
          danger
          label="Delete"
          onPress={() =>
            Alert.alert("Delete task?", "This removes the task from this day.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: onDelete },
            ])
          }
        />
      </View>
    </Card>
  );
}

function StatusIcon({ accentColor, status }: { accentColor: string; status: Task["status"] }) {
  if (status === "DONE") {
    return <MaterialCommunityIcons color={accentColor} name="check-circle" size={20} />;
  }

  if (status === "SKIPPED") {
    return (
      <MaterialCommunityIcons
        color={theme.colors.subtle}
        name="close-circle-outline"
        size={20}
      />
    );
  }

  return <MaterialCommunityIcons color={accentColor} name="circle-outline" size={20} />;
}

const styles = StyleSheet.create({
  taskCard: {
    gap: theme.spacing.md,
  },
  taskCardDone: {
    opacity: 0.72,
  },
  taskHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  taskTitleBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  taskMeta: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  goalLink: {
    fontSize: 12,
    fontWeight: "900",
  },
  taskBody: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  taskNotes: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    padding: theme.spacing.md,
  },
  journalBlock: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  journalHeading: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  journalItem: {
    gap: 2,
  },
  journalTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  journalMeta: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: "800",
  },
  journalBody: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  taskActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  mutedText: {
    color: theme.colors.subtle,
  },
});

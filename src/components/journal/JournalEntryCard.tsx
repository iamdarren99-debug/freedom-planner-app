import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Goal, JournalEntry, Task } from "../../types/planner";
import { formatDate } from "../../utils/planning";
import { Card } from "../ui/Card";

interface JournalEntryCardProps {
  entry: JournalEntry;
  goals: Goal[];
  tasks: Task[];
}

export function JournalEntryCard({ entry, goals, tasks }: JournalEntryCardProps) {
  const linkedGoals = goals.filter((goal) => entry.linkedGoalIds.includes(goal.id));
  const linkedTasks = tasks.filter((task) => entry.linkedTaskIds.includes(task.id));

  return (
    <Card style={styles.entryCard}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
        </View>
        {entry.mood ? <Text style={styles.mood}>{entry.mood}</Text> : null}
      </View>

      <Text style={styles.entryContent}>{entry.content}</Text>

      {entry.progressReflection ? (
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionLabel}>Progress reflection</Text>
          <Text style={styles.reflectionText}>{entry.progressReflection}</Text>
        </View>
      ) : null}

      {linkedGoals.length > 0 || linkedTasks.length > 0 ? (
        <View style={styles.links}>
          {linkedGoals.map((goal) => (
            <Text key={goal.id} style={styles.linkPill}>
              Goal: {goal.title}
            </Text>
          ))}
          {linkedTasks.map((task) => (
            <Text key={task.id} style={styles.linkPill}>
              Task: {task.title}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  entryCard: {
    gap: theme.spacing.sm,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  entryTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  entryDate: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  mood: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.alpha.primary22,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  entryContent: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  reflectionBox: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    gap: 4,
    padding: theme.spacing.md,
  },
  reflectionLabel: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  reflectionText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  linkPill: {
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
});

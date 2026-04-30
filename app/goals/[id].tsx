import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AREA_META } from "../../src/constants/app";
import { theme } from "../../src/constants/theme";
import { PrimaryButton } from "../../src/components/forms/PrimaryButton";
import { TextField } from "../../src/components/forms/TextField";
import { Badge } from "../../src/components/ui/Badge";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { useAppStore } from "../../src/store/useAppStore";
import { Goal, GoalPriority, GoalStatus } from "../../src/types/planner";
import { formatDate, goalStatusLabel } from "../../src/utils/planning";

const PRIORITIES: GoalPriority[] = ["LOW", "MEDIUM", "HIGH"];
const STATUSES: GoalStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PAUSED"];

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goal = useAppStore((state) => state.goals.find((item) => item.id === id));
  const tasks = useAppStore((state) => state.tasks.filter((task) => task.goalId === id));
  const journalEntries = useAppStore((state) =>
    state.journalEntries.filter((entry) => entry.linkedGoalIds.includes(id)),
  );
  const progressLogs = useAppStore((state) =>
    state.progressLogs.filter((log) => log.goalId === id),
  );
  const updateGoal = useAppStore((state) => state.updateGoal);
  const [editing, setEditing] = useState(false);

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
      <Card padding="xl" radius="lg" style={styles.hero}>
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

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${goal.progressPercentage}%`, backgroundColor: area.color },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{goal.progressPercentage}% complete</Text>

        <Pressable
          onPress={() => setEditing((value) => !value)}
          style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.editButtonText}>{editing ? "Close editor" : "Edit goal"}</Text>
        </Pressable>
      </Card>

      {editing ? (
        <GoalEditPanel
          goal={goal}
          onCancel={() => setEditing(false)}
          onSave={(updates) => {
            updateGoal(goal.id, updates);
            setEditing(false);
          }}
        />
      ) : null}

      <Card style={styles.panel}>
        <SectionHeader title="Goal details" subtitle="The full target, method, and measure." />
        <DetailRow label="Target area" value={area.label} />
        <DetailRow label="Timeline" value={goal.timeline} />
        <DetailRow label="Success metric" value={goal.successMetric} />
        <DetailRow label="Priority" value={goal.priority} />
        <DetailRow label="Status" value={goalStatusLabel(goal.status)} />
        <DetailRow label="Progress" value={`${goal.progressPercentage}%`} />
      </Card>

      <InfoPanel title="Execution method" items={goal.executionMethod} />
      <InfoPanel title="Weekly actions" items={goal.weeklyActions} />

      <Card style={styles.panel}>
        <SectionHeader title="Linked tasks" subtitle="Tasks connected to this long-term goal." />
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No linked tasks yet.</Text>
        ) : (
          <View style={styles.list}>
            {tasks.map((task) => (
              <View key={task.id} style={styles.linkedCard}>
                <Text style={styles.linkedTitle}>{task.title}</Text>
                <Text style={styles.linkedMeta}>
                  {formatDate(task.date)} - {task.status}
                </Text>
                {task.notes ? <Text style={styles.linkedBody}>{task.notes}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.panel}>
        <SectionHeader
          title="Linked journal entries"
          subtitle="Reflections tied back to this goal."
        />
        {journalEntries.length === 0 ? (
          <Text style={styles.emptyText}>No linked journal entries yet.</Text>
        ) : (
          <View style={styles.list}>
            {journalEntries.map((entry) => (
              <View key={entry.id} style={styles.linkedCard}>
                <Text style={styles.linkedTitle}>{entry.title}</Text>
                <Text style={styles.linkedMeta}>{formatDate(entry.date)}</Text>
                <Text style={styles.linkedBody}>{entry.content}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.panel}>
        <SectionHeader title="Progress logs" subtitle="History of progress updates." />
        {progressLogs.length === 0 ? (
          <Text style={styles.emptyText}>No progress logs yet.</Text>
        ) : (
          <View style={styles.list}>
            {progressLogs.slice(0, 8).map((log) => (
              <View key={log.id} style={styles.linkedCard}>
                <Text style={styles.linkedTitle}>{log.value}% progress</Text>
                <Text style={styles.linkedMeta}>{formatDate(log.date)}</Text>
                {log.note ? <Text style={styles.linkedBody}>{log.note}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.panel}>
        <SectionHeader title="Notes" subtitle="Private context for future edits." />
        <Text style={goal.notes ? styles.notesText : styles.emptyText}>
          {goal.notes || "No notes yet."}
        </Text>
      </Card>
    </Screen>
  );
}

function GoalEditPanel({
  goal,
  onCancel,
  onSave,
}: {
  goal: Goal;
  onCancel: () => void;
  onSave: (updates: Partial<Omit<Goal, "id" | "createdAt" | "updatedAt">>) => void;
}) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [timeline, setTimeline] = useState(goal.timeline);
  const [executionMethod, setExecutionMethod] = useState(goal.executionMethod.join("\n"));
  const [weeklyActions, setWeeklyActions] = useState(goal.weeklyActions.join("\n"));
  const [successMetric, setSuccessMetric] = useState(goal.successMetric);
  const [priority, setPriority] = useState<GoalPriority>(goal.priority);
  const [status, setStatus] = useState<GoalStatus>(goal.status);
  const [progressPercentage, setProgressPercentage] = useState(String(goal.progressPercentage));
  const [notes, setNotes] = useState(goal.notes ?? "");

  const save = () => {
    onSave({
      title: title.trim() || goal.title,
      description: description.trim(),
      timeline: timeline.trim(),
      executionMethod: linesFromText(executionMethod),
      weeklyActions: linesFromText(weeklyActions),
      successMetric: successMetric.trim(),
      priority,
      status,
      progressPercentage: clampPercent(Number(progressPercentage)),
      notes: notes.trim(),
    });
  };

  return (
    <Card style={styles.panel}>
      <SectionHeader title="Edit goal" subtitle="Keep the plan useful, not precious." />
      <TextField label="Goal title" onChangeText={setTitle} value={title} />
      <TextField
        label="Description"
        multiline
        onChangeText={setDescription}
        value={description}
      />
      <TextField label="Timeline" onChangeText={setTimeline} value={timeline} />
      <TextField
        label="Execution method"
        multiline
        onChangeText={setExecutionMethod}
        value={executionMethod}
      />
      <TextField
        label="Weekly actions"
        multiline
        onChangeText={setWeeklyActions}
        value={weeklyActions}
      />
      <TextField label="Success metric" onChangeText={setSuccessMetric} value={successMetric} />
      <ChoiceGroup
        label="Priority"
        options={PRIORITIES}
        selected={priority}
        onSelect={setPriority}
      />
      <ChoiceGroup label="Status" options={STATUSES} selected={status} onSelect={setStatus} />
      <TextField
        keyboardType="number-pad"
        label="Progress percentage"
        onChangeText={setProgressPercentage}
        value={progressPercentage}
      />
      <TextField label="Notes" multiline onChangeText={setNotes} value={notes} />
      <View style={styles.formActions}>
        <Pressable onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        <View style={styles.saveButtonWrap}>
          <PrimaryButton label="Save changes" onPress={save} />
        </View>
      </View>
    </Card>
  );
}

function ChoiceGroup<T extends string>({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: T) => void;
  options: T[];
  selected: T;
}) {
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => {
          const active = option === selected;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.choiceChip, active ? styles.choiceChipActive : null]}
            >
              <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>
                {option.replaceAll("_", " ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function InfoPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <Card style={styles.panel}>
      <SectionHeader title={title} />
      <View style={styles.list}>
        {items.map((item) => (
          <Text key={item} style={styles.item}>
            - {item}
          </Text>
        ))}
      </View>
    </Card>
  );
}

function linesFromText(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampPercent(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

const styles = StyleSheet.create({
  hero: {
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  area: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "900",
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
    gap: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
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
    fontWeight: "800",
  },
  editButton: {
    alignItems: "center",
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    minHeight: 44,
    justifyContent: "center",
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 4,
    paddingBottom: theme.spacing.sm,
  },
  detailLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  linkedCard: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.spacing.md,
    gap: 4,
  },
  linkedTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  linkedMeta: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  linkedBody: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  notesText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  choiceGroup: {
    gap: theme.spacing.xs,
  },
  choiceLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  choiceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  choiceChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.alpha.primary16,
  },
  choiceText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  choiceTextActive: {
    color: theme.colors.text,
  },
  formActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  saveButtonWrap: {
    flex: 1,
  },
});

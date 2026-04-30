import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Goal, GoalPriority } from "../../types/planner";
import { isActiveGoal, priorityRank } from "../../utils/planning";
import { ChoiceChip } from "../forms/ChoiceChip";
import { ChoiceGroup } from "../forms/ChoiceGroup";
import { PrimaryButton } from "../forms/PrimaryButton";
import { SmallAction } from "../forms/SmallAction";
import { TextField } from "../forms/TextField";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";

export type TaskFormMode = "add" | "edit";

export interface TaskFormState {
  title: string;
  description: string;
  goalId?: string;
  timeBlock: string;
  durationMinutes: string;
  priority: GoalPriority;
  notes: string;
}

const PRIORITIES: GoalPriority[] = ["LOW", "MEDIUM", "HIGH"];

interface TaskEditorProps {
  form: TaskFormState;
  goals: Goal[];
  mode: TaskFormMode;
  onCancel: () => void;
  onChange: (form: TaskFormState) => void;
  onSave: () => void;
  timeBlocks: string[];
}

export function TaskEditor({
  form,
  goals,
  mode,
  onCancel,
  onChange,
  onSave,
  timeBlocks,
}: TaskEditorProps) {
  const setValue = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <Card style={styles.editorCard}>
      <SectionHeader
        eyebrow="Task editor"
        title={mode === "edit" ? "Edit task" : "Add task"}
        subtitle="Keep it specific enough to execute tonight."
      />
      <TextField
        label="Task title"
        onChangeText={(value) => setValue("title", value)}
        placeholder="What is the next clear action?"
        value={form.title}
      />
      <TextField
        label="Description"
        multiline
        onChangeText={(value) => setValue("description", value)}
        placeholder="Optional context."
        value={form.description}
      />
      <ChoiceGroup
        label="Time block"
        options={timeBlocks}
        selected={form.timeBlock}
        onSelect={(value) => setValue("timeBlock", value)}
      />
      <TextField
        keyboardType="number-pad"
        label="Duration minutes"
        onChangeText={(value) => setValue("durationMinutes", value)}
        placeholder="30"
        value={form.durationMinutes}
      />
      <ChoiceGroup
        label="Priority"
        options={PRIORITIES}
        selected={form.priority}
        onSelect={(value) => setValue("priority", value)}
      />
      <GoalPicker
        goals={goals}
        selectedGoalId={form.goalId}
        onSelect={(goalId) => setValue("goalId", goalId)}
      />
      <TextField
        label="Notes"
        multiline
        onChangeText={(value) => setValue("notes", value)}
        placeholder="What should future you remember?"
        value={form.notes}
      />
      <View style={styles.formActions}>
        <SmallAction label="Clear" onPress={onCancel} />
        <View style={styles.saveButtonWrap}>
          <PrimaryButton disabled={!form.title.trim()} label="Save task" onPress={onSave} />
        </View>
      </View>
    </Card>
  );
}

export function createEmptyTaskForm(isOffDay = false): TaskFormState {
  return {
    title: "",
    description: "",
    goalId: undefined,
    timeBlock: isOffDay ? "Off day morning" : "8:30 PM",
    durationMinutes: "45",
    priority: "MEDIUM",
    notes: "",
  };
}

function GoalPicker({
  goals,
  onSelect,
  selectedGoalId,
}: {
  goals: Goal[];
  onSelect: (goalId: string | undefined) => void;
  selectedGoalId?: string;
}) {
  const activeGoals = goals.filter(isActiveGoal).sort((a, b) => {
    const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return a.title.localeCompare(b.title);
  });

  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceLabel}>Link to goal</Text>
      <View style={styles.choiceRow}>
        <ChoiceChip active={!selectedGoalId} label="No goal" onPress={() => onSelect(undefined)} />
        {activeGoals.slice(0, 8).map((goal) => (
          <ChoiceChip
            active={selectedGoalId === goal.id}
            key={goal.id}
            label={goal.title}
            onPress={() => onSelect(goal.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editorCard: {
    borderColor: theme.alpha.accent30,
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
  formActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  saveButtonWrap: {
    flex: 1,
  },
});

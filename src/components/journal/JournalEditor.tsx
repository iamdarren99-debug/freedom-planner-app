import { StyleSheet, Text, View } from "react-native";

import { JOURNAL_PROMPTS, MOOD_OPTIONS } from "../../constants/journal";
import { theme } from "../../constants/theme";
import { Goal, Task } from "../../types/planner";
import { PrimaryButton } from "../forms/PrimaryButton";
import { TextField } from "../forms/TextField";
import { ChoiceChip } from "../forms/ChoiceChip";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";

export interface JournalFormState {
  content: string;
  linkedGoalIds: string[];
  linkedTaskIds: string[];
  mood: string;
  progressReflection: string;
  title: string;
}

interface JournalEditorProps {
  dateLabel: string;
  form: JournalFormState;
  goals: Goal[];
  onChange: (form: JournalFormState) => void;
  onSave: () => void;
  tasks: Task[];
}

export function createEmptyJournalForm(): JournalFormState {
  return {
    content: "",
    linkedGoalIds: [],
    linkedTaskIds: [],
    mood: "",
    progressReflection: "",
    title: "",
  };
}

export function JournalEditor({
  dateLabel,
  form,
  goals,
  onChange,
  onSave,
  tasks,
}: JournalEditorProps) {
  const disabled = form.title.trim().length === 0 || form.content.trim().length === 0;

  const update = (updates: Partial<JournalFormState>) => {
    onChange({ ...form, ...updates });
  };

  const toggleGoal = (goalId: string) => {
    update({
      linkedGoalIds: form.linkedGoalIds.includes(goalId)
        ? form.linkedGoalIds.filter((id) => id !== goalId)
        : [...form.linkedGoalIds, goalId],
    });
  };

  const toggleTask = (taskId: string) => {
    update({
      linkedTaskIds: form.linkedTaskIds.includes(taskId)
        ? form.linkedTaskIds.filter((id) => id !== taskId)
        : [...form.linkedTaskIds, taskId],
    });
  };

  const addPrompt = (prompt: string) => {
    const nextContent = form.content.trim()
      ? `${form.content.trim()}\n\n${prompt}\n`
      : `${prompt}\n`;

    update({ content: nextContent });
  };

  return (
    <Card style={styles.panel}>
      <SectionHeader
        eyebrow="Daily journal"
        title="Write the signal"
        subtitle={`Entry date: ${dateLabel}`}
      />

      <TextField
        label="Title"
        onChangeText={(title) => update({ title })}
        placeholder="What should future you remember?"
        value={form.title}
      />

      <View style={styles.group}>
        <Text style={styles.label}>Prompts</Text>
        <View style={styles.chipRow}>
          {JOURNAL_PROMPTS.map((prompt) => (
            <ChoiceChip active={false} key={prompt} label={prompt} onPress={() => addPrompt(prompt)} />
          ))}
        </View>
      </View>

      <TextField
        label="Content"
        multiline
        onChangeText={(content) => update({ content })}
        placeholder="Wins, friction, decisions, or useful honesty."
        value={form.content}
      />

      <View style={styles.group}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.chipRow}>
          {MOOD_OPTIONS.map((mood) => (
            <ChoiceChip
              active={form.mood === mood}
              key={mood}
              label={mood}
              onPress={() => update({ mood: form.mood === mood ? "" : mood })}
            />
          ))}
        </View>
      </View>

      <TextField
        label="Progress reflection"
        multiline
        onChangeText={(progressReflection) => update({ progressReflection })}
        placeholder="How did today move the bigger plan?"
        value={form.progressReflection}
      />

      <LinkGroup
        emptyText="No goals available yet."
        label="Link goals"
        onToggle={toggleGoal}
        options={goals.map((goal) => ({ id: goal.id, label: goal.title }))}
        selectedIds={form.linkedGoalIds}
      />

      <LinkGroup
        emptyText="No tasks on this date yet."
        label="Link tasks"
        onToggle={toggleTask}
        options={tasks.map((task) => ({ id: task.id, label: task.title }))}
        selectedIds={form.linkedTaskIds}
      />

      <PrimaryButton disabled={disabled} label="Save journal entry" onPress={onSave} />
    </Card>
  );
}

function LinkGroup({
  emptyText,
  label,
  onToggle,
  options,
  selectedIds,
}: {
  emptyText: string;
  label: string;
  onToggle: (id: string) => void;
  options: { id: string; label: string }[];
  selectedIds: string[];
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        <View style={styles.chipRow}>
          {options.map((option) => (
            <ChoiceChip
              active={selectedIds.includes(option.id)}
              key={option.id}
              label={option.label}
              onPress={() => onToggle(option.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: theme.spacing.md,
  },
  group: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});

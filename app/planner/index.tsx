import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AREA_META } from "../../src/constants/app";
import { theme } from "../../src/constants/theme";
import { PrimaryButton } from "../../src/components/forms/PrimaryButton";
import { TextField } from "../../src/components/forms/TextField";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { useAppStore } from "../../src/store/useAppStore";
import { Goal, GoalPriority, Task } from "../../src/types/planner";
import { formatDate, getDateKey, isActiveGoal, priorityRank } from "../../src/utils/planning";

const PRIORITIES: GoalPriority[] = ["LOW", "MEDIUM", "HIGH"];
const TIME_BLOCKS = [
  "7:00 AM",
  "7:30 AM",
  "8:30 AM",
  "8:30 PM",
  "9:30 PM",
  "10:30 PM",
  "11:30 PM",
  "Off day morning",
  "Off day afternoon",
  "Off day evening",
];

type TaskFormMode = "add" | "edit";

interface TaskFormState {
  title: string;
  description: string;
  goalId?: string;
  timeBlock: string;
  durationMinutes: string;
  priority: GoalPriority;
  notes: string;
}

interface TaskSuggestion {
  title: string;
  description?: string;
  goalId?: string;
  timeBlock?: string;
  durationMinutes?: number;
  priority: GoalPriority;
  reason: string;
}

export default function PlannerScreen() {
  const goals = useAppStore((state) => state.goals);
  const tasks = useAppStore((state) => state.tasks);
  const weeklySystem = useAppStore((state) => state.weeklySystem);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const completeTask = useAppStore((state) => state.completeTask);
  const skipTask = useAppStore((state) => state.skipTask);
  const deleteTask = useAppStore((state) => state.deleteTask);

  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [formMode, setFormMode] = useState<TaskFormMode>("add");
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [form, setForm] = useState<TaskFormState>(createEmptyTaskForm());

  const dayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.date === selectedDate)
        .sort(compareTasksForDay),
    [tasks, selectedDate],
  );
  const isOffDay = isWeekend(selectedDate);
  const suggestions = useMemo(
    () => buildTaskSuggestions({ date: selectedDate, goals, tasks, weeklyHabits: weeklySystem.dailyHabits }),
    [goals, selectedDate, tasks, weeklySystem.dailyHabits],
  );

  const saveTask = () => {
    const title = form.title.trim();

    if (!title) {
      return;
    }

    const payload = {
      title,
      description: form.description.trim() || undefined,
      goalId: form.goalId,
      date: selectedDate,
      timeBlock: form.timeBlock.trim() || undefined,
      durationMinutes: toOptionalNumber(form.durationMinutes),
      priority: form.priority,
      notes: form.notes.trim() || undefined,
    };

    if (formMode === "edit" && editingTaskId) {
      updateTask(editingTaskId, payload);
    } else {
      addTask(payload);
    }

    resetForm();
  };

  const startEditTask = (task: Task) => {
    setFormMode("edit");
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      goalId: task.goalId,
      timeBlock: task.timeBlock ?? "",
      durationMinutes: task.durationMinutes ? String(task.durationMinutes) : "",
      priority: task.priority,
      notes: task.notes ?? "",
    });
  };

  const resetForm = () => {
    setFormMode("add");
    setEditingTaskId(undefined);
    setForm(createEmptyTaskForm());
  };

  const addSuggestion = (suggestion: TaskSuggestion) => {
    addTask({
      title: suggestion.title,
      description: suggestion.description,
      goalId: suggestion.goalId,
      date: selectedDate,
      timeBlock: suggestion.timeBlock,
      durationMinutes: suggestion.durationMinutes,
      priority: suggestion.priority,
      notes: `Suggested because: ${suggestion.reason}`,
    });
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Daily planner</Text>
        <Text style={styles.title}>Build the day around your real routine.</Text>
        <Text style={styles.subtitle}>
          Wake 7:00-7:30 AM. Leave 8:30-9:00 AM. Home around 8:00 PM. Sleep around
          12:00 AM.
        </Text>
      </View>

      <DateSelector
        date={selectedDate}
        onNext={() => setSelectedDate(addDays(selectedDate, 1))}
        onPrevious={() => setSelectedDate(addDays(selectedDate, -1))}
        onToday={() => setSelectedDate(getDateKey())}
      />

      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow="Guided structure"
          title={isOffDay ? "Off-day plan" : "Workday plan"}
          subtitle="Use this as a container, not a cage."
        />
        <RoutineCard isOffDay={isOffDay} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow="Suggestions"
          title="Smart task suggestions"
          subtitle="A small set of useful options based on goals and habits."
        />
        <View style={styles.stack}>
          {suggestions.length === 0 ? (
            <Text style={styles.emptyText}>No suggestions left for this date. The day is focused.</Text>
          ) : (
            suggestions.map((suggestion) => (
              <SuggestionCard
                key={`${suggestion.title}-${suggestion.goalId ?? "habit"}`}
                goal={goals.find((goal) => goal.id === suggestion.goalId)}
                onAdd={() => addSuggestion(suggestion)}
                suggestion={suggestion}
              />
            ))
          )}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow="Schedule"
          title="Daily view"
          subtitle="Complete, skip, edit, or delete tasks as the day changes."
        />
        <View style={styles.stack}>
          {dayTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks planned yet. Add one or use a suggestion.</Text>
          ) : (
            dayTasks.map((task) => (
              <TaskCard
                goal={goals.find((goal) => goal.id === task.goalId)}
                key={task.id}
                onComplete={() => completeTask(task.id)}
                onDelete={() =>
                  Alert.alert("Delete task?", "This removes the task from this day.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteTask(task.id) },
                  ])
                }
                onEdit={() => startEditTask(task)}
                onSkip={() => skipTask(task.id)}
                task={task}
              />
            ))
          )}
        </View>
      </View>

      <TaskEditor
        form={form}
        goals={goals}
        mode={formMode}
        onCancel={resetForm}
        onChange={setForm}
        onSave={saveTask}
      />
    </Screen>
  );
}

function DateSelector({
  date,
  onNext,
  onPrevious,
  onToday,
}: {
  date: string;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
}) {
  return (
    <View style={styles.dateCard}>
      <Pressable onPress={onPrevious} style={styles.iconButton}>
        <MaterialCommunityIcons color={theme.colors.text} name="chevron-left" size={24} />
      </Pressable>
      <View style={styles.dateContent}>
        <Text style={styles.dateLabel}>{date === getDateKey() ? "Today" : "Selected day"}</Text>
        <Text style={styles.dateValue}>{formatDate(date)}</Text>
      </View>
      <Pressable onPress={onNext} style={styles.iconButton}>
        <MaterialCommunityIcons color={theme.colors.text} name="chevron-right" size={24} />
      </Pressable>
      <Pressable onPress={onToday} style={styles.todayButton}>
        <Text style={styles.todayButtonText}>Today</Text>
      </Pressable>
    </View>
  );
}

function RoutineCard({ isOffDay }: { isOffDay: boolean }) {
  const sections = isOffDay
    ? [
        { title: "Build", detail: "2 hours building something useful." },
        { title: "Monetization", detail: "2 hours outreach, sales, or client work." },
        { title: "Review", detail: "1 hour review + planning." },
      ]
    : [
        { title: "Morning", detail: "5 min spending check + 20-30 min learning/research." },
        { title: "Work day", detail: "Protect energy. Capture ideas, do not overplan." },
        { title: "Night", detail: "Build or improve something, review today, write short notes." },
      ];

  return (
    <View style={styles.routineCard}>
      {sections.map((section) => (
        <View key={section.title} style={styles.routineRow}>
          <Text style={styles.routineTitle}>{section.title}</Text>
          <Text style={styles.routineText}>{section.detail}</Text>
        </View>
      ))}
    </View>
  );
}

function SuggestionCard({
  goal,
  onAdd,
  suggestion,
}: {
  goal?: Goal;
  onAdd: () => void;
  suggestion: TaskSuggestion;
}) {
  const accentColor = goal ? AREA_META[goal.targetAreaId].color : theme.colors.primary;

  return (
    <View style={styles.suggestionCard}>
      <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
        <Text style={styles.suggestionMeta}>
          {goal?.title ?? "Daily routine"} - {suggestion.timeBlock ?? "Flexible"} -{" "}
          {suggestion.priority}
        </Text>
        <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
      </View>
      <Pressable onPress={onAdd} style={styles.addChip}>
        <Text style={styles.addChipText}>Add</Text>
      </Pressable>
    </View>
  );
}

function TaskCard({
  goal,
  onComplete,
  onDelete,
  onEdit,
  onSkip,
  task,
}: {
  goal?: Goal;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSkip: () => void;
  task: Task;
}) {
  const accentColor = goal ? AREA_META[goal.targetAreaId].color : theme.colors.primary;
  const done = task.status === "DONE";
  const skipped = task.status === "SKIPPED";

  return (
    <View style={[styles.taskCard, done ? styles.taskCardDone : null]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleBlock}>
          <Text style={[styles.taskTitle, skipped ? styles.mutedText : null]}>{task.title}</Text>
          <Text style={styles.taskMeta}>
            {task.timeBlock ?? "Flexible"} - {task.priority} - {task.status}
          </Text>
          {goal ? <Text style={[styles.goalLink, { color: accentColor }]}>{goal.title}</Text> : null}
        </View>
        <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
      </View>
      {task.description ? <Text style={styles.taskBody}>{task.description}</Text> : null}
      {task.notes ? <Text style={styles.taskNotes}>{task.notes}</Text> : null}
      <View style={styles.taskActions}>
        <SmallAction label="Done" onPress={onComplete} disabled={done} />
        <SmallAction label="Skip" onPress={onSkip} disabled={skipped || done} />
        <SmallAction label="Edit" onPress={onEdit} />
        <SmallAction label="Delete" onPress={onDelete} danger />
      </View>
    </View>
  );
}

function TaskEditor({
  form,
  goals,
  mode,
  onCancel,
  onChange,
  onSave,
}: {
  form: TaskFormState;
  goals: Goal[];
  mode: TaskFormMode;
  onCancel: () => void;
  onChange: (form: TaskFormState) => void;
  onSave: () => void;
}) {
  const setValue = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <View style={styles.editorCard}>
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
        options={TIME_BLOCKS}
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
        <Pressable onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Clear</Text>
        </Pressable>
        <View style={styles.saveButtonWrap}>
          <PrimaryButton disabled={!form.title.trim()} label="Save task" onPress={onSave} />
        </View>
      </View>
    </View>
  );
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
        {options.map((option) => (
          <ChoiceChip
            active={option === selected}
            key={option}
            label={option}
            onPress={() => onSelect(option)}
          />
        ))}
      </View>
    </View>
  );
}

function ChoiceChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choiceChip, active ? styles.choiceChipActive : null]}>
      <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function SmallAction({
  danger,
  disabled,
  label,
  onPress,
}: {
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.smallAction,
        danger ? styles.smallActionDanger : null,
        disabled ? styles.smallActionDisabled : null,
      ]}
    >
      <Text style={[styles.smallActionText, danger ? styles.smallActionTextDanger : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function buildTaskSuggestions({
  date,
  goals,
  tasks,
  weeklyHabits,
}: {
  date: string;
  goals: Goal[];
  tasks: Task[];
  weeklyHabits: string[];
}) {
  const existingTitles = new Set(
    tasks.filter((task) => task.date === date).map((task) => normalizeTitle(task.title)),
  );
  const suggestions: TaskSuggestion[] = [];
  const offDay = isWeekend(date);
  const routineSuggestions: TaskSuggestion[] = offDay
    ? [
        {
          title: "2 hours build",
          description: "Use the biggest block for shipping or improving a real asset.",
          timeBlock: "Off day morning",
          durationMinutes: 120,
          priority: "HIGH",
          reason: "Off days are your best deep-work window.",
        },
        {
          title: "2 hours monetization/outreach",
          description: "Contact prospects, package an offer, or follow up.",
          timeBlock: "Off day afternoon",
          durationMinutes: 120,
          priority: "HIGH",
          reason: "Execution needs a path to income.",
        },
        {
          title: "1 hour review + planning",
          description: "Review progress and choose the next small bets.",
          timeBlock: "Off day evening",
          durationMinutes: 60,
          priority: "MEDIUM",
          reason: "Review keeps the system honest.",
        },
      ]
    : [
        {
          title: "5 min spending check",
          description: "Log spending and catch unnecessary leaks.",
          timeBlock: "7:00 AM",
          durationMinutes: 5,
          priority: "HIGH",
          reason: "Cash stability starts with daily visibility.",
        },
        {
          title: "20-30 min learning/research",
          description: "Learn one practical thing you can use soon.",
          timeBlock: "7:30 AM",
          durationMinutes: 30,
          priority: "MEDIUM",
          reason: "Morning is your cleanest learning window.",
        },
        {
          title: "Build something or improve something",
          description: "Small shipped improvement beats more planning.",
          timeBlock: "8:30 PM",
          durationMinutes: 60,
          priority: "HIGH",
          reason: "Night is your execution window after work.",
        },
      ];

  for (const suggestion of routineSuggestions) {
    pushUniqueSuggestion(suggestions, suggestion, existingTitles);
  }

  const habitSuggestion = weeklyHabits.find((habit) => !existingTitles.has(normalizeTitle(habit)));
  if (habitSuggestion) {
    pushUniqueSuggestion(
      suggestions,
      {
        title: habitSuggestion.replace(/\.$/, ""),
        description: "Daily habit from your weekly system.",
        timeBlock: offDay ? "Off day evening" : "11:30 PM",
        durationMinutes: 10,
        priority: "MEDIUM",
        reason: "Daily habits keep the base stable.",
      },
      existingTitles,
    );
  }

  const highPriorityGoals = goals
    .filter((goal) => goal.priority === "HIGH" && isActiveGoal(goal))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.title.localeCompare(b.title));

  for (const goal of highPriorityGoals) {
    const action = goal.weeklyActions.find(
      (item) => !existingTitles.has(normalizeTitle(item)) && !isWeeklyActionDone(tasks, goal.id, item),
    );

    if (!action) {
      continue;
    }

    pushUniqueSuggestion(
      suggestions,
      {
        title: action,
        description: `Weekly action for ${goal.title}.`,
        goalId: goal.id,
        timeBlock: offDay ? "Off day morning" : "9:30 PM",
        durationMinutes: 45,
        priority: goal.priority,
        reason: `High-priority goal: ${goal.title}.`,
      },
      existingTitles,
    );

    if (suggestions.length >= 5) {
      break;
    }
  }

  return suggestions.slice(0, 5);
}

function pushUniqueSuggestion(
  suggestions: TaskSuggestion[],
  suggestion: TaskSuggestion,
  existingTitles: Set<string>,
) {
  const key = normalizeTitle(suggestion.title);
  const alreadySuggested = suggestions.some((item) => normalizeTitle(item.title) === key);

  if (!existingTitles.has(key) && !alreadySuggested) {
    suggestions.push(suggestion);
  }
}

function isWeeklyActionDone(tasks: Task[], goalId: string, title: string) {
  const normalized = normalizeTitle(title);

  return tasks.some(
    (task) =>
      task.goalId === goalId && normalizeTitle(task.title) === normalized && task.status === "DONE",
  );
}

function compareTasksForDay(a: Task, b: Task) {
  const timeDelta = timeBlockRank(a.timeBlock) - timeBlockRank(b.timeBlock);
  if (timeDelta !== 0) {
    return timeDelta;
  }

  const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return a.createdAt.localeCompare(b.createdAt);
}

function timeBlockRank(value?: string) {
  if (!value) {
    return 999;
  }

  const exactIndex = TIME_BLOCKS.indexOf(value);
  if (exactIndex >= 0) {
    return exactIndex;
  }

  return 500;
}

function createEmptyTaskForm(): TaskFormState {
  return {
    title: "",
    description: "",
    goalId: undefined,
    timeBlock: "8:30 PM",
    durationMinutes: "45",
    priority: "MEDIUM",
    notes: "",
  };
}

function toOptionalNumber(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.round(parsed);
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  return getDateKey(date);
}

function isWeekend(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();

  return dayOfWeek === 0 || dayOfWeek === 6;
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(242,193,78,0.22)",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 35,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  dateCard: {
    alignItems: "center",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  dateContent: {
    flex: 1,
    minWidth: 0,
  },
  dateLabel: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dateValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  todayButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  todayButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  sectionBlock: {
    gap: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  routineCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  routineRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 4,
    paddingBottom: theme.spacing.md,
  },
  routineTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  routineText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  suggestionCard: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    gap: theme.spacing.md,
    overflow: "hidden",
    padding: theme.spacing.md,
  },
  accentLine: {
    alignSelf: "stretch",
    borderRadius: 999,
    width: 4,
  },
  suggestionContent: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  suggestionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  suggestionMeta: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  suggestionReason: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  addChip: {
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  addChipText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: "900",
  },
  taskCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
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
  statusDot: {
    borderRadius: 999,
    height: 12,
    marginTop: 5,
    width: 12,
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
  taskActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  smallAction: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  smallActionDanger: {
    borderColor: "rgba(255,125,108,0.5)",
  },
  smallActionDisabled: {
    opacity: 0.45,
  },
  smallActionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  smallActionTextDanger: {
    color: theme.colors.danger,
  },
  editorCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(98,179,255,0.3)",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
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
    backgroundColor: "rgba(242,193,78,0.16)",
  },
  choiceText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
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
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  mutedText: {
    color: theme.colors.subtle,
  },
});

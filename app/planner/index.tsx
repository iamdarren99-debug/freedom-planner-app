import { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../../src/constants/theme";
import { DateSelector } from "../../src/components/planner/DateSelector";
import { RoutineCard } from "../../src/components/planner/RoutineCard";
import { SuggestionCard } from "../../src/components/planner/SuggestionCard";
import { TaskCard } from "../../src/components/planner/TaskCard";
import {
  createEmptyTaskForm,
  TaskEditor,
  TaskFormMode,
  TaskFormState,
} from "../../src/components/planner/TaskEditor";
import { Card } from "../../src/components/ui/Card";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { useAppStore } from "../../src/store/useAppStore";
import { Task } from "../../src/types/planner";
import { addDays, isWeekend } from "../../src/utils/dateKeys";
import { getDateKey } from "../../src/utils/planning";
import { getTasksByDate } from "../../src/utils/selectors";
import {
  buildTaskSuggestions,
  compareTasksForDay,
  getTimeBlocksForDay,
  TaskSuggestion,
} from "../../src/utils/suggestions";
import { toOptionalNumber } from "../../src/utils/text";

export default function PlannerScreen() {
  const goals = useAppStore((state) => state.goals);
  const tasks = useAppStore((state) => state.tasks);
  const weeklySystem = useAppStore((state) => state.weeklySystem);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const completeTask = useAppStore((state) => state.completeTask);
  const skipTask = useAppStore((state) => state.skipTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const scrollRef = useRef<ScrollView | null>(null);

  const [selectedDate, setSelectedDate] = useState(getDateKey);
  const offDay = isWeekend(selectedDate);
  const [formMode, setFormMode] = useState<TaskFormMode>("add");
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [form, setForm] = useState<TaskFormState>(() => createEmptyTaskForm(offDay));

  const dayTasks = useMemo(
    () => getTasksByDate({ tasks }, selectedDate).sort(compareTasksForDay),
    [tasks, selectedDate],
  );
  const suggestions = useMemo(
    () =>
      buildTaskSuggestions({
        date: selectedDate,
        goals,
        tasks,
        weeklyHabits: weeklySystem.dailyHabits,
      }),
    [goals, selectedDate, tasks, weeklySystem.dailyHabits],
  );
  const timeBlocks = getTimeBlocksForDay(selectedDate);

  const resetForm = () => {
    setFormMode("add");
    setEditingTaskId(undefined);
    setForm(createEmptyTaskForm(offDay));
  };

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
      timeBlock: task.timeBlock ?? timeBlocks[0] ?? "",
      durationMinutes: task.durationMinutes ? String(task.durationMinutes) : "",
      priority: task.priority,
      notes: task.notes ?? "",
    });
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <Screen scrollRef={scrollRef}>
        <Card style={styles.hero} tone="highlight">
          <Text style={styles.eyebrow}>Daily planner</Text>
          <Text style={styles.title}>Build the day around your real routine.</Text>
          <Text style={styles.subtitle}>
            Wake 7:00-7:30 AM. Leave 8:30-9:00 AM. Home around 8:00 PM. Sleep around
            12:00 AM.
          </Text>
        </Card>

        <DateSelector
          date={selectedDate}
          onNext={() => setSelectedDate(addDays(selectedDate, 1))}
          onPrevious={() => setSelectedDate(addDays(selectedDate, -1))}
          onToday={() => setSelectedDate(getDateKey())}
        />

        <View style={styles.sectionBlock}>
          <SectionHeader
            eyebrow="Guided structure"
            title={offDay ? "Off-day plan" : "Workday plan"}
            subtitle="Use this as a container, not a cage."
          />
          <RoutineCard isOffDay={offDay} />
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
                  key={suggestion.id}
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
                  onDelete={() => deleteTask(task.id)}
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
          timeBlocks={timeBlocks}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  hero: {
    borderColor: theme.alpha.primary22,
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
  sectionBlock: {
    gap: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});

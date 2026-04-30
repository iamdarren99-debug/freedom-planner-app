import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { theme } from "../../../src/constants/theme";
import { DateSelector } from "../../../src/components/planner/DateSelector";
import { RoutineCard } from "../../../src/components/planner/RoutineCard";
import { SuggestionCard } from "../../../src/components/planner/SuggestionCard";
import { TaskCard } from "../../../src/components/planner/TaskCard";
import {
  createEmptyTaskForm,
  TaskEditor,
  TaskFormMode,
  TaskFormState,
} from "../../../src/components/planner/TaskEditor";
import { Card } from "../../../src/components/ui/Card";
import { Screen } from "../../../src/components/ui/Screen";
import { SectionHeader } from "../../../src/components/ui/SectionHeader";
import { useAppStore } from "../../../src/store/useAppStore";
import { Task } from "../../../src/types/planner";
import { addDays, isWeekend } from "../../../src/utils/dateKeys";
import { getDateKey } from "../../../src/utils/planning";
import { getTasksByDate } from "../../../src/utils/selectors";
import {
  buildTaskSuggestions,
  compareTasksForDay,
  getTimeBlocksForDay,
  TaskSuggestion,
} from "../../../src/utils/suggestions";
import { toOptionalNumber } from "../../../src/utils/text";

export default function PlannerScreen() {
  const goals = useAppStore((state) => state.goals);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const appSettings = useAppStore((state) => state.appSettings);
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
  const [routineExpanded, setRoutineExpanded] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);

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
    setEditorVisible(false);
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
    setEditorVisible(true);
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
        <DateSelector
          date={selectedDate}
          onNext={() => setSelectedDate(addDays(selectedDate, 1))}
          onPrevious={() => setSelectedDate(addDays(selectedDate, -1))}
          onToday={() => setSelectedDate(getDateKey())}
        />

        <Card style={styles.toggleCard}>
          <Pressable
            onPress={() => setRoutineExpanded((value) => !value)}
            style={styles.toggleRow}
          >
            <Text style={styles.toggleTitle}>{offDay ? "Off-day plan" : "Workday plan"}</Text>
            <Text style={styles.toggleAction}>{routineExpanded ? "Hide" : "Show"}</Text>
          </Pressable>
          {routineExpanded ? (
            <RoutineCard isOffDay={offDay} routine={appSettings.defaultRoutine} />
          ) : null}
        </Card>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Smart task suggestions" />
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
          <SectionHeader title="Daily view" />
          <View style={styles.stack}>
            {dayTasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks planned yet. Add one or use a suggestion.</Text>
            ) : (
              dayTasks.map((task) => (
                <TaskCard
                  goal={goals.find((goal) => goal.id === task.goalId)}
                  journalEntries={journalEntries.filter((entry) =>
                    entry.linkedTaskIds.includes(task.id),
                  )}
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

        <Pressable
          onPress={() => {
            if (editorVisible && formMode === "add") {
              resetForm();
              return;
            }

            setEditorVisible(true);
            requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
          }}
          style={styles.addTaskButton}
        >
          <Text style={styles.addTaskButtonText}>
            {editorVisible && formMode === "add" ? "Hide editor" : "+ Add task"}
          </Text>
        </Pressable>

        {editorVisible ? (
          <TaskEditor
            form={form}
            goals={goals}
            mode={formMode}
            onCancel={resetForm}
            onChange={setForm}
            onSave={saveTask}
            timeBlocks={timeBlocks}
          />
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  sectionBlock: {
    gap: theme.spacing.md,
  },
  toggleCard: {
    gap: theme.spacing.md,
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  toggleTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  toggleAction: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  stack: {
    gap: theme.spacing.md,
  },
  addTaskButton: {
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  addTaskButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: "900",
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});

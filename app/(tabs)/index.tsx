import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "../../src/constants/theme";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Card } from "../../src/components/ui/Card";
import { ExpandableCard } from "../../src/components/ui/ExpandableCard";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { useAppStore } from "../../src/store/useAppStore";
import { getAreaMeta } from "../../src/utils/areaMeta";
import { safeColor } from "../../src/utils/colors";
import { formatDate, getDateKey, priorityRank } from "../../src/utils/planning";
import { Goal, MindsetReminder, Task } from "../../src/types/planner";

const MOTIVATIONAL_LINE = "Focus today. Build daily. Win tomorrow.";

type ExpandableKey = "weekly" | "thirtyDay" | "mindset";

export default function DashboardScreen() {
  const router = useRouter();
  const goals = useAppStore((state) => state.goals);
  const appSettings = useAppStore((state) => state.appSettings);
  const tasks = useAppStore((state) => state.tasks);
  const weeklySystem = useAppStore((state) => state.weeklySystem);
  const thirtyDayPlan = useAppStore((state) => state.thirtyDayPlan);
  const mindsetReminders = useAppStore((state) => state.mindsetReminders);
  const completeTask = useAppStore((state) => state.completeTask);

  const [expandedCards, setExpandedCards] = useState<Record<ExpandableKey, boolean>>({
    weekly: false,
    thirtyDay: false,
    mindset: true,
  });

  const todayKey = getDateKey();
  const focusLimit = appSettings.dailyFocusLimit;
  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.date === todayKey && task.status === "TODO")
        .sort((a, b) => {
          const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
          if (priorityDelta !== 0) {
            return priorityDelta;
          }

          return a.createdAt.localeCompare(b.createdAt) || a.title.localeCompare(b.title);
        })
        .slice(0, focusLimit),
    [focusLimit, tasks, todayKey],
  );
  const dailyReminder =
    mindsetReminders[
      parseInt(todayKey.slice(-2), 10) % Math.max(mindsetReminders.length, 1)
    ];

  const toggleExpanded = (key: ExpandableKey) => {
    setExpandedCards((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Screen>
      <Text style={styles.dailyLine}>
        {formatDate(todayKey)} - {MOTIVATIONAL_LINE}
      </Text>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title="Today's Focus" />
          <Pressable
            onPress={() => router.navigate({ pathname: "/planner" })}
            style={styles.textLink}
          >
            <Text style={styles.textLinkLabel}>Planner</Text>
            <MaterialCommunityIcons
              color={theme.colors.primary}
              name="arrow-right"
              size={16}
            />
          </Pressable>
        </View>

        <View style={styles.stack}>
          {todayTasks.length === 0 ? (
            <EmptyState
              title="No focus tasks"
              description="Planner tasks for today will appear here when they are ready."
            />
          ) : (
            todayTasks.map((task, index) => (
              <TodayTaskCard
                key={task.id}
                goal={goals.find((candidate) => candidate.id === task.goalId)}
                index={index}
                onComplete={() => completeTask(task.id)}
                task={task}
              />
            ))
          )}
        </View>
      </View>

      <ExpandableCard
        accentColor={theme.colors.primary}
        expanded={expandedCards.weekly}
        eyebrow="Operating rhythm"
        onToggle={() => toggleExpanded("weekly")}
        title="Weekly System"
      >
        <RoutineSection title="Morning routine" items={weeklySystem.weekdayMorning} />
        <RoutineSection title="Night routine" items={weeklySystem.weekdayNight} />
        <RoutineSection title="Off-day structure" items={weeklySystem.offDayPlan} />
        <RoutineSection title="Daily habits" items={weeklySystem.dailyHabits} />
      </ExpandableCard>

      <ExpandableCard
        accentColor={theme.colors.accent}
        expanded={expandedCards.thirtyDay}
        eyebrow="Execution sprint"
        onToggle={() => toggleExpanded("thirtyDay")}
        title="30-Day Action Plan"
      >
        <RoutineSection title="Week 1-2" items={thirtyDayPlan.week1To2} />
        <RoutineSection title="Week 3" items={thirtyDayPlan.week3} />
        <RoutineSection title="Week 4" items={thirtyDayPlan.week4} />
        <RoutineSection title="Goal" items={thirtyDayPlan.finalGoal} />
      </ExpandableCard>

      {dailyReminder ? (
        <MindsetCard
          accentColor={mindsetAccentColor(dailyReminder)}
          expanded={expandedCards.mindset}
          onToggle={() => toggleExpanded("mindset")}
          reminder={dailyReminder}
        />
      ) : null}
    </Screen>
  );
}

function TodayTaskCard({
  goal,
  index,
  onComplete,
  task,
}: {
  goal?: Goal;
  index: number;
  onComplete: () => void;
  task: Task;
}) {
  const appSettings = useAppStore((state) => state.appSettings);
  const area = goal ? getAreaMeta(goal.targetAreaId, appSettings) : undefined;
  const accentColor = area?.color ?? safeColor(appSettings.themeAccentColor, theme.colors.primary);

  return (
    <Card style={styles.taskCard}>
      <View style={[styles.taskNumber, { borderColor: accentColor }]}>
        <Text style={[styles.taskNumberText, { color: accentColor }]}>{index + 1}</Text>
      </View>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskMeta} numberOfLines={1}>
          {goal?.title ?? "Unlinked task"} - {task.priority}
        </Text>
      </View>
      <Pressable
        android_ripple={{ color: theme.alpha.white08, borderless: false }}
        onPress={onComplete}
        style={({ pressed }) => [
          styles.completeButton,
          { backgroundColor: accentColor, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <MaterialCommunityIcons color={theme.colors.background} name="check" size={18} />
      </Pressable>
    </Card>
  );
}

function RoutineSection({ items, title }: { items: string[]; title: string }) {
  return (
    <View style={styles.routineSection}>
      <Text style={styles.routineTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.routineItem}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

function MindsetCard({
  accentColor,
  expanded,
  onToggle,
  reminder,
}: {
  accentColor: string;
  expanded: boolean;
  onToggle: () => void;
  reminder: MindsetReminder;
}) {
  return (
    <ExpandableCard
      accentColor={accentColor}
      expanded={expanded}
      eyebrow={reminder.category.replaceAll("_", " ")}
      onToggle={onToggle}
      title={reminder.title}
    >
      <Text style={styles.mindsetDescription}>{reminder.description}</Text>
    </ExpandableCard>
  );
}

function mindsetAccentColor(reminder: MindsetReminder) {
  if (reminder.category === "STOP") {
    return theme.colors.danger;
  }

  if (reminder.category === "TRUTH") {
    return theme.colors.success;
  }

  return theme.colors.primary;
}

const styles = StyleSheet.create({
  dailyLine: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionBlock: {
    gap: theme.spacing.md,
  },
  sectionHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  textLink: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  textLinkLabel: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  stack: {
    gap: theme.spacing.md,
  },
  taskCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  taskNumber: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  taskNumberText: {
    fontSize: 14,
    fontWeight: "900",
  },
  taskContent: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  taskMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  completeButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  routineSection: {
    gap: theme.spacing.xs,
  },
  routineTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  routineItem: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  mindsetDescription: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});

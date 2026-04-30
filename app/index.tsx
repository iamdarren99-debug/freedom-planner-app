import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AREA_META } from "../src/constants/app";
import { theme } from "../src/constants/theme";
import { EmptyState } from "../src/components/ui/EmptyState";
import { Card } from "../src/components/ui/Card";
import { Screen } from "../src/components/ui/Screen";
import { SectionHeader } from "../src/components/ui/SectionHeader";
import { useAppStore } from "../src/store/useAppStore";
import {
  averageProgress,
  formatDate,
  getDateKey,
  goalsByArea,
  priorityRank,
} from "../src/utils/planning";
import {
  Goal,
  MindsetReminder,
  MindsetReminderCategory,
  TargetAreaId,
  Task,
} from "../src/types/planner";

const MOTIVATIONAL_LINE = "Focus today. Build daily. Win tomorrow.";
const AREA_ORDER: TargetAreaId[] = [
  "financial",
  "career-business",
  "skills",
  "personal-relationship",
];

type ExpandableKey = "weekly" | "thirtyDay" | MindsetReminderCategory;

export default function DashboardScreen() {
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
    STOP: false,
    TRUTH: false,
    LONG_TERM_VISION: false,
  });

  const todayKey = getDateKey();
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
        .slice(0, appSettings.dailyFocusLimit),
    [appSettings.dailyFocusLimit, tasks, todayKey],
  );

  const toggleExpanded = (key: ExpandableKey) => {
    setExpandedCards((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Screen>
      <GreetingCard />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader
            eyebrow="Today"
            title="Today's Focus"
            subtitle="Keep the main thing visible. Three moves is enough."
          />
          <Link href="/planner" asChild>
            <Pressable style={styles.textLink}>
              <Text style={styles.textLinkLabel}>Planner</Text>
              <MaterialCommunityIcons
                color={theme.colors.primary}
                name="arrow-right"
                size={16}
              />
            </Pressable>
          </Link>
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

      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow="Progress"
          title="Progress Overview"
          subtitle="Each pillar gets its own signal, not a noisy scoreboard."
        />
        <View style={styles.stack}>
          {AREA_ORDER.map((areaId) => {
            const area = AREA_META[areaId];
            const areaGoals = goalsByArea(goals, areaId);

            return (
              <ProgressAreaCard
                key={areaId}
                color={area.color}
                goalCount={areaGoals.length}
                progress={averageProgress(areaGoals)}
                title={area.label}
              />
            );
          })}
        </View>
      </View>

      <ExpandableCard
        accentColor={theme.colors.primary}
        expanded={expandedCards.weekly}
        eyebrow="Operating rhythm"
        onToggle={() => toggleExpanded("weekly")}
        subtitle="Morning, night, off-day structure, and daily habits."
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
        subtitle="The short sprint that turns the plan into proof."
        title="30-Day Action Plan"
      >
        <RoutineSection title="Week 1-2" items={thirtyDayPlan.week1To2} />
        <RoutineSection title="Week 3" items={thirtyDayPlan.week3} />
        <RoutineSection title="Week 4" items={thirtyDayPlan.week4} />
        <RoutineSection title="Goal" items={thirtyDayPlan.finalGoal} />
      </ExpandableCard>

      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow="Mindset"
          title="Mindset Cards"
          subtitle="A few sharp reminders, expanded only when you need them."
        />
        <View style={styles.stack}>
          <MindsetCard
            accentColor={theme.colors.danger}
            expanded={expandedCards.STOP}
            onToggle={() => toggleExpanded("STOP")}
            reminders={mindsetReminders.filter((reminder) => reminder.category === "STOP")}
            title="What to stop"
          />
          <MindsetCard
            accentColor={theme.colors.success}
            expanded={expandedCards.TRUTH}
            onToggle={() => toggleExpanded("TRUTH")}
            reminders={mindsetReminders.filter((reminder) => reminder.category === "TRUTH")}
            title="The truth"
          />
          <MindsetCard
            accentColor={theme.colors.primary}
            expanded={expandedCards.LONG_TERM_VISION}
            onToggle={() => toggleExpanded("LONG_TERM_VISION")}
            reminders={mindsetReminders.filter(
              (reminder) => reminder.category === "LONG_TERM_VISION",
            )}
            title="Long-term vision"
          />
        </View>
      </View>
    </Screen>
  );
}

function GreetingCard() {
  return (
    <Card style={styles.hero} tone="highlight">
      <View style={styles.heroGlow} />
      <Text style={styles.eyebrow}>Command center</Text>
      <Text style={styles.heroDate}>{formatDate(getDateKey())}</Text>
      <Text style={styles.heroTitle}>{MOTIVATIONAL_LINE}</Text>
    </Card>
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
  const area = goal ? AREA_META[goal.targetAreaId] : undefined;
  const accentColor = area?.color ?? theme.colors.primary;

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

function ProgressAreaCard({
  color,
  goalCount,
  progress,
  title,
}: {
  color: string;
  goalCount: number;
  progress: number;
  title: string;
}) {
  return (
    <Card style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleRow}>
          <View style={[styles.progressDot, { backgroundColor: color }]} />
          <Text style={styles.progressTitle}>{title}</Text>
        </View>
        <Text style={styles.progressValue}>{progress}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressMeta}>{goalCount} linked goals</Text>
    </Card>
  );
}

function ExpandableCard({
  accentColor,
  children,
  expanded,
  eyebrow,
  onToggle,
  subtitle,
  title,
}: {
  accentColor: string;
  children: React.ReactNode;
  expanded: boolean;
  eyebrow: string;
  onToggle: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Card style={[styles.expandableCard, { borderColor: `${accentColor}55` }]}>
      <Pressable onPress={onToggle} style={styles.expandableHeader}>
        <View style={styles.expandableText}>
          <Text style={[styles.expandableEyebrow, { color: accentColor }]}>{eyebrow}</Text>
          <Text style={styles.expandableTitle}>{title}</Text>
          <Text style={styles.expandableSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons
          color={theme.colors.text}
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
        />
      </Pressable>
      {expanded ? <View style={styles.expandableBody}>{children}</View> : null}
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
  reminders,
  title,
}: {
  accentColor: string;
  expanded: boolean;
  onToggle: () => void;
  reminders: MindsetReminder[];
  title: string;
}) {
  const preview = reminders[0];

  return (
    <ExpandableCard
      accentColor={accentColor}
      expanded={expanded}
      eyebrow={`${reminders.length} reminders`}
      onToggle={onToggle}
      subtitle={preview?.description ?? "No reminders yet."}
      title={title}
    >
      {reminders.map((reminder) => (
        <View key={reminder.id} style={styles.mindsetItem}>
          <Text style={styles.mindsetTitle}>{reminder.title}</Text>
          <Text style={styles.mindsetDescription}>{reminder.description}</Text>
        </View>
      ))}
    </ExpandableCard>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: "relative",
    overflow: "hidden",
    gap: theme.spacing.sm,
  },
  heroGlow: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: theme.alpha.primary16,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroDate: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
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
  progressCard: {
    gap: theme.spacing.sm,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  progressTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  progressDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  progressTitle: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  progressValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  progressTrack: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  expandableCard: {
    gap: theme.spacing.md,
  },
  expandableHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  expandableText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  expandableEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  expandableTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  expandableSubtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  expandableBody: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
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
  mindsetItem: {
    gap: 4,
  },
  mindsetTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  mindsetDescription: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});

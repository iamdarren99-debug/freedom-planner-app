import { StyleSheet, Text, View } from "react-native";

import { APP_NAME, APP_TAGLINE, AREA_META } from "../src/constants/app";
import { theme } from "../src/constants/theme";
import { GoalCard } from "../src/components/cards/GoalCard";
import { StatCard } from "../src/components/cards/StatCard";
import { EmptyState } from "../src/components/ui/EmptyState";
import { FocusItemRow } from "../src/components/ui/FocusItemRow";
import { Screen } from "../src/components/ui/Screen";
import { SectionHeader } from "../src/components/ui/SectionHeader";
import { useAppStore } from "../src/store/useAppStore";
import {
  getDateKey,
  isActiveGoal,
  isFocusItemComplete,
  priorityRank,
} from "../src/utils/planning";

export default function DashboardScreen() {
  const goals = useAppStore((state) => state.goals);
  const dailyCompletions = useAppStore((state) => state.dailyCompletions);
  const mindsetReminders = useAppStore((state) => state.mindsetReminders);
  const toggleFocusItem = useAppStore((state) => state.toggleFocusItem);

  const topGoals = [...goals]
    .sort((a, b) => {
      const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return a.createdAt.localeCompare(b.createdAt) || a.title.localeCompare(b.title);
    })
    .slice(0, 3);
  const activeGoals = goals.filter(isActiveGoal);
  const dailyFocusItems = [...activeGoals]
    .sort((a, b) => {
      const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return a.createdAt.localeCompare(b.createdAt) || a.title.localeCompare(b.title);
    })
    .flatMap((goal) =>
      goal.weeklyActions.map((item) => ({
        goal,
        item,
      })),
    )
    .slice(0, 5);
  const todayCompletions = dailyCompletions[getDateKey()] ?? [];

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Command center</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>{APP_TAGLINE}</Text>
      </View>

      <View style={styles.stats}>
        <StatCard accent={theme.colors.primary} label="Total goals" value={String(goals.length)} />
        <StatCard
          accent={theme.colors.accent}
          label="Active goals"
          value={String(activeGoals.length)}
        />
        <StatCard
          accent={theme.colors.success}
          label="Completed today"
          value={String(todayCompletions.length)}
        />
      </View>

      <SectionHeader
        eyebrow="Today"
        title="Daily focus loop"
        subtitle="Check off the goal actions you actually move today."
      />
      <View style={styles.stack}>
        {activeGoals.length === 0 ? (
          <EmptyState
            title="No active goals"
            description="Active goals will show their weekly actions here."
          />
        ) : (
          dailyFocusItems.map(({ goal, item }) => {
            const area = AREA_META[goal.targetAreaId];

            return (
              <FocusItemRow
                key={`${goal.id}-${item}`}
                accentColor={area.color}
                complete={isFocusItemComplete(todayCompletions, goal.id, item)}
                goalTitle={goal.title}
                item={item}
                onPress={() => toggleFocusItem(goal.id, item)}
              />
            );
          })
        )}
      </View>

      <SectionHeader
        eyebrow="Snapshot"
        title="Target areas"
        subtitle="A quick view of the pillars in your plan."
      />
      <View style={styles.areaGrid}>
        {Object.entries(AREA_META).map(([key, area]) => {
          const areaGoals = goals.filter((goal) => goal.targetAreaId === key);

          return (
            <View key={key} style={styles.areaCard}>
              <Text style={[styles.areaName, { color: area.color }]}>{area.label}</Text>
              <Text style={styles.areaDescription}>{area.description}</Text>
              <Text style={styles.areaMeta}>{areaGoals.length} goals</Text>
            </View>
          );
        })}
      </View>

      <SectionHeader
        eyebrow="Focus"
        title="Top goals"
        subtitle="The highest-priority goals seeded from your life plan."
      />
      <View style={styles.stack}>
        {topGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </View>

      <SectionHeader
        eyebrow="Mindset"
        title="Stay honest"
        subtitle="Reminders from the plan when momentum gets noisy."
      />
      <View style={styles.stack}>
        {mindsetReminders.slice(0, 4).map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <Text style={styles.reminderCategory}>{reminder.category.replaceAll("_", " ")}</Text>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text style={styles.reminderDescription}>{reminder.description}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  stats: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  areaGrid: {
    gap: theme.spacing.md,
  },
  areaCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  areaName: {
    fontSize: 18,
    fontWeight: "800",
  },
  areaDescription: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  areaMeta: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  stack: {
    gap: theme.spacing.md,
  },
  reminderCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  reminderCategory: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  reminderTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  reminderDescription: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});

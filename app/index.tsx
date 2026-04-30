import { View, StyleSheet, Text } from "react-native";

import { APP_NAME, APP_TAGLINE, AREA_META } from "../src/constants/app";
import { theme } from "../src/constants/theme";
import { useAppStore } from "../src/store/useAppStore";
import { getDateKey, isFocusItemComplete, priorityRank } from "../src/utils/planning";
import { Screen } from "../src/components/ui/Screen";
import { SectionHeader } from "../src/components/ui/SectionHeader";
import { StatCard } from "../src/components/cards/StatCard";
import { GoalCard } from "../src/components/cards/GoalCard";
import { FocusItemRow } from "../src/components/ui/FocusItemRow";
import { EmptyState } from "../src/components/ui/EmptyState";

export default function DashboardScreen() {
  const goals = useAppStore((state) => state.goals);
  const dailyCompletions = useAppStore((state) => state.dailyCompletions);
  const toggleFocusItem = useAppStore((state) => state.toggleFocusItem);

  const topGoals = [...goals]
    .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    .slice(0, 3);
  const activeGoals = goals.filter((goal) => goal.status !== "planned");
  const todayCompletions = dailyCompletions[getDateKey()] ?? [];

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Phase 0</Text>
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
        subtitle="Check off the weekly focus items you actually move today."
      />
      <View style={styles.stack}>
        {activeGoals.length === 0 ? (
          <EmptyState
            title="No active goals"
            description="Activate a goal first, then its weekly focus items can become daily execution steps."
          />
        ) : (
          activeGoals.flatMap((goal) => {
            const area = AREA_META[goal.area];

            return goal.weeklyFocus.map((item) => (
              <FocusItemRow
                key={`${goal.id}-${item}`}
                accentColor={area.color}
                complete={isFocusItemComplete(todayCompletions, goal.id, item)}
                goalTitle={goal.title}
                item={item}
                onPress={() => toggleFocusItem(goal.id, item)}
              />
            ));
          })
        )}
      </View>

      <SectionHeader
        eyebrow="Snapshot"
        title="Target areas"
        subtitle="A light command-center overview of the main pillars in your plan."
      />
      <View style={styles.areaGrid}>
        {Object.entries(AREA_META).map(([key, area]) => {
          const areaGoals = goals.filter((goal) => goal.area === key);

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
        subtitle="These cards prove the structure is working before we add more advanced features."
      />
      <View style={styles.stack}>
        {topGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
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
});

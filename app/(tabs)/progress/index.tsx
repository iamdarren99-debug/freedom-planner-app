import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AREA_ORDER } from "../../../src/constants/app";
import { theme } from "../../../src/constants/theme";
import { Card } from "../../../src/components/ui/Card";
import { ExpandableCard } from "../../../src/components/ui/ExpandableCard";
import { Screen } from "../../../src/components/ui/Screen";
import { SectionHeader } from "../../../src/components/ui/SectionHeader";
import { GoalProgressGroup } from "../../../src/components/progress/GoalProgressGroup";
import { MetricCard } from "../../../src/components/progress/MetricCard";
import { ProgressBarRow } from "../../../src/components/progress/ProgressBarRow";
import { ReviewCard } from "../../../src/components/progress/ReviewCard";
import { useAppStore } from "../../../src/store/useAppStore";
import { getAreaMeta } from "../../../src/utils/areaMeta";
import {
  averageProgress,
  formatDate,
  goalsByArea,
  isActiveGoal,
} from "../../../src/utils/planning";
import {
  buildBusinessStats,
  buildPersonalStats,
  buildSkillsStats,
  buildWeeklyStats,
} from "../../../src/utils/progressMetrics";
import { buildMonthlyReview, buildWeeklyReview } from "../../../src/utils/reviewMetrics";

export default function ProgressScreen() {
  const router = useRouter();
  const goals = useAppStore((state) => state.goals);
  const appSettings = useAppStore((state) => state.appSettings);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const progressLogs = useAppStore((state) => state.progressLogs);
  const tasks = useAppStore((state) => state.tasks);

  const [expandedAreas, setExpandedAreas] = useState({
    career: false,
    personal: false,
    skills: false,
  });

  const weeklyStats = useMemo(() => buildWeeklyStats(tasks), [tasks]);
  const businessStats = useMemo(() => buildBusinessStats(tasks, goals), [goals, tasks]);
  const skillsStats = useMemo(() => buildSkillsStats(tasks, goals), [goals, tasks]);
  const personalStats = useMemo(
    () => buildPersonalStats(tasks, goals, journalEntries),
    [goals, journalEntries, tasks],
  );
  const weeklyReview = useMemo(
    () => buildWeeklyReview({ goals, journalEntries, progressLogs, tasks }),
    [goals, journalEntries, progressLogs, tasks],
  );
  const monthlyReview = useMemo(
    () => buildMonthlyReview({ goals, journalEntries, progressLogs, tasks }),
    [goals, journalEntries, progressLogs, tasks],
  );
  const recentProgressLogs = useMemo(
    () =>
      [...progressLogs]
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.id.localeCompare(a.id),
        )
        .slice(0, 6),
    [progressLogs],
  );

  const toggleArea = (key: keyof typeof expandedAreas) => {
    setExpandedAreas((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Screen>
        <SectionHeader title="Overall Progress" />
        <View style={styles.grid}>
          <MetricCard label="Active goals" value={goals.filter(isActiveGoal).length} />
          <MetricCard label="Done this week" value={weeklyStats.completedTasks} />
          <MetricCard label="Current streak" value={`${weeklyStats.currentStreak}d`} />
          <MetricCard label="Consistency" value={`${weeklyStats.consistencyScore}%`} />
        </View>

        <View style={styles.stack}>
          {AREA_ORDER.map((areaId) => {
            const area = getAreaMeta(areaId, appSettings);
            const progress = averageProgress(goalsByArea(goals, areaId));

            return (
              <ProgressBarRow
                color={area.color}
                key={areaId}
                label={area.label}
                value={progress}
              />
            );
          })}
        </View>

        <SectionHeader title="Weekly Review" />
        <ReviewCard rows={weeklyReview} title="This week" />

        <SectionHeader title="Monthly Review" />
        <ReviewCard rows={monthlyReview} title="This month" />

        <Card style={styles.logShortcutCard}>
          <View style={styles.logShortcutText}>
            <Text style={styles.logShortcutTitle}>Manual progress log</Text>
            <Text style={styles.logShortcutBody}>
              Add a goal update with a value, date, and note.
            </Text>
          </View>
          <Pressable
            android_ripple={{ color: theme.alpha.white08 }}
            onPress={() => router.push({ pathname: "/progress/log" })}
            style={styles.logShortcutButton}
          >
            <Text style={styles.logShortcutButtonText}>Open</Text>
            <MaterialCommunityIcons
              color={theme.colors.background}
              name="arrow-right"
              size={16}
            />
          </Pressable>
        </Card>

        <SectionHeader title="Financial Progress" />
        <GoalProgressGroup
          appSettings={appSettings}
          goals={goalsByArea(goals, "financial")}
          logs={progressLogs}
          goalIds={["cash-stability", "savings-growth", "debt-freedom"]}
        />

        <ExpandableCard
          accentColor={getAreaMeta("career-business", appSettings).color}
          expanded={expandedAreas.career}
          onToggle={() => toggleArea("career")}
          title="Career / Business Progress"
        >
          <View style={styles.grid}>
            <MetricCard label="Area progress" value={`${businessStats.areaProgress}%`} />
            <MetricCard label="Completed tasks" value={businessStats.completedTasks} />
            <MetricCard label="Active goals" value={businessStats.activeGoals} />
            <MetricCard label="Side income" value={`${businessStats.sideIncomeProgress}%`} />
          </View>
        </ExpandableCard>

        <ExpandableCard
          accentColor={getAreaMeta("skills", appSettings).color}
          expanded={expandedAreas.skills}
          onToggle={() => toggleArea("skills")}
          title="Skills Progress"
        >
          <View style={styles.grid}>
            <MetricCard label="Area progress" value={`${skillsStats.areaProgress}%`} />
            <MetricCard label="Completed tasks" value={skillsStats.completedTasks} />
            <MetricCard label="Business knowledge" value={`${skillsStats.businessKnowledge}%`} />
            <MetricCard label="Execution speed" value={`${skillsStats.executionSpeed}%`} />
          </View>
        </ExpandableCard>

        <ExpandableCard
          accentColor={getAreaMeta("personal-relationship", appSettings).color}
          expanded={expandedAreas.personal}
          onToggle={() => toggleArea("personal")}
          title="Personal / Relationship Progress"
        >
          <View style={styles.grid}>
            <MetricCard label="Area progress" value={`${personalStats.areaProgress}%`} />
            <MetricCard label="Completed tasks" value={personalStats.completedTasks} />
            <MetricCard label="Relationship" value={`${personalStats.relationshipProgress}%`} />
            <MetricCard label="Reflection score" value={`${personalStats.reflectionScore}%`} />
          </View>
        </ExpandableCard>

        <SectionHeader title="Recent progress logs" />
        <View style={styles.stack}>
          {recentProgressLogs.map((log) => {
            const goal = goals.find((item) => item.id === log.goalId);

            return (
              <Card key={log.id} style={styles.logCard}>
                <Text style={styles.logTitle}>{goal?.title ?? "Goal update"}</Text>
                <Text style={styles.logMeta}>
                  {formatDate(log.date)} - {log.value}%
                </Text>
                {log.note ? <Text style={styles.logNote}>{log.note}</Text> : null}
              </Card>
            );
          })}
        </View>
      </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  logShortcutCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  logShortcutText: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  logShortcutTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  logShortcutBody: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  logShortcutButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  logShortcutButtonText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: "900",
  },
  logCard: {
    gap: theme.spacing.xs,
  },
  logTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  logMeta: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  logNote: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});

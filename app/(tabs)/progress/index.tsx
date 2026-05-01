import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { theme } from "../../../src/constants/theme";
import { PrimaryButton } from "../../../src/components/forms/PrimaryButton";
import { TextField } from "../../../src/components/forms/TextField";
import { ChoiceChip } from "../../../src/components/forms/ChoiceChip";
import { Card } from "../../../src/components/ui/Card";
import { ExpandableCard } from "../../../src/components/ui/ExpandableCard";
import { Screen } from "../../../src/components/ui/Screen";
import { SectionHeader } from "../../../src/components/ui/SectionHeader";
import { GoalProgressGroup } from "../../../src/components/progress/GoalProgressGroup";
import { MetricCard } from "../../../src/components/progress/MetricCard";
import { ProgressBarRow } from "../../../src/components/progress/ProgressBarRow";
import { ReviewCard } from "../../../src/components/progress/ReviewCard";
import { useAppStore } from "../../../src/store/useAppStore";
import { TargetAreaId } from "../../../src/types/planner";
import { getAreaMeta } from "../../../src/utils/areaMeta";
import {
  averageProgress,
  formatDate,
  getDateKey,
  goalsByArea,
  isActiveGoal,
} from "../../../src/utils/planning";
import {
  buildBusinessStats,
  buildPersonalStats,
  buildSkillsStats,
  buildWeeklyStats,
  clampPercent,
  isValidDateKey,
} from "../../../src/utils/progressMetrics";
import { buildMonthlyReview, buildWeeklyReview } from "../../../src/utils/reviewMetrics";

const AREA_ORDER: TargetAreaId[] = [
  "financial",
  "career-business",
  "skills",
  "personal-relationship",
];

export default function ProgressScreen() {
  const goals = useAppStore((state) => state.goals);
  const appSettings = useAppStore((state) => state.appSettings);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const progressLogs = useAppStore((state) => state.progressLogs);
  const tasks = useAppStore((state) => state.tasks);
  const updateGoalProgress = useAppStore((state) => state.updateGoalProgress);

  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id ?? "");
  const [logDate, setLogDate] = useState(getDateKey);
  const [logNote, setLogNote] = useState("");
  const [logValue, setLogValue] = useState("");
  const [expandedAreas, setExpandedAreas] = useState({
    career: false,
    personal: false,
    skills: false,
  });
  const [logFeedback, setLogFeedback] = useState("");

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

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0];
  const hasLogValue = logValue.trim().length > 0 && !Number.isNaN(Number(logValue));
  const normalizedLogDate = logDate.trim();
  const hasValidLogDate = isValidDateKey(normalizedLogDate);
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

  useEffect(() => {
    if (!logFeedback) {
      return undefined;
    }

    const timeout = setTimeout(() => setLogFeedback(""), 1800);
    return () => clearTimeout(timeout);
  }, [logFeedback]);

  const saveLog = () => {
    const value = clampPercent(Number(logValue));

    if (!selectedGoal || !hasLogValue || !hasValidLogDate) {
      return;
    }

    updateGoalProgress(selectedGoal.id, value, logNote.trim() || undefined, normalizedLogDate);
    setLogValue("");
    setLogNote("");
    setLogFeedback("Logged");
  };

  const toggleArea = (key: keyof typeof expandedAreas) => {
    setExpandedAreas((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : undefined}
      style={styles.keyboardAvoidingView}
    >
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

        <SectionHeader title="Manual progress log" />
        <Card style={styles.formCard}>
          <Text style={styles.fieldLabel}>Goal</Text>
          {AREA_ORDER.map((areaId) => {
            const area = getAreaMeta(areaId, appSettings);
            const areaGoals = goalsByArea(goals, areaId);

            return (
              <View key={areaId} style={styles.goalGroup}>
                <Text style={[styles.goalGroupLabel, { color: area.color }]}>{area.label}</Text>
                <View style={styles.chipRow}>
                  {areaGoals.map((goal) => (
                    <ChoiceChip
                      active={(selectedGoal?.id ?? selectedGoalId) === goal.id}
                      key={goal.id}
                      label={goal.title}
                      onPress={() => setSelectedGoalId(goal.id)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <TextField
                keyboardType="number-pad"
                label="Value"
                onChangeText={setLogValue}
                placeholder="0-100"
                value={logValue}
              />
            </View>
            <View style={styles.formField}>
              <TextField
                label="Date"
                onChangeText={setLogDate}
                placeholder="YYYY-MM-DD"
                value={logDate}
              />
            </View>
          </View>
          {hasValidLogDate ? null : (
            <Text style={styles.errorText}>Use a valid date in YYYY-MM-DD format.</Text>
          )}
          <TextField
            label="Note"
            multiline
            onChangeText={setLogNote}
            placeholder="What moved?"
            value={logNote}
          />
          <PrimaryButton
            disabled={!selectedGoal || !hasLogValue || !hasValidLogDate}
            label="Add progress log"
            onPress={saveLog}
          />
          {logFeedback ? <Text style={styles.successText}>{logFeedback}</Text> : null}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  formCard: {
    gap: theme.spacing.md,
  },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  goalGroup: {
    gap: theme.spacing.sm,
  },
  goalGroupLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  formRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  formField: {
    flex: 1,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },
  successText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
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

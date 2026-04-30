import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { theme } from "../../../src/constants/theme";
import { PrimaryButton } from "../../../src/components/forms/PrimaryButton";
import { TextField } from "../../../src/components/forms/TextField";
import { ChoiceChip } from "../../../src/components/forms/ChoiceChip";
import { Card } from "../../../src/components/ui/Card";
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
  const addProgressLog = useAppStore((state) => state.addProgressLog);

  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id ?? "");
  const [logDate, setLogDate] = useState(getDateKey);
  const [logNote, setLogNote] = useState("");
  const [logValue, setLogValue] = useState("");

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

  const saveLog = () => {
    const value = clampPercent(Number(logValue));

    if (!selectedGoal || !hasLogValue) {
      return;
    }

    addProgressLog({
      goalId: selectedGoal.id,
      date: logDate.trim() || getDateKey(),
      value,
      note: logNote.trim() || undefined,
    });
    setLogValue("");
    setLogNote("");
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
          <View style={styles.chipRow}>
            {goals.map((goal) => (
              <ChoiceChip
                active={(selectedGoal?.id ?? selectedGoalId) === goal.id}
                key={goal.id}
                label={goal.title}
                onPress={() => setSelectedGoalId(goal.id)}
              />
            ))}
          </View>
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
              <TextField label="Date" onChangeText={setLogDate} value={logDate} />
            </View>
          </View>
          <TextField
            label="Note"
            multiline
            onChangeText={setLogNote}
            placeholder="What moved?"
            value={logNote}
          />
          <PrimaryButton
            disabled={!selectedGoal || !hasLogValue}
            label="Add progress log"
            onPress={saveLog}
          />
        </Card>

        <SectionHeader title="Financial Progress" />
        <GoalProgressGroup
          appSettings={appSettings}
          goals={goalsByArea(goals, "financial")}
          logs={progressLogs}
          titles={["Cash Stability", "Savings Growth", "Debt Freedom"]}
        />

        <SectionHeader title="Career / Business Progress" />
        <View style={styles.grid}>
          <MetricCard label="Tools built" value={businessStats.toolsBuilt} />
          <MetricCard label="Outreach count" value={businessStats.outreachCount} />
          <MetricCard label="Paying clients" value={businessStats.payingClients} />
          <MetricCard label="Side income" value={`${businessStats.sideIncomeProgress}%`} />
        </View>

        <SectionHeader title="Skills Progress" />
        <View style={styles.grid}>
          <MetricCard label="AI builds" value={skillsStats.aiBuilds} />
          <MetricCard label="Study hours" value={skillsStats.studyHours} />
          <MetricCard label="Business knowledge" value={`${skillsStats.businessKnowledge}%`} />
          <MetricCard label="Execution speed" value={`${skillsStats.executionSpeed}%`} />
        </View>

        <SectionHeader title="Personal / Relationship Progress" />
        <View style={styles.grid}>
          <MetricCard label="Quality sessions" value={personalStats.qualitySessions} />
          <MetricCard label="Travel planning" value={personalStats.travelPlanning} />
          <MetricCard label="Reflection score" value={`${personalStats.reflectionScore}%`} />
        </View>

        <SectionHeader title="Recent progress logs" />
        <View style={styles.stack}>
          {progressLogs.slice(0, 6).map((log) => {
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
  formRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  formField: {
    flex: 1,
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

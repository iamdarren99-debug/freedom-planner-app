import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AREA_ORDER } from "../../constants/app";
import { theme } from "../../constants/theme";
import { ChoiceChip } from "../forms/ChoiceChip";
import { PrimaryButton } from "../forms/PrimaryButton";
import { TextField } from "../forms/TextField";
import { Card } from "../ui/Card";
import { useAppStore } from "../../store/useAppStore";
import { getAreaMeta } from "../../utils/areaMeta";
import { getDateKey, goalsByArea } from "../../utils/planning";
import { clampPercent, isValidDateKey } from "../../utils/progressMetrics";

export function ManualProgressLogForm() {
  const appSettings = useAppStore((state) => state.appSettings);
  const goals = useAppStore((state) => state.goals);
  const updateGoalProgress = useAppStore((state) => state.updateGoalProgress);

  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id ?? "");
  const [logDate, setLogDate] = useState(getDateKey);
  const [logNote, setLogNote] = useState("");
  const [logValue, setLogValue] = useState("");
  const [logFeedback, setLogFeedback] = useState("");

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0];
  const hasLogValue = logValue.trim().length > 0 && !Number.isNaN(Number(logValue));
  const normalizedLogDate = logDate.trim();
  const hasValidLogDate = isValidDateKey(normalizedLogDate);

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

  return (
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
  );
}

const styles = StyleSheet.create({
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
});

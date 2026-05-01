import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Goal } from "../../types/planner";
import { getAreaMeta } from "../../utils/areaMeta";
import { safeColor } from "../../utils/colors";
import { TaskSuggestion } from "../../utils/suggestions";
import { useAppStore } from "../../store/useAppStore";
import { Card } from "../ui/Card";

interface SuggestionCardProps {
  goal?: Goal;
  onAdd: () => void;
  suggestion: TaskSuggestion;
}

export function SuggestionCard({ goal, onAdd, suggestion }: SuggestionCardProps) {
  const appSettings = useAppStore((state) => state.appSettings);
  const accentColor = goal
    ? getAreaMeta(goal.targetAreaId, appSettings).color
    : safeColor(appSettings.themeAccentColor, theme.colors.primary);

  return (
    <Card accent={accentColor} style={styles.suggestionCard}>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
        <Text style={styles.suggestionMeta}>
          {goal?.title ?? "Daily routine"} - {suggestion.timeBlock ?? "Flexible"} -{" "}
          {suggestion.priority}
        </Text>
        <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
      </View>
      <Pressable onPress={onAdd} style={styles.addChip}>
        <Text style={styles.addChipText}>Add</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  suggestionCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    overflow: "hidden",
    padding: theme.spacing.md,
  },
  suggestionContent: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  suggestionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  suggestionMeta: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  suggestionReason: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  addChip: {
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  addChipText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: "900",
  },
});

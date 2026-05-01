import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "../../constants/theme";
import { formatDate, getDateKey } from "../../utils/planning";
import { Card } from "../ui/Card";

interface DateSelectorProps {
  date: string;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
}

export function DateSelector({ date, onNext, onPrevious, onToday }: DateSelectorProps) {
  return (
    <Card style={styles.dateCard}>
      <Pressable onPress={onPrevious} style={styles.iconButton}>
        <MaterialCommunityIcons color={theme.colors.text} name="chevron-left" size={24} />
      </Pressable>
      <View style={styles.dateContent}>
        <Text style={styles.dateLabel}>{date === getDateKey() ? "Today" : "Selected day"}</Text>
        <Text style={styles.dateValue}>{formatDate(date)}</Text>
      </View>
      <Pressable onPress={onNext} style={styles.iconButton}>
        <MaterialCommunityIcons color={theme.colors.text} name="chevron-right" size={24} />
      </Pressable>
      <Pressable onPress={onToday} style={styles.todayButton}>
        <Text style={styles.todayButtonText}>Today</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  dateCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  dateContent: {
    flex: 1,
    minWidth: 0,
  },
  dateLabel: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dateValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  todayButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  todayButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
});

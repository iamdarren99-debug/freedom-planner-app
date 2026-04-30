import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Goal } from "../../types/planner";
import { addDays } from "../../utils/dateKeys";
import { ChoiceChip } from "../forms/ChoiceChip";
import { TextField } from "../forms/TextField";
import { DateSelector } from "../planner/DateSelector";
import { Card } from "../ui/Card";

interface JournalFiltersProps {
  date: string;
  goals: Goal[];
  goalId?: string;
  onDateChange: (date: string) => void;
  onGoalChange: (goalId?: string) => void;
  onSearchChange: (query: string) => void;
  onShowAllDatesChange: (value: boolean) => void;
  onToday: () => void;
  query: string;
  showAllDates: boolean;
}

export function JournalFilters({
  date,
  goals,
  goalId,
  onDateChange,
  onGoalChange,
  onSearchChange,
  onShowAllDatesChange,
  onToday,
  query,
  showAllDates,
}: JournalFiltersProps) {
  return (
    <Card style={styles.panel}>
      <DateSelector
        date={date}
        onNext={() => onDateChange(addDays(date, 1))}
        onPrevious={() => onDateChange(addDays(date, -1))}
        onToday={onToday}
      />
      <TextField
        label="Search"
        onChangeText={onSearchChange}
        placeholder="Search title, content, mood, or reflection"
        value={query}
      />
      <View style={styles.group}>
        <Text style={styles.label}>Date range</Text>
        <View style={styles.chipRow}>
          <ChoiceChip
            active={!showAllDates}
            label="Selected date"
            onPress={() => onShowAllDatesChange(false)}
          />
          <ChoiceChip
            active={showAllDates}
            label="All dates"
            onPress={() => onShowAllDatesChange(true)}
          />
        </View>
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>Goal filter</Text>
        <View style={styles.chipRow}>
          <ChoiceChip active={!goalId} label="All goals" onPress={() => onGoalChange(undefined)} />
          {goals.map((goal) => (
            <ChoiceChip
              active={goalId === goal.id}
              key={goal.id}
              label={goal.title}
              onPress={() => onGoalChange(goalId === goal.id ? undefined : goal.id)}
            />
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: theme.spacing.md,
  },
  group: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});

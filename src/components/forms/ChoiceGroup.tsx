import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { ChoiceChip } from "./ChoiceChip";

interface ChoiceGroupProps<T extends string> {
  label: string;
  onSelect: (value: T) => void;
  options: T[];
  selected: T;
}

export function ChoiceGroup<T extends string>({
  label,
  onSelect,
  options,
  selected,
}: ChoiceGroupProps<T>) {
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => (
          <ChoiceChip
            active={option === selected}
            key={option}
            label={option}
            onPress={() => onSelect(option)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  choiceGroup: {
    gap: theme.spacing.xs,
  },
  choiceLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
});

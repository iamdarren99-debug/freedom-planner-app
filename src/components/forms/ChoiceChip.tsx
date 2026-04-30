import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../../constants/theme";

interface ChoiceChipProps {
  active: boolean;
  label: string;
  onPress: () => void;
}

export function ChoiceChip({ active, label, onPress }: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choiceChip, active ? styles.choiceChipActive : null]}
    >
      <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choiceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  choiceChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.alpha.primary16,
  },
  choiceText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  choiceTextActive: {
    color: theme.colors.text,
  },
});

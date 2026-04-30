import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../../constants/theme";

interface SmallActionProps {
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
}

export function SmallAction({ danger, disabled, label, onPress }: SmallActionProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.smallAction,
        danger ? styles.smallActionDanger : null,
        disabled ? styles.smallActionDisabled : null,
      ]}
    >
      <Text style={[styles.smallActionText, danger ? styles.smallActionTextDanger : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  smallAction: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  smallActionDanger: {
    borderColor: theme.alpha.danger50,
  },
  smallActionDisabled: {
    opacity: 0.45,
  },
  smallActionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  smallActionTextDanger: {
    color: theme.colors.danger,
  },
});

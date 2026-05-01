import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../../constants/theme";
import { useAppStore } from "../../store/useAppStore";
import { safeColor } from "../../utils/colors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  const accentColor = useAppStore((state) => state.appSettings.themeAccentColor);
  const buttonColor = safeColor(accentColor, theme.colors.primary);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: buttonColor,
          opacity: pressed ? 0.94 : disabled ? 0.6 : 1,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    minHeight: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  label: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
});

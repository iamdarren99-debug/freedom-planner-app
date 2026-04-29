import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { theme } from "../../constants/theme";

interface TextFieldProps extends TextInputProps {
  label: string;
}

export function TextField({ label, multiline, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={theme.colors.subtle}
        style={[styles.input, multiline ? styles.multiline : null, style]}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    color: theme.colors.text,
    fontSize: 14,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  multiline: {
    minHeight: 120,
  },
});

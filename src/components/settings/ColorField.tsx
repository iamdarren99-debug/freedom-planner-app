import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { theme } from "../../constants/theme";
import { isValidColor } from "../../utils/colors";
import { TextField } from "../forms/TextField";

interface ColorFieldProps {
  label: string;
  onCommit: (value: string | undefined) => void;
  placeholder?: string;
  value: string | undefined;
}

export function ColorField({ label, onCommit, placeholder, value }: ColorFieldProps) {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      setError("");
      onCommit(undefined);
      return;
    }

    if (!isValidColor(trimmed)) {
      setError("Enter a valid color name, hex value, rgb, or rgba.");
      return;
    }

    setError("");
    onCommit(trimmed);
  };

  return (
    <>
      <TextField
        autoCapitalize="none"
        label={label}
        onBlur={commit}
        onChangeText={(text) => {
          setDraft(text);
          setError("");
        }}
        placeholder={placeholder}
        value={draft}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },
});

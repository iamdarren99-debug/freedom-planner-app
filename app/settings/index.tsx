import { StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "../../src/constants/app";
import { theme } from "../../src/constants/theme";
import { useAppStore } from "../../src/store/useAppStore";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { PrimaryButton } from "../../src/components/forms/PrimaryButton";

export default function SettingsScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const resetDemoData = useAppStore((state) => state.resetDemoData);

  return (
    <Screen>
      <SectionHeader
        eyebrow="Settings"
        title="Base app settings"
        subtitle="This screen confirms the project is ready for future preferences and sync controls."
      />

      <View style={styles.card}>
        <Text style={styles.label}>Theme</Text>
        <Text style={styles.value}>{themeMode}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Storage mode</Text>
        <Text style={styles.value}>Local-first with AsyncStorage</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>App name</Text>
        <Text style={styles.value}>{APP_NAME}</Text>
      </View>

      <PrimaryButton label="Reset demo data" onPress={resetDemoData} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  value: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});

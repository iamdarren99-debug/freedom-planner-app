import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "../src/constants/app";
import { theme } from "../src/constants/theme";
import { useAppStore } from "../src/store/useAppStore";
import { Screen } from "../src/components/ui/Screen";
import { SectionHeader } from "../src/components/ui/SectionHeader";
import { PrimaryButton } from "../src/components/forms/PrimaryButton";
import { Card } from "../src/components/ui/Card";

export default function SettingsScreen() {
  const appSettings = useAppStore((state) => state.appSettings);
  const updateAppSettings = useAppStore((state) => state.updateAppSettings);
  const resetToSeedData = useAppStore((state) => state.resetToSeedData);
  const updateDailyFocusLimit = (delta: number) => {
    updateAppSettings({
      dailyFocusLimit: Math.min(5, Math.max(1, appSettings.dailyFocusLimit + delta)),
    });
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset all data?",
      "This restores the seeded plan and clears local journal entries, task progress, and daily completions.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetToSeedData },
      ],
    );
  };

  return (
    <Screen>
      <SectionHeader
        title="App settings"
      />

      <Card style={styles.card}>
        <Text style={styles.label}>Daily focus limit</Text>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => updateDailyFocusLimit(-1)}
            style={styles.stepperButton}
          >
            <Text style={styles.stepperButtonText}>-</Text>
          </Pressable>
          <Text style={styles.value}>{appSettings.dailyFocusLimit} actions</Text>
          <Pressable onPress={() => updateDailyFocusLimit(1)} style={styles.stepperButton}>
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>App name</Text>
        <Text style={styles.value}>{APP_NAME}</Text>
      </Card>

      <PrimaryButton label="Reset to seed data" onPress={confirmReset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
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
  stepperRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  stepperButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  stepperButtonText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
});

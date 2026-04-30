import { Stack } from "expo-router";

import { theme } from "../../../src/constants/theme";
import { SettingsHeaderButton } from "../../../src/components/ui/SettingsHeaderButton";

export default function GoalsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "700",
        },
        headerRight: () => <SettingsHeaderButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Goals" }} />
      <Stack.Screen name="[id]" options={{ title: "Goal Details" }} />
    </Stack>
  );
}

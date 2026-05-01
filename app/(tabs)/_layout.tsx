import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../../src/constants/theme";
import { SettingsHeaderButton } from "../../src/components/ui/SettingsHeaderButton";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
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
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 68 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subtle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="view-dashboard-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="target" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner/index"
        options={{
          title: "Planner",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="calendar-check-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal/index"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="notebook-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress/index"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="chart-line" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress/log"
        options={{
          href: null,
          title: "Manual progress log",
        }}
      />
    </Tabs>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useHydrated } from "../src/hooks/useHydrated";
import { theme } from "../src/constants/theme";

export default function RootLayout() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading base app...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "700",
          },
          sceneStyle: {
            backgroundColor: theme.colors.background,
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 78,
            paddingTop: 6,
            paddingBottom: 10,
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
            headerShown: false,
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
          name="planner"
          options={{
            title: "Planner",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons color={color} name="calendar-check-outline" size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: "Journal",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons color={color} name="notebook-outline" size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons color={color} name="chart-box-outline" size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons color={color} name="cog-outline" size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="goals/[id]"
          options={{
            href: null,
            title: "Goal Details",
            headerShown: true,
            tabBarStyle: {
              display: "none",
            },
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
});

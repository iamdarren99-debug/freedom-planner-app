import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "../src/constants/app";
import { theme } from "../src/constants/theme";
import { PrimaryButton } from "../src/components/forms/PrimaryButton";
import { SmallAction } from "../src/components/forms/SmallAction";
import { TextField } from "../src/components/forms/TextField";
import { Card } from "../src/components/ui/Card";
import { Screen } from "../src/components/ui/Screen";
import { SectionHeader } from "../src/components/ui/SectionHeader";
import { ListEditor, PlanEditor } from "../src/components/settings/ListEditor";
import { useAppStore } from "../src/store/useAppStore";
import {
  DefaultRoutine,
  MindsetReminderCategory,
  TargetAreaId,
} from "../src/types/planner";
import { getAreaMeta } from "../src/utils/areaMeta";

const AREA_ORDER: TargetAreaId[] = [
  "financial",
  "career-business",
  "skills",
  "personal-relationship",
];
const REMINDER_CATEGORIES: MindsetReminderCategory[] = ["STOP", "TRUTH", "LONG_TERM_VISION"];

export default function SettingsScreen() {
  const appSettings = useAppStore((state) => state.appSettings);
  const goals = useAppStore((state) => state.goals);
  const mindsetReminders = useAppStore((state) => state.mindsetReminders);
  const thirtyDayPlan = useAppStore((state) => state.thirtyDayPlan);
  const weeklySystem = useAppStore((state) => state.weeklySystem);
  const addMindsetReminder = useAppStore((state) => state.addMindsetReminder);
  const deleteMindsetReminder = useAppStore((state) => state.deleteMindsetReminder);
  const importAppData = useAppStore((state) => state.importAppData);
  const resetToSeedData = useAppStore((state) => state.resetToSeedData);
  const updateAppSettings = useAppStore((state) => state.updateAppSettings);
  const updateMindsetReminder = useAppStore((state) => state.updateMindsetReminder);
  const updateThirtyDayPlan = useAppStore((state) => state.updateThirtyDayPlan);
  const updateWeeklySystem = useAppStore((state) => state.updateWeeklySystem);

  const [exportJson, setExportJson] = useState("");
  const [importJson, setImportJson] = useState("");
  const [newReminderCategory, setNewReminderCategory] =
    useState<MindsetReminderCategory>("STOP");
  const [newReminderDescription, setNewReminderDescription] = useState("");
  const [newReminderTitle, setNewReminderTitle] = useState("");

  const updateDailyFocusLimit = (delta: number) => {
    updateAppSettings({
      dailyFocusLimit: Math.min(5, Math.max(1, appSettings.dailyFocusLimit + delta)),
    });
  };

  const updateRoutine = (updates: Partial<DefaultRoutine>) => {
    updateAppSettings({
      defaultRoutine: {
        ...defaultRoutine,
        ...updates,
      },
    });
  };

  const updateTargetArea = (
    areaId: TargetAreaId,
    updates: Partial<NonNullable<typeof appSettings.targetAreaOverrides>[TargetAreaId]>,
  ) => {
    updateAppSettings({
      targetAreaOverrides: {
        ...appSettings.targetAreaOverrides,
        [areaId]: {
          ...appSettings.targetAreaOverrides?.[areaId],
          ...updates,
        },
      },
    });
  };

  const defaultRoutine = appSettings.defaultRoutine ?? {
    workdayMorning: "",
    workdayWork: "",
    workdayNight: "",
    offDayBuild: "",
    offDayMonetization: "",
    offDayReview: "",
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

  const createExport = () => {
    const state = useAppStore.getState();
    setExportJson(
      JSON.stringify(
        {
          targetAreas: state.targetAreas,
          goals: state.goals,
          tasks: state.tasks,
          journalEntries: state.journalEntries,
          progressLogs: state.progressLogs,
          weeklySystem: state.weeklySystem,
          thirtyDayPlan: state.thirtyDayPlan,
          mindsetReminders: state.mindsetReminders,
          appSettings: state.appSettings,
          dailyCompletions: state.dailyCompletions,
        },
        null,
        2,
      ),
    );
  };

  const confirmImport = () => {
    Alert.alert("Import local data?", "This will replace matching local sections from JSON.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Import",
        onPress: () => {
          try {
            const parsed = JSON.parse(importJson) as unknown;
            const imported = importAppData(parsed);

            if (imported) {
              setImportJson("");
              return;
            }

            Alert.alert("Import failed", "The JSON is valid, but it is not planner data.");
          } catch {
            Alert.alert("Import failed", "The JSON could not be parsed.");
          }
        },
      },
    ]);
  };

  const addReminder = () => {
    if (!newReminderTitle.trim()) {
      return;
    }

    addMindsetReminder({
      category: newReminderCategory,
      title: newReminderTitle.trim(),
      description: newReminderDescription.trim(),
    });
    setNewReminderTitle("");
    setNewReminderDescription("");
  };

  const confirmDeleteReminder = (id: string) => {
    Alert.alert("Delete reminder?", "This removes the local reminder.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMindsetReminder(id) },
    ]);
  };

  return (
    <Screen>
      <SectionHeader title="Customize" />

      <Card style={styles.card}>
        <Text style={styles.label}>Daily focus limit</Text>
        <View style={styles.stepperRow}>
          <Pressable onPress={() => updateDailyFocusLimit(-1)} style={styles.stepperButton}>
            <Text style={styles.stepperButtonText}>-</Text>
          </Pressable>
          <Text style={styles.value}>{appSettings.dailyFocusLimit} actions</Text>
          <Pressable onPress={() => updateDailyFocusLimit(1)} style={styles.stepperButton}>
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Theme accent color</Text>
        <TextField
          label="Primary accent"
          onChangeText={(themeAccentColor) => updateAppSettings({ themeAccentColor })}
          placeholder="Color name or hex value"
          value={appSettings.themeAccentColor ?? ""}
        />
      </Card>

      <SectionHeader title="Target areas" />
      {AREA_ORDER.map((areaId) => {
        const area = getAreaMeta(areaId, appSettings);

        return (
          <Card key={areaId} style={styles.card}>
            <Text style={[styles.areaTitle, { color: area.color }]}>{area.label}</Text>
            <TextField
              label="Name"
              onChangeText={(label) => updateTargetArea(areaId, { label })}
              value={area.label}
            />
            <TextField
              label="Description"
              multiline
              onChangeText={(description) => updateTargetArea(areaId, { description })}
              value={area.description}
            />
            <TextField
              label="Color"
              onChangeText={(color) => updateTargetArea(areaId, { color })}
              value={area.color}
            />
          </Card>
        );
      })}

      <SectionHeader title="Goals" />
      <Card style={styles.card}>
        <Text style={styles.value}>{goals.length} goals can be edited from Goal Detail.</Text>
        <Text style={styles.helperText}>
          Open Goals, tap a goal, then use Edit goal for title, method, progress, notes, and
          weekly actions.
        </Text>
      </Card>

      <SectionHeader title="Default daily routine" />
      <Card style={styles.card}>
        <TextField
          label="Workday morning"
          multiline
          onChangeText={(workdayMorning) => updateRoutine({ workdayMorning })}
          value={defaultRoutine.workdayMorning}
        />
        <TextField
          label="Workday focus"
          multiline
          onChangeText={(workdayWork) => updateRoutine({ workdayWork })}
          value={defaultRoutine.workdayWork}
        />
        <TextField
          label="Workday night"
          multiline
          onChangeText={(workdayNight) => updateRoutine({ workdayNight })}
          value={defaultRoutine.workdayNight}
        />
        <TextField
          label="Off-day build"
          multiline
          onChangeText={(offDayBuild) => updateRoutine({ offDayBuild })}
          value={defaultRoutine.offDayBuild}
        />
        <TextField
          label="Off-day monetization"
          multiline
          onChangeText={(offDayMonetization) => updateRoutine({ offDayMonetization })}
          value={defaultRoutine.offDayMonetization}
        />
        <TextField
          label="Off-day review"
          multiline
          onChangeText={(offDayReview) => updateRoutine({ offDayReview })}
          value={defaultRoutine.offDayReview}
        />
      </Card>

      <SectionHeader title="Weekly system and habits" />
      <Card style={styles.card}>
        <ListEditor
          label="Weekday morning"
          onChange={(weekdayMorning) => updateWeeklySystem({ weekdayMorning })}
          value={weeklySystem.weekdayMorning}
        />
        <ListEditor
          label="Weekday night"
          onChange={(weekdayNight) => updateWeeklySystem({ weekdayNight })}
          value={weeklySystem.weekdayNight}
        />
        <ListEditor
          label="Off-day plan"
          onChange={(offDayPlan) => updateWeeklySystem({ offDayPlan })}
          value={weeklySystem.offDayPlan}
        />
        <ListEditor
          label="Daily habits"
          onChange={(dailyHabits) => updateWeeklySystem({ dailyHabits })}
          value={weeklySystem.dailyHabits}
        />
        <ListEditor
          label="Focus flow"
          onChange={(focusFlow) => updateWeeklySystem({ focusFlow })}
          value={weeklySystem.focusFlow}
        />
      </Card>

      <SectionHeader title="30-day action plan" />
      <Card style={styles.card}>
        <PlanEditor label="Week 1-2" onChange={(week1To2) => updateThirtyDayPlan({ week1To2 })} value={thirtyDayPlan.week1To2} />
        <PlanEditor label="Week 3" onChange={(week3) => updateThirtyDayPlan({ week3 })} value={thirtyDayPlan.week3} />
        <PlanEditor label="Week 4" onChange={(week4) => updateThirtyDayPlan({ week4 })} value={thirtyDayPlan.week4} />
        <PlanEditor label="Final goal" onChange={(finalGoal) => updateThirtyDayPlan({ finalGoal })} value={thirtyDayPlan.finalGoal} />
      </Card>

      <SectionHeader title="Mindset reminders and long-term vision" />
      <Card style={styles.card}>
        <TextField label="New reminder title" onChangeText={setNewReminderTitle} value={newReminderTitle} />
        <TextField
          label="New reminder description"
          multiline
          onChangeText={setNewReminderDescription}
          value={newReminderDescription}
        />
        <View style={styles.chipRow}>
          {REMINDER_CATEGORIES.map((category) => (
            <SmallAction
              key={category}
              label={category.replaceAll("_", " ")}
              onPress={() => setNewReminderCategory(category)}
            />
          ))}
        </View>
        <Text style={styles.helperText}>
          Selected category: {newReminderCategory.replaceAll("_", " ")}
        </Text>
        <PrimaryButton disabled={!newReminderTitle.trim()} label="Add reminder" onPress={addReminder} />
      </Card>
      {mindsetReminders.map((reminder) => (
        <Card key={reminder.id} style={styles.card}>
          <Text style={styles.label}>{reminder.category.replaceAll("_", " ")}</Text>
          <TextField
            label="Title"
            onChangeText={(title) => updateMindsetReminder(reminder.id, { title })}
            value={reminder.title}
          />
          <TextField
            label="Description"
            multiline
            onChangeText={(description) =>
              updateMindsetReminder(reminder.id, { description })
            }
            value={reminder.description}
          />
          <SmallAction danger label="Delete reminder" onPress={() => confirmDeleteReminder(reminder.id)} />
        </Card>
      ))}

      <SectionHeader title="Local data" />
      <PrimaryButton label="Export data as JSON" onPress={createExport} />
      <TextField
        label="Export JSON"
        multiline
        onChangeText={setExportJson}
        placeholder="Tap export to generate JSON."
        value={exportJson}
      />
      <TextField
        label="Import JSON"
        multiline
        onChangeText={setImportJson}
        placeholder="Paste exported JSON here."
        value={importJson}
      />
      <PrimaryButton disabled={!importJson.trim()} label="Import data from JSON" onPress={confirmImport} />
      <PrimaryButton label="Reset to default seed data" onPress={confirmReset} />

      <Card style={styles.card}>
        <Text style={styles.label}>App name</Text>
        <Text style={styles.value}>{APP_NAME}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  areaTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  card: {
    gap: theme.spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
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

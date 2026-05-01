import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import {
  createEmptyJournalForm,
  JournalEditor,
  JournalFormState,
} from "../../../src/components/journal/JournalEditor";
import { JournalEntryCard } from "../../../src/components/journal/JournalEntryCard";
import { JournalFilters } from "../../../src/components/journal/JournalFilters";
import { ChoiceChip } from "../../../src/components/forms/ChoiceChip";
import { Card } from "../../../src/components/ui/Card";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { Screen } from "../../../src/components/ui/Screen";
import { SectionHeader } from "../../../src/components/ui/SectionHeader";
import { JOURNAL_PROMPTS } from "../../../src/constants/journal";
import { theme } from "../../../src/constants/theme";
import { useAppStore } from "../../../src/store/useAppStore";
import { getDateKey, formatDate } from "../../../src/utils/planning";
import { filterJournalEntries, getTasksByDate } from "../../../src/utils/selectors";

export default function JournalScreen() {
  const goals = useAppStore((state) => state.goals);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const tasks = useAppStore((state) => state.tasks);
  const addJournalEntry = useAppStore((state) => state.addJournalEntry);

  const [selectedDate, setSelectedDate] = useState(getDateKey);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>();
  const [showAllDates, setShowAllDates] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<JournalFormState>(createEmptyJournalForm);
  const [editorVisible, setEditorVisible] = useState(false);

  const dayTasks = useMemo(
    () => getTasksByDate({ tasks }, selectedDate),
    [selectedDate, tasks],
  );
  const filteredEntries = useMemo(
    () =>
      filterJournalEntries({
        date: showAllDates ? undefined : selectedDate,
        entries: journalEntries,
        goalId: selectedGoalId,
        query,
      }),
    [journalEntries, query, selectedDate, selectedGoalId, showAllDates],
  );

  const saveEntry = () => {
    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      return;
    }

    addJournalEntry({
      title,
      content,
      date: selectedDate,
      linkedGoalIds: form.linkedGoalIds,
      linkedTaskIds: form.linkedTaskIds,
      mood: form.mood.trim() || undefined,
      progressReflection: form.progressReflection.trim() || undefined,
    });
    setForm(createEmptyJournalForm());
    setEditorVisible(false);
  };

  const startWithPrompt = (prompt: string) => {
    setForm({
      ...createEmptyJournalForm(),
      content: `${prompt}\n`,
    });
    setEditorVisible(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <Screen>
        <Card style={styles.writeCard}>
          <Pressable
            onPress={() => setEditorVisible((value) => !value)}
            style={styles.writeButton}
          >
            <Text style={styles.writeButtonText}>
              {editorVisible ? "Hide editor" : "+ Write entry"}
            </Text>
          </Pressable>
          {!editorVisible ? (
            <View style={styles.promptRow}>
              {JOURNAL_PROMPTS.slice(0, 3).map((prompt) => (
                <ChoiceChip
                  active={false}
                  key={prompt}
                  label={prompt}
                  onPress={() => startWithPrompt(prompt)}
                />
              ))}
            </View>
          ) : null}
        </Card>

        {editorVisible ? (
          <JournalEditor
            dateLabel={formatDate(selectedDate)}
            form={form}
            goals={goals}
            onChange={setForm}
            onSave={saveEntry}
            tasks={dayTasks}
          />
        ) : null}

        <View style={styles.sectionBlock}>
          <SectionHeader title="Find entries" />
          <JournalFilters
            date={selectedDate}
            goals={goals}
            goalId={selectedGoalId}
            onDateChange={setSelectedDate}
            onGoalChange={setSelectedGoalId}
            onSearchChange={setQuery}
            onShowAllDatesChange={setShowAllDates}
            onToday={() => setSelectedDate(getDateKey())}
            query={query}
            showAllDates={showAllDates}
          />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader
            title={`${filteredEntries.length} entries`}
          />
          <View style={styles.stack}>
            {filteredEntries.length === 0 ? (
              <EmptyState
                title="No entries found"
                description="Write a note for this day or loosen the search filters."
              />
            ) : (
              filteredEntries.map((entry) => (
                <JournalEntryCard
                  entry={entry}
                  goals={goals}
                  key={entry.id}
                  tasks={tasks}
                />
              ))
            )}
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  sectionBlock: {
    gap: theme.spacing.md,
  },
  writeCard: {
    gap: theme.spacing.md,
  },
  writeButton: {
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  writeButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: "900",
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  stack: {
    gap: theme.spacing.md,
  },
});

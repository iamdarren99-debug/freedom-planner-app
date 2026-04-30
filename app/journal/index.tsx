import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import {
  createEmptyJournalForm,
  JournalEditor,
  JournalFormState,
} from "../../src/components/journal/JournalEditor";
import { JournalEntryCard } from "../../src/components/journal/JournalEntryCard";
import { JournalFilters } from "../../src/components/journal/JournalFilters";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { theme } from "../../src/constants/theme";
import { useAppStore } from "../../src/store/useAppStore";
import { getDateKey, formatDate } from "../../src/utils/planning";
import { filterJournalEntries, getTasksByDate } from "../../src/utils/selectors";

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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <Screen>
        <SectionHeader
          eyebrow="Journal"
          title="Notes, diary, and progress reflection"
          subtitle="Connect what happened today to tasks, goals, and the bigger freedom plan."
        />

        <JournalEditor
          dateLabel={formatDate(selectedDate)}
          form={form}
          goals={goals}
          onChange={setForm}
          onSave={saveEntry}
          tasks={dayTasks}
        />

        <View style={styles.sectionBlock}>
          <SectionHeader
            eyebrow="Review"
            title="Find entries"
            subtitle="Filter by day, linked goal, or any words you remember."
          />
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
            subtitle={
              showAllDates
                ? "Showing reflections across all saved dates."
                : `Showing reflections for ${formatDate(selectedDate)}.`
            }
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

        <Text style={styles.footerNote}>
          Use journal entries for day notes, task notes, goal notes, total progress, or honest
          diary reflections.
        </Text>
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
  stack: {
    gap: theme.spacing.md,
  },
  footerNote: {
    color: theme.colors.subtle,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});

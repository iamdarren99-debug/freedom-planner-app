import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../src/constants/theme";
import { useAppStore } from "../../src/store/useAppStore";
import { formatDate } from "../../src/utils/planning";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { PrimaryButton } from "../../src/components/forms/PrimaryButton";
import { TextField } from "../../src/components/forms/TextField";

export default function JournalScreen() {
  const journalEntries = useAppStore((state) => state.journalEntries);
  const addJournalEntry = useAppStore((state) => state.addJournalEntry);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const disabled = title.trim().length === 0 || content.trim().length === 0;

  return (
    <Screen>
      <SectionHeader
        eyebrow="Journal"
        title="Quick reflection"
        subtitle="Capture wins, friction, and the next move while it is fresh."
      />

      <View style={styles.panel}>
        <TextField
          label="Entry title"
          onChangeText={setTitle}
          placeholder="What happened today?"
          value={title}
        />
        <TextField
          label="Reflection"
          multiline
          onChangeText={setContent}
          placeholder="Capture friction, wins, or the next move."
          value={content}
        />
        <PrimaryButton
          disabled={disabled}
          label="Save entry"
          onPress={() => {
            if (disabled) {
              return;
            }

            addJournalEntry({
              title: title.trim(),
              content: content.trim(),
            });
            setTitle("");
            setContent("");
          }}
        />
      </View>

      <SectionHeader title="Recent entries" subtitle="Your reflections stay on this device." />
      <View style={styles.stack}>
        {journalEntries.length === 0 ? (
          <EmptyState
            title="No entries yet"
            description="Add a quick reflection when you finish a meaningful block."
          />
        ) : (
          journalEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
              <Text style={styles.entryContent}>{entry.content}</Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  entryCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  entryTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  entryDate: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  entryContent: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});

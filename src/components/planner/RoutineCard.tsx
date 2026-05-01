import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { DefaultRoutine } from "../../types/planner";
import { Card } from "../ui/Card";

export function RoutineCard({
  isOffDay,
  routine,
}: {
  isOffDay: boolean;
  routine?: DefaultRoutine;
}) {
  const sections = isOffDay
    ? [
        { title: "Build", detail: routine?.offDayBuild ?? "2 hours building something useful." },
        {
          title: "Monetization",
          detail: routine?.offDayMonetization ?? "2 hours outreach, sales, or client work.",
        },
        { title: "Review", detail: routine?.offDayReview ?? "1 hour review + planning." },
      ]
    : [
        {
          title: "Morning",
          detail: routine?.workdayMorning ?? "5 min spending check + 20-30 min learning/research.",
        },
        {
          title: "Work day",
          detail: routine?.workdayWork ?? "Protect energy. Capture ideas, do not overplan.",
        },
        {
          title: "Night",
          detail:
            routine?.workdayNight ??
            "Build or improve something, review today, write short notes.",
        },
      ];

  return (
    <Card style={styles.routineCard}>
      {sections.map((section) => (
        <View key={section.title} style={styles.routineRow}>
          <Text style={styles.routineTitle}>{section.title}</Text>
          <Text style={styles.routineText}>{section.detail}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  routineCard: {
    gap: theme.spacing.md,
  },
  routineRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 4,
    paddingBottom: theme.spacing.md,
  },
  routineTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  routineText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});

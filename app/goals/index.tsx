import { View } from "react-native";

import { AREA_META } from "../../src/constants/app";
import { useAppStore } from "../../src/store/useAppStore";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { GoalCard } from "../../src/components/cards/GoalCard";

export default function GoalsScreen() {
  const goals = useAppStore((state) => state.goals);

  return (
    <Screen>
      <SectionHeader
        eyebrow="Goals"
        title="Goal library"
        subtitle="A clean list of seeded goals grouped by the main target areas."
      />

      <View style={{ gap: 18 }}>
        {Object.entries(AREA_META).map(([key, area]) => (
          <View key={key} style={{ gap: 14 }}>
            <SectionHeader title={area.label} subtitle={area.description} />
            <View style={{ gap: 14 }}>
              {goals
                .filter((goal) => goal.area === key)
                .map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

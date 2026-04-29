import { View } from "react-native";

import { useAppStore } from "../../src/store/useAppStore";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { PlannerCard } from "../../src/components/cards/PlannerCard";

export default function PlannerScreen() {
  const plannerBlocks = useAppStore((state) => state.plannerBlocks);

  return (
    <Screen>
      <SectionHeader
        eyebrow="Planner"
        title="Weekly structure"
        subtitle="This is a simple execution rhythm that the app can grow around later."
      />

      <View style={{ gap: 14 }}>
        {plannerBlocks.map((block) => (
          <PlannerCard key={block.id} block={block} />
        ))}
      </View>
    </Screen>
  );
}

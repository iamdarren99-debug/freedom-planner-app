import { View } from "react-native";

import { PlannerCard } from "../../src/components/cards/PlannerCard";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { useAppStore } from "../../src/store/useAppStore";

export default function PlannerScreen() {
  const weeklySystem = useAppStore((state) => state.weeklySystem);
  const thirtyDayPlan = useAppStore((state) => state.thirtyDayPlan);
  const tasks = useAppStore((state) => state.tasks);
  const focusTasks = tasks
    .filter((task) => task.status === "TODO")
    .slice(0, 5)
    .map((task) => task.title);

  return (
    <Screen>
      <SectionHeader
        eyebrow="Planner"
        title="Weekly system"
        subtitle="Your operating rhythm and 30-day action plan."
      />

      <View style={{ gap: 14 }}>
        <PlannerCard title="Focus tasks" meta="Seeded from weekly actions" items={focusTasks} />
        <PlannerCard title="Weekday morning" meta="Learning" items={weeklySystem.weekdayMorning} />
        <PlannerCard title="Weekday night" meta="Building" items={weeklySystem.weekdayNight} />
        <PlannerCard title="Off day plan" meta="Execution" items={weeklySystem.offDayPlan} />
        <PlannerCard title="Daily habits" meta="Baseline" items={weeklySystem.dailyHabits} />
        <PlannerCard title="Focus flow" meta="Operating loop" items={weeklySystem.focusFlow} />
        <PlannerCard title="30-day plan: Week 1-2" meta="Build" items={thirtyDayPlan.week1To2} />
        <PlannerCard title="30-day plan: Week 3" meta="Package" items={thirtyDayPlan.week3} />
        <PlannerCard title="30-day plan: Week 4" meta="Outreach" items={thirtyDayPlan.week4} />
        <PlannerCard title="30-day final goal" meta="Outcome" items={thirtyDayPlan.finalGoal} />
      </View>
    </Screen>
  );
}

import { Goal, GoalPriority, Task } from "../types/planner";
import { isWeekend } from "./dateKeys";
import { isActiveGoal, priorityRank } from "./planning";
import { normalizeTitle } from "./text";

export const WORKDAY_TIME_BLOCKS = [
  "7:00 AM",
  "7:30 AM",
  "8:30 AM",
  "8:30 PM",
  "9:30 PM",
  "10:30 PM",
  "11:30 PM",
] as const;

export const OFF_DAY_TIME_BLOCKS = [
  "Off day morning",
  "Off day afternoon",
  "Off day evening",
] as const;

export const TIME_BLOCKS = [...WORKDAY_TIME_BLOCKS, ...OFF_DAY_TIME_BLOCKS];

export interface TaskSuggestion {
  id: string;
  title: string;
  description?: string;
  goalId?: string;
  timeBlock?: string;
  durationMinutes?: number;
  priority: GoalPriority;
  reason: string;
}

export function getTimeBlocksForDay(date: string) {
  // Workdays hide off-day blocks so the form reflects the real routine at a glance.
  return isWeekend(date) ? [...OFF_DAY_TIME_BLOCKS] : [...WORKDAY_TIME_BLOCKS];
}

export function buildTaskSuggestions({
  date,
  goals,
  tasks,
  weeklyHabits,
}: {
  date: string;
  goals: Goal[];
  tasks: Task[];
  weeklyHabits: string[];
}) {
  const existingTitles = new Set(
    tasks.filter((task) => task.date === date).map((task) => normalizeTitle(task.title)),
  );
  const suggestions: TaskSuggestion[] = [];
  const offDay = isWeekend(date);
  const routineSuggestions: TaskSuggestion[] = offDay
    ? [
        {
          id: "routine-offday-build",
          title: "2 hours build",
          description: "Use the biggest block for shipping or improving a real asset.",
          timeBlock: "Off day morning",
          durationMinutes: 120,
          priority: "HIGH",
          reason: "Off days are your best deep-work window.",
        },
        {
          id: "routine-offday-monetization",
          title: "2 hours monetization/outreach",
          description: "Contact prospects, package an offer, or follow up.",
          timeBlock: "Off day afternoon",
          durationMinutes: 120,
          priority: "HIGH",
          reason: "Execution needs a path to income.",
        },
        {
          id: "routine-offday-review",
          title: "1 hour review + planning",
          description: "Review progress and choose the next small bets.",
          timeBlock: "Off day evening",
          durationMinutes: 60,
          priority: "MEDIUM",
          reason: "Review keeps the system honest.",
        },
      ]
    : [
        {
          id: "routine-spending-check",
          title: "5 min spending check",
          description: "Log spending and catch unnecessary leaks.",
          timeBlock: "7:00 AM",
          durationMinutes: 5,
          priority: "HIGH",
          reason: "Cash stability starts with daily visibility.",
        },
        {
          id: "routine-learning",
          title: "20-30 min learning/research",
          description: "Learn one practical thing you can use soon.",
          timeBlock: "7:30 AM",
          durationMinutes: 30,
          priority: "MEDIUM",
          reason: "Morning is your cleanest learning window.",
        },
        {
          id: "routine-night-build",
          title: "Build something or improve something",
          description: "Small shipped improvement beats more planning.",
          timeBlock: "8:30 PM",
          durationMinutes: 60,
          priority: "HIGH",
          reason: "Night is your execution window after work.",
        },
      ];

  for (const suggestion of routineSuggestions) {
    pushUniqueSuggestion(suggestions, suggestion, existingTitles);
  }

  const habitSuggestion = weeklyHabits.find((habit) => !existingTitles.has(normalizeTitle(habit)));
  if (habitSuggestion) {
    pushUniqueSuggestion(
      suggestions,
      {
        id: `habit-${normalizeTitle(habitSuggestion).replaceAll(" ", "-")}`,
        title: habitSuggestion.replace(/\.$/, ""),
        description: "Daily habit from your weekly system.",
        timeBlock: offDay ? "Off day evening" : "11:30 PM",
        durationMinutes: 10,
        priority: "MEDIUM",
        reason: "Daily habits keep the base stable.",
      },
      existingTitles,
    );
  }

  const highPriorityGoals = goals
    .filter((goal) => goal.priority === "HIGH" && isActiveGoal(goal))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.title.localeCompare(b.title));

  for (const goal of highPriorityGoals) {
    const action = goal.weeklyActions.find(
      (item) =>
        !existingTitles.has(normalizeTitle(item)) && !isWeeklyActionDone(tasks, goal.id, item),
    );

    if (!action) {
      continue;
    }

    pushUniqueSuggestion(
      suggestions,
      {
        id: `goal-${goal.id}-${normalizeTitle(action).replaceAll(" ", "-")}`,
        title: action,
        description: `Weekly action for ${goal.title}.`,
        goalId: goal.id,
        timeBlock: offDay ? "Off day morning" : "9:30 PM",
        durationMinutes: 45,
        priority: goal.priority,
        reason: `High-priority goal: ${goal.title}.`,
      },
      existingTitles,
    );

    if (suggestions.length >= 5) {
      break;
    }
  }

  return suggestions.slice(0, 5);
}

export function pushUniqueSuggestion(
  suggestions: TaskSuggestion[],
  suggestion: TaskSuggestion,
  existingTitles: Set<string>,
) {
  const key = normalizeTitle(suggestion.title);
  const alreadySuggested = suggestions.some((item) => normalizeTitle(item.title) === key);

  if (!existingTitles.has(key) && !alreadySuggested) {
    suggestions.push(suggestion);
  }
}

export function isWeeklyActionDone(tasks: Task[], goalId: string, title: string) {
  const normalized = normalizeTitle(title);

  return tasks.some(
    (task) =>
      task.goalId === goalId && normalizeTitle(task.title) === normalized && task.status === "DONE",
  );
}

export function compareTasksForDay(a: Task, b: Task) {
  const timeDelta = timeBlockRank(a.timeBlock) - timeBlockRank(b.timeBlock);
  if (timeDelta !== 0) {
    return timeDelta;
  }

  const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return a.createdAt.localeCompare(b.createdAt);
}

export function timeBlockRank(value?: string) {
  if (!value) {
    return 999;
  }

  const exactIndex = (TIME_BLOCKS as readonly string[]).indexOf(value);
  if (exactIndex >= 0) {
    return exactIndex;
  }

  return 500;
}

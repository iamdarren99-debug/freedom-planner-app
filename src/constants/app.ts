import { TargetAreaId } from "../types/planner";
import { theme } from "./theme";

export const APP_NAME = "Freedom Planner";
export const APP_TAGLINE = "A personal execution system for goals, planning, and daily follow-through.";

export const AREA_META: Record<
  TargetAreaId,
  { label: string; description: string; color: string; icon: string }
> = {
  financial: {
    label: "Financial",
    description: "Build stability, savings, and debt freedom.",
    color: theme.colors.financial,
    icon: "cash-multiple",
  },
  "career-business": {
    label: "Career / Business",
    description: "Turn skills into income and ownership.",
    color: theme.colors.career,
    icon: "briefcase-outline",
  },
  skills: {
    label: "Skills",
    description: "Build leverage and execution speed.",
    color: theme.colors.skills,
    icon: "brain",
  },
  "personal-relationship": {
    label: "Personal / Relationship",
    description: "Protect connection and lifestyle quality.",
    color: theme.colors.personal,
    icon: "heart-outline",
  },
};

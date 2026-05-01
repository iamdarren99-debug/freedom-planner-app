import { AREA_META } from "../constants/app";
import { AppSettings, TargetAreaId } from "../types/planner";
import { safeColor } from "./colors";

export function getAreaMeta(areaId: TargetAreaId, appSettings?: AppSettings) {
  const base = AREA_META[areaId];
  const override = appSettings?.targetAreaOverrides?.[areaId];

  return {
    ...base,
    ...override,
    color: safeColor(override?.color, base.color),
    description: override?.description?.trim() || base.description,
    label: override?.label?.trim() || base.label,
  };
}

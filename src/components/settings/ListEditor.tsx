import { useEffect, useState } from "react";

import { TextField } from "../forms/TextField";

export function ListEditor({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string[]) => void;
  value: string[];
}) {
  const [draft, setDraft] = useState(value.join("\n"));

  useEffect(() => {
    setDraft(value.join("\n"));
  }, [value]);

  return (
    <TextField
      label={label}
      multiline
      onBlur={() => onChange(linesFromText(draft))}
      onChangeText={setDraft}
      value={draft}
    />
  );
}

export const PlanEditor = ListEditor;

function linesFromText(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

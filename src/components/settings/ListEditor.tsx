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
  return (
    <TextField
      label={label}
      multiline
      onChangeText={(text) => onChange(linesFromText(text))}
      value={value.join("\n")}
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

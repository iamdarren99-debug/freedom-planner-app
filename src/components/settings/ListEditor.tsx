import { useEffect, useState } from "react";

import { linesFromText } from "../../utils/text";
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

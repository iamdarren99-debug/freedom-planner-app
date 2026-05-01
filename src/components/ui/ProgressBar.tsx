import { StyleSheet, View } from "react-native";

import { theme } from "../../constants/theme";

export function ProgressBar({
  color,
  height = 10,
  value,
}: {
  color: string;
  height?: number;
  value: number;
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${clampedValue}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 999,
    height: "100%",
  },
});

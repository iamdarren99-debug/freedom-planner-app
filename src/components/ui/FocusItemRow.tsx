import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../constants/theme";
import { Card } from "./Card";

interface FocusItemRowProps {
  goalTitle: string;
  item: string;
  accentColor: string;
  complete: boolean;
  onPress: () => void;
}

export function FocusItemRow({
  goalTitle,
  item,
  accentColor,
  complete,
  onPress,
}: FocusItemRowProps) {
  return (
    <Pressable
      android_ripple={{ color: theme.alpha.white06 }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1 })}
    >
      <Card style={[styles.row, { borderColor: complete ? accentColor : theme.colors.border }]}>
        <MaterialCommunityIcons
          color={complete ? accentColor : theme.colors.subtle}
          name={complete ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
          size={22}
        />

        <View style={styles.copy}>
          <Text numberOfLines={1} style={[styles.goalTitle, { color: accentColor }]}>
            {goalTitle}
          </Text>
          <Text style={styles.item}>{item}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  item: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { theme } from "../../constants/theme";
import { Card } from "./Card";

interface ExpandableCardProps {
  accentColor?: string;
  children: ReactNode;
  expanded: boolean;
  eyebrow?: string;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
  title: string;
}

export function ExpandableCard({
  accentColor,
  children,
  expanded,
  eyebrow,
  onToggle,
  style,
  title,
}: ExpandableCardProps) {
  return (
    <Card style={[accentColor ? { borderColor: `${accentColor}55` } : null, style]}>
      <Pressable
        android_ripple={{ color: theme.alpha.white06 }}
        onPress={onToggle}
        style={styles.header}
      >
        <View style={styles.text}>
          {eyebrow ? (
            <Text style={[styles.eyebrow, accentColor ? { color: accentColor } : null]}>
              {eyebrow}
            </Text>
          ) : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        <MaterialCommunityIcons
          color={theme.colors.text}
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
        />
      </Pressable>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  text: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
});

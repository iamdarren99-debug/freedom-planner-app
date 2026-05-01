import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "../../constants/theme";

export function SettingsHeaderButton() {
  const router = useRouter();

  return (
    <Pressable
      android_ripple={{ color: theme.alpha.white06, borderless: true, radius: 20 }}
      hitSlop={12}
      onPress={() => router.push("/settings")}
      style={styles.button}
    >
      <MaterialCommunityIcons color={theme.colors.text} name="cog-outline" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 12,
  },
});

import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { ManualProgressLogForm } from "../../../src/components/progress/ManualProgressLogForm";
import { Screen } from "../../../src/components/ui/Screen";

export default function ManualProgressLogScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <Screen>
        <ManualProgressLogForm />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
});

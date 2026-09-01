import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

// Consistent inline error banner for failed fetches.
export function ErrorNote({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(251,113,133,0.08)",
    borderColor: "rgba(251,113,133,0.4)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: { color: colors.danger, fontSize: 14 },
});

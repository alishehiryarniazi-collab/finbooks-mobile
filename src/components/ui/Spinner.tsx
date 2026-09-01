import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";

// Centered loading indicator with an optional label.
export function Spinner({ label }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.mint} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  label: { color: colors.textMuted, fontSize: 14 },
});

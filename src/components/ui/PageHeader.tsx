import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";

// Screen title + optional subtitle, consistent across every page.
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xs },
  title: { color: colors.mint, fontSize: 22, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});

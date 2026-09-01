import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme/colors";

interface Props {
  children: ReactNode;
  scroll?: boolean; // wrap content in a ScrollView (most screens want this)
  center?: boolean; // vertically center content (auth screens)
}

// Every screen sits on the dark Aurora background inside the safe area, so we
// don't repeat SafeAreaView + background + padding in every screen file.
export function Screen({ children, scroll = true, center = false }: Props) {
  const inner = center ? [styles.content, styles.center] : styles.content;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView contentContainerStyle={inner} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[inner, styles.flex]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  center: { flexGrow: 1, justifyContent: "center" },
});

import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

// Glass-style surface used across the app (mirrors the web `.glass` card).
export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});

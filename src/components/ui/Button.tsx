import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

// Primary = neon-mint filled; ghost = outlined. Shows a spinner while `loading`
// and blocks presses when loading/disabled so a double-tap can't double-submit.
export function Button({ title, onPress, variant = "primary", loading = false, disabled = false }: Props) {
  const isPrimary = variant === "primary";
  const blocked = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && !blocked ? styles.pressed : null,
        blocked ? styles.blocked : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.bg : colors.mint} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: { backgroundColor: colors.mint },
  ghost: { borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.85 },
  blocked: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: "600" },
  textPrimary: { color: colors.bg },
  textGhost: { color: colors.text },
});

import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

interface Props extends TextInputProps {
  label: string;
}

// Password input with a show/hide (eye) toggle so users can verify what they typed.
// Defaults to the sensible password keyboard settings (no autocorrect/autocap).
export function PasswordField({ label, style, ...rest }: Props) {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor={colors.textFaint}
          style={[styles.input, style]}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        <Pressable
          onPress={() => setShow((v) => !v)}
          hitSlop={12}
          style={styles.eye}
          accessibilityRole="button"
          accessibilityLabel={show ? "Hide password" : "Show password"}
        >
          <Text style={styles.eyeIcon}>{show ? "🙈" : "👁️"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: "500" },
  inputWrap: { position: "relative", justifyContent: "center" },
  input: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingRight: 48, // room for the eye button
    color: colors.text,
    fontSize: 16,
  },
  eye: { position: "absolute", right: 6, height: 40, width: 40, alignItems: "center", justifyContent: "center" },
  eyeIcon: { fontSize: 18 },
});

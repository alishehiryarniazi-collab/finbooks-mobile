import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

interface Props extends TextInputProps {
  label: string;
}

// Labelled text input styled for the dark theme. Spreads through any TextInput
// prop (secureTextEntry, keyboardType, autoCapitalize, etc.).
export function Field({ label, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: "500" },
  input: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
});

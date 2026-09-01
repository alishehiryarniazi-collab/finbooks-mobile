import type { ReactNode } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { colors, radius, spacing } from "../../theme/colors";

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  busy?: boolean;
  error?: string | null;
  saveLabel?: string;
  children: ReactNode; // the form fields
}

// Bottom-sheet modal that wraps any set of form fields with a title, error line,
// and Cancel/Save actions. Reused by every settings form.
export function FormSheet({ visible, title, onClose, onSave, busy, error, saveLabel = "Save", children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            {children}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button title="Cancel" variant="ghost" onPress={onClose} />
              </View>
              <View style={styles.flex}>
                <Button title={busy ? "Saving…" : saveLabel} onPress={onSave} loading={busy} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#0d1018", borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderTopWidth: 1, borderColor: colors.border, maxHeight: "88%", padding: spacing.lg },
  title: { color: colors.mint, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },
  form: { gap: spacing.md, paddingBottom: spacing.lg },
  error: { color: colors.danger, fontSize: 14 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  flex: { flex: 1 },
});

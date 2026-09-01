import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme/colors";

export interface Option {
  label: string;
  value: string;
  sublabel?: string;
}

interface Props {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}

// A tap-to-open dropdown for React Native (there's no native <select>). Shows the
// selected option's label, and opens a modal list to choose. Reused by every form.
export function SelectField({ label, value, options, onChange, placeholder = "Select…" }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.control} onPress={() => setOpen(true)}>
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optLabel, item.value === value && styles.optSelected]}>{item.label}</Text>
                  {item.sublabel ? <Text style={styles.optSub}>{item.sublabel}</Text> : null}
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.empty}>No options.</Text>}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: "500" },
  control: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  value: { color: colors.text, fontSize: 16, flex: 1 },
  placeholder: { color: colors.textFaint },
  chevron: { color: colors.textMuted, fontSize: 14, marginLeft: spacing.sm },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: spacing.lg },
  sheet: { backgroundColor: "#0d1018", borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, maxHeight: "70%", padding: spacing.lg },
  sheetTitle: { color: colors.mint, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  option: { paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  optLabel: { color: colors.text, fontSize: 15 },
  optSelected: { color: colors.mint, fontWeight: "700" },
  optSub: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  empty: { color: colors.textFaint, fontSize: 14, paddingVertical: spacing.lg, textAlign: "center" },
});

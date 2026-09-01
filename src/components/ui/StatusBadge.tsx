import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme/colors";

// Maps a document/account status to a colour. Unknown statuses fall back to muted.
const TONE: Record<string, { bg: string; fg: string }> = {
  PAID: { bg: "rgba(52,211,153,0.15)", fg: colors.success },
  POSTED: { bg: "rgba(52,211,153,0.15)", fg: colors.success },
  SENT: { bg: "rgba(8,145,255,0.15)", fg: colors.blue },
  OPEN: { bg: "rgba(8,145,255,0.15)", fg: colors.blue },
  PARTIAL: { bg: "rgba(251,191,36,0.15)", fg: colors.warning },
  DRAFT: { bg: "rgba(148,163,184,0.15)", fg: colors.textMuted },
  VOID: { bg: "rgba(251,113,133,0.15)", fg: colors.danger },
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONE[status] ?? { bg: "rgba(148,163,184,0.15)", fg: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});

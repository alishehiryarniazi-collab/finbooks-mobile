import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";
import { money } from "../../lib/format";

interface Props {
  label: string;
  sublabel?: string;
  amount: string | number;
  bold?: boolean; // for total rows
  divider?: boolean; // hairline on top
  right?: ReactNode; // override the right side (e.g. a badge) instead of an amount
}

// A label-on-the-left, amount-on-the-right row — the backbone of every report and list.
export function AmountRow({ label, sublabel, amount, bold, divider, right }: Props) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.left}>
        <Text style={[styles.label, bold && styles.bold]} numberOfLines={1}>
          {label}
        </Text>
        {sublabel ? <Text style={styles.sub}>{sublabel}</Text> : null}
      </View>
      {right ?? (
        <Text style={[styles.amount, bold && styles.bold]}>{money(amount)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  left: { flex: 1, gap: 2 },
  label: { color: colors.text, fontSize: 14 },
  sub: { color: colors.textFaint, fontSize: 12 },
  amount: { color: colors.text, fontSize: 14, fontVariant: ["tabular-nums"] as const },
  bold: { fontWeight: "700", color: colors.mint },
});

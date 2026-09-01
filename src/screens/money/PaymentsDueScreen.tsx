import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { useFetch } from "../../hooks/useFetch";
import { money, shortDate } from "../../lib/format";
import type { Bill } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

const DAY = 86_400_000;

interface DueBill {
  bill: Bill;
  outstanding: number;
  diff: number; // days until due (negative = overdue)
}

function daysUntil(dueISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueISO);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / DAY);
}

function whenLabel(diff: number): { text: string; color: string } {
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: colors.danger };
  if (diff === 0) return { text: "Due today", color: colors.warning };
  return { text: `in ${diff}d`, color: diff <= 7 ? colors.warning : colors.textFaint };
}

// Bills you owe, grouped by urgency (overdue / this week / upcoming). Tap opens the bill.
export function PaymentsDueScreen() {
  const navigation = useNavigation<any>();
  const { data, loading, error } = useFetch<{ bills: Bill[] }>("/bills");

  const groups = useMemo(() => {
    const payable: DueBill[] = (data?.bills ?? [])
      .filter((b) => (b.status === "OPEN" || b.status === "PARTIAL") && Number(b.total) - Number(b.amountPaid) > 0.005)
      .map((b) => ({ bill: b, outstanding: Number(b.total) - Number(b.amountPaid), diff: daysUntil(b.dueDate) }))
      .sort((a, b) => a.diff - b.diff);
    return {
      overdue: payable.filter((d) => d.diff < 0),
      dueSoon: payable.filter((d) => d.diff >= 0 && d.diff <= 7),
      upcoming: payable.filter((d) => d.diff > 7),
      total: payable.reduce((s, d) => s + d.outstanding, 0),
    };
  }, [data]);

  if (loading) return <Spinner label="Loading…" />;

  const isEmpty = groups.overdue.length + groups.dueSoon.length + groups.upcoming.length === 0;
  const openBill = (id: string) => navigation.navigate("Purchases", { screen: "BillView", params: { id } });

  const section = (title: string, dot: string, rows: DueBill[]) => {
    if (rows.length === 0) return null;
    const subtotal = rows.reduce((s, d) => s + d.outstanding, 0);
    return (
      <Card>
        <View style={styles.secHead}>
          <View style={styles.secTitle}>
            <View style={[styles.dot, { backgroundColor: dot }]} />
            <Text style={styles.secText}>{title} ({rows.length})</Text>
          </View>
          <Text style={styles.subtotal}>{money(subtotal)}</Text>
        </View>
        {rows.map(({ bill, outstanding, diff }) => {
          const when = whenLabel(diff);
          return (
            <Pressable key={bill.id} style={styles.row} onPress={() => openBill(bill.id)}>
              <View style={styles.rowLeft}>
                <Text style={styles.vendor} numberOfLines={1}>{bill.vendor?.name ?? "—"}</Text>
                <Text style={styles.billMeta}>{bill.number} · {shortDate(bill.dueDate)}</Text>
              </View>
              <Text style={[styles.when, { color: when.color }]}>{when.text}</Text>
              <Text style={styles.amount}>{money(outstanding)}</Text>
            </Pressable>
          );
        })}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {!isEmpty ? (
          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Total due</Text>
            <Text style={styles.totalVal}>{money(groups.total)}</Text>
          </View>
        ) : null}
        {isEmpty ? (
          <Card><Text style={styles.empty}>Nothing due. 🎉</Text></Card>
        ) : (
          <>
            {section("Overdue", colors.danger, groups.overdue)}
            {section("Due this week", colors.warning, groups.dueSoon)}
            {section("Upcoming", colors.textFaint, groups.upcoming)}
          </>
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  totalBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: colors.textMuted, fontSize: 13 },
  totalVal: { color: colors.mint, fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  secHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  secTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  secText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  subtotal: { color: colors.textMuted, fontSize: 13, fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  rowLeft: { flex: 1 },
  vendor: { color: colors.text, fontSize: 14 },
  billMeta: { color: colors.textFaint, fontSize: 12 },
  when: { fontSize: 12, fontWeight: "600" },
  amount: { color: colors.text, fontSize: 14, fontWeight: "700", width: 90, textAlign: "right", fontVariant: ["tabular-nums"] },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

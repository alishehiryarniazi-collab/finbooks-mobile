import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { money, shortDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import type { JournalEntry } from "../../lib/types";
import type { BooksStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<BooksStackParamList, "JournalView">;

const VOUCHER_LABEL: Record<string, string> = { JOURNAL: "Journal Voucher", DEBIT: "Payment Voucher", CREDIT: "Receipt Voucher" };

export function JournalViewScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<{ entry: JournalEntry }>(`/journal/${id}`);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";
  const entry = data?.entry;

  function confirmReverse() {
    Alert.alert("Reverse voucher", "This posts a mirror entry that cancels this one. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reverse",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await api.post(`/journal/${id}/reverse`);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Couldn't reverse", apiError(err));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  if (loading) return <Spinner label="Loading voucher…" />;
  if (error || !entry)
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <View style={styles.content}>
          <ErrorNote message={error ?? "Voucher not found."} />
        </View>
      </SafeAreaView>
    );

  const totalDebit = entry.lines.reduce((s, l) => s + Number(l.debit), 0);
  const canReverse = canWrite && entry.source === "MANUAL" && entry.status === "POSTED";

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headRow}>
          <Text style={styles.type}>{VOUCHER_LABEL[entry.voucherType] ?? entry.voucherType}</Text>
          <StatusBadge status={entry.status} />
        </View>
        <Text style={styles.meta}>{shortDate(entry.date)}{entry.reference ? ` · ${entry.reference}` : ""}</Text>
        {entry.memo ? <Text style={styles.memo}>{entry.memo}</Text> : null}

        <Card>
          <View style={styles.colHead}>
            <Text style={[styles.colLabel, styles.colAcc]}>Account</Text>
            <Text style={[styles.colLabel, styles.colAmt]}>Debit</Text>
            <Text style={[styles.colLabel, styles.colAmt]}>Credit</Text>
          </View>
          {entry.lines.map((l) => (
            <View key={l.id} style={styles.line}>
              <View style={styles.colAcc}>
                <Text style={styles.acc} numberOfLines={1}>
                  {l.account ? `${l.account.code} ${l.account.name}` : "—"}
                </Text>
                {l.description ? <Text style={styles.lineDesc}>{l.description}</Text> : null}
              </View>
              <Text style={[styles.amt, styles.colAmt]}>{Number(l.debit) > 0 ? money(l.debit) : "—"}</Text>
              <Text style={[styles.amt, styles.colAmt]}>{Number(l.credit) > 0 ? money(l.credit) : "—"}</Text>
            </View>
          ))}
          <View style={[styles.line, styles.totalLine]}>
            <Text style={[styles.totalLabel, styles.colAcc]}>Total</Text>
            <Text style={[styles.totalVal, styles.colAmt]}>{money(totalDebit)}</Text>
            <Text style={[styles.totalVal, styles.colAmt]}>{money(totalDebit)}</Text>
          </View>
        </Card>

        {entry.createdBy ? <Text style={styles.by}>Created by {entry.createdBy.name}</Text> : null}

        {canReverse ? (
          <Button title={busy ? "Reversing…" : "Reverse Voucher"} variant="ghost" onPress={confirmReverse} loading={busy} />
        ) : entry.source !== "MANUAL" ? (
          <Text style={styles.hint}>This voucher belongs to a document — undo it from the invoice/bill/payment instead.</Text>
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  type: { color: colors.mint, fontSize: 20, fontWeight: "800" },
  meta: { color: colors.textFaint, fontSize: 13 },
  memo: { color: colors.text, fontSize: 15 },
  colHead: { flexDirection: "row", paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  colLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  colAcc: { flex: 1 },
  colAmt: { width: 84, textAlign: "right" },
  line: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  acc: { color: colors.text, fontSize: 13 },
  lineDesc: { color: colors.textFaint, fontSize: 11, marginTop: 1 },
  amt: { color: colors.text, fontSize: 13, fontVariant: ["tabular-nums"] },
  totalLine: { borderBottomWidth: 0 },
  totalLabel: { color: colors.mint, fontSize: 14, fontWeight: "700" },
  totalVal: { color: colors.mint, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  by: { color: colors.textFaint, fontSize: 12 },
  hint: { color: colors.textMuted, fontSize: 13, fontStyle: "italic" },
});

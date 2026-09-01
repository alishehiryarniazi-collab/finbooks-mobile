import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useFetch } from "../../hooks/useFetch";
import { money, shortDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import type { JournalEntry } from "../../lib/types";
import type { BooksStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<BooksStackParamList, "Journal">;

const VOUCHER_LABEL: Record<string, string> = { JOURNAL: "Journal", DEBIT: "Payment", CREDIT: "Receipt" };

// Sum of debits = the entry's magnitude (debits always equal credits).
const entryAmount = (e: JournalEntry) => e.lines.reduce((s, l) => s + Number(l.debit), 0);

export function JournalListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<{ entries: JournalEntry[] }>("/journal");
  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  if (loading) return <Spinner label="Loading vouchers…" />;
  const entries = data?.entries ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {canWrite ? (
          <View style={styles.newRow}>
            <View style={styles.flex}>
              <Button title="Receipt" onPress={() => navigation.navigate("VoucherForm", { kind: "CREDIT" })} />
            </View>
            <View style={styles.flex}>
              <Button title="Payment" onPress={() => navigation.navigate("VoucherForm", { kind: "DEBIT" })} />
            </View>
            <View style={styles.flex}>
              <Button title="Journal" variant="ghost" onPress={() => navigation.navigate("JournalForm")} />
            </View>
          </View>
        ) : null}

        {error ? <ErrorNote message={error} /> : null}

        {entries.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No vouchers yet.</Text>
          </Card>
        ) : (
          entries.map((e) => (
            <Pressable key={e.id} onPress={() => navigation.navigate("JournalView", { id: e.id })}>
              <Card>
                <View style={styles.head}>
                  <Text style={styles.type}>{VOUCHER_LABEL[e.voucherType] ?? e.voucherType}</Text>
                  {e.status !== "POSTED" ? <StatusBadge status={e.status} /> : null}
                </View>
                <Text style={styles.memo} numberOfLines={1}>
                  {e.memo ?? e.reference ?? "—"}
                </Text>
                <View style={styles.foot}>
                  <Text style={styles.date}>
                    {shortDate(e.date)}
                    {e.reference ? ` · ${e.reference}` : ""}
                  </Text>
                  <Text style={styles.amount}>{money(entryAmount(e))}</Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  newRow: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  type: { color: colors.mint, fontSize: 14, fontWeight: "700" },
  memo: { color: colors.text, fontSize: 14, marginTop: 4 },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  date: { color: colors.textFaint, fontSize: 12 },
  amount: { color: colors.text, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

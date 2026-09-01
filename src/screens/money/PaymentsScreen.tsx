import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { useFetch } from "../../hooks/useFetch";
import { money, shortDate } from "../../lib/format";
import type { Payment } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Read-only list of every payment (received + made). Payments are created from
// invoices/bills, so they always tie back to a document + journal entry.
export function PaymentsScreen() {
  const { data, loading, error } = useFetch<{ payments: Payment[] }>("/payments");
  if (loading) return <Spinner label="Loading payments…" />;

  const docFor = (p: Payment) =>
    p.allocations.map((a) => a.invoice?.number ?? a.bill?.number).filter(Boolean).join(", ") || "—";

  const payments = data?.payments ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {payments.length === 0 ? (
          <Card><Text style={styles.empty}>No payments yet.</Text></Card>
        ) : (
          payments.map((p) => {
            const received = p.type === "RECEIVED";
            return (
              <Card key={p.id}>
                <View style={styles.head}>
                  <Text style={[styles.type, { color: received ? colors.success : colors.blue }]}>
                    {received ? "Received" : "Made"}
                  </Text>
                  <Text style={styles.amount}>{money(p.amount)}</Text>
                </View>
                <Text style={styles.doc}>{docFor(p)}</Text>
                <Text style={styles.meta}>
                  {shortDate(p.date)} · {p.bankAccount.code} {p.bankAccount.name}
                </Text>
              </Card>
            );
          })
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  type: { fontSize: 14, fontWeight: "700" },
  amount: { color: colors.text, fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  doc: { color: colors.text, fontSize: 14, marginTop: 4 },
  meta: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

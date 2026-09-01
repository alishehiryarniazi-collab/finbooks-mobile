import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { CsvExportButton } from "../../components/ui/CsvExportButton";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { TrialBalanceData } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Trial balance: each account's net in the debit OR credit column, with a balanced check.
export function TrialBalanceScreen() {
  const { data, loading, error } = useFetch<TrialBalanceData>("/reports/trial-balance");

  if (loading) return <Spinner label="Loading…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {data ? (
          <Card>
            {data.rows.map((r, i) => {
              const isDebit = Number(r.debit) > 0;
              return (
                <View key={i} style={styles.row}>
                  <View style={styles.left}>
                    <Text style={styles.name} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <Text style={styles.code}>{r.code}</Text>
                  </View>
                  <Text style={styles.amount}>
                    {isDebit ? "Dr " : "Cr "}
                    {money(isDebit ? r.debit : r.credit)}
                  </Text>
                </View>
              );
            })}

            <View style={styles.totals}>
              <Text style={styles.totalLabel}>Totals</Text>
              <View style={styles.totalRight}>
                <Text style={styles.totalValue}>Dr {money(data.totalDebit)}</Text>
                <Text style={styles.totalValue}>Cr {money(data.totalCredit)}</Text>
              </View>
            </View>
            <Text style={[styles.balanced, { color: data.balanced ? colors.success : colors.danger }]}>
              {data.balanced ? "✓ Balanced" : "✕ Not balanced"}
            </Text>
          </Card>
        ) : null}
        {data ? (
          <View style={{ marginTop: spacing.md }}>
            <CsvExportButton
              filename="trial-balance.csv"
              headers={["Code", "Account", "Type", "Debit", "Credit"]}
              rows={data.rows.map((r) => [r.code, r.name, r.type, r.debit, r.credit])}
            />
          </View>
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  left: { flex: 1 },
  name: { color: colors.text, fontSize: 14 },
  code: { color: colors.textFaint, fontSize: 12 },
  amount: { color: colors.text, fontSize: 14, fontVariant: ["tabular-nums"] },
  totals: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: spacing.md, marginTop: spacing.xs, borderTopWidth: 2, borderTopColor: colors.border },
  totalLabel: { color: colors.mint, fontSize: 14, fontWeight: "700" },
  totalRight: { alignItems: "flex-end", gap: 2 },
  totalValue: { color: colors.mint, fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },
  balanced: { fontSize: 13, fontWeight: "700", textAlign: "right", marginTop: spacing.sm },
});

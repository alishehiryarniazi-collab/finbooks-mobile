import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { AmountRow } from "../../components/ui/AmountRow";
import { CsvExportButton } from "../../components/ui/CsvExportButton";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { ProfitLossData, ReportLine } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Profit & Loss: income section, expense section, and the resulting net profit.
export function ProfitLossScreen() {
  const { data, loading, error } = useFetch<ProfitLossData>("/reports/profit-loss");

  if (loading) return <Spinner label="Loading…" />;

  const section = (title: string, lines: ReportLine[], total: string) => (
    <Card>
      <Text style={styles.section}>{title}</Text>
      {lines.length === 0 ? (
        <Text style={styles.empty}>None</Text>
      ) : (
        lines.map((l, i) => <AmountRow key={l.code} label={l.name} sublabel={l.code} amount={l.amount} divider={i > 0} />)
      )}
      <AmountRow label={`Total ${title}`} amount={total} bold divider />
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {data ? (
          <>
            {section("Income", data.income, data.totalIncome)}
            {section("Expenses", data.expenses, data.totalExpense)}
            <Card style={styles.net}>
              <Text style={styles.netLabel}>Net Profit</Text>
              <Text style={[styles.netValue, { color: Number(data.netProfit) >= 0 ? colors.success : colors.danger }]}>
                {money(data.netProfit)}
              </Text>
            </Card>
            <CsvExportButton
              filename="profit-and-loss.csv"
              headers={["Section", "Code", "Account", "Amount"]}
              rows={[
                ...data.income.map((l) => ["Income", l.code, l.name, l.amount] as (string | number)[]),
                ...data.expenses.map((l) => ["Expense", l.code, l.name, l.amount] as (string | number)[]),
                ["Net profit", "", "", data.netProfit],
              ]}
            />
          </>
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: spacing.xs },
  empty: { color: colors.textFaint, fontSize: 13, paddingVertical: spacing.sm },
  net: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  netLabel: { color: colors.text, fontSize: 16, fontWeight: "700" },
  netValue: { fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
});

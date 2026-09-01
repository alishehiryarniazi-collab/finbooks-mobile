import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { AmountRow } from "../../components/ui/AmountRow";
import { CsvExportButton } from "../../components/ui/CsvExportButton";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { BalanceSheetData, ReportLine } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Balance Sheet as of today. Current-period earnings are folded into equity so it balances.
export function BalanceSheetScreen() {
  const { data, loading, error } = useFetch<BalanceSheetData>("/reports/balance-sheet");

  if (loading) return <Spinner label="Loading…" />;

  const section = (title: string, lines: ReportLine[], total: string, extra?: ReportLine) => (
    <Card>
      <Text style={styles.section}>{title}</Text>
      {lines.map((l, i) => (
        <AmountRow key={l.code} label={l.name} sublabel={l.code} amount={l.amount} divider={i > 0} />
      ))}
      {extra ? <AmountRow label={extra.name} amount={extra.amount} divider={lines.length > 0} /> : null}
      <AmountRow label={`Total ${title}`} amount={total} bold divider />
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {data ? (
          <>
            {section("Assets", data.assets, data.totalAssets)}
            {section("Liabilities", data.liabilities, data.totalLiabilities)}
            {section("Equity", data.equity, data.totalEquity, {
              code: "",
              name: "Current-period earnings",
              amount: data.currentEarnings,
            })}
            <Text style={[styles.balanced, { color: data.balanced ? colors.success : colors.danger }]}>
              {data.balanced
                ? `✓ Balanced — Assets ${money(data.totalAssets)} = Liab + Equity`
                : "✕ Not balanced"}
            </Text>
            <CsvExportButton
              filename="balance-sheet.csv"
              headers={["Section", "Code", "Account", "Amount"]}
              rows={[
                ...data.assets.map((l) => ["Asset", l.code, l.name, l.amount] as (string | number)[]),
                ...data.liabilities.map((l) => ["Liability", l.code, l.name, l.amount] as (string | number)[]),
                ...data.equity.map((l) => ["Equity", l.code, l.name, l.amount] as (string | number)[]),
                ["Equity", "", "Current-period earnings", data.currentEarnings],
                ["Total", "", "Assets", data.totalAssets],
                ["Total", "", "Liabilities", data.totalLiabilities],
                ["Total", "", "Equity", data.totalEquity],
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
  balanced: { fontSize: 13, fontWeight: "700", textAlign: "center" },
});

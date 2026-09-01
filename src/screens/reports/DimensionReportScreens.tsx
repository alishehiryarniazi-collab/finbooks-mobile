import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { CsvExportButton } from "../../components/ui/CsvExportButton";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { DimensionData } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Profit by dimension (cost centre / project): income − expense per row.
function DimensionReport({ url, header }: { url: string; header: string }) {
  const { data, loading, error } = useFetch<DimensionData>(url);
  if (loading) return <Spinner label="Building report…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {data ? (
          data.rows.length === 0 ? (
            <Card><Text style={styles.empty}>Nothing recorded for this dimension yet.</Text></Card>
          ) : (
            <Card>
              <View style={styles.colHead}>
                <Text style={[styles.hLabel, styles.colName]}>{header}</Text>
                <Text style={[styles.hLabel, styles.colAmt]}>Net</Text>
              </View>
              {data.rows.map((r) => (
                <View key={r.id} style={styles.row}>
                  <View style={styles.colName}>
                    <Text style={styles.name} numberOfLines={1}>{r.name}</Text>
                    <Text style={styles.sub}>In {money(r.income)} · Out {money(r.expense)}</Text>
                  </View>
                  <Text style={[styles.net, styles.colAmt, { color: Number(r.net) >= 0 ? colors.success : colors.danger }]}>
                    {money(r.net)}
                  </Text>
                </View>
              ))}
              <View style={[styles.row, styles.totalRow]}>
                <Text style={[styles.totalLabel, styles.colName]}>Total</Text>
                <Text style={[styles.totalVal, styles.colAmt]}>{money(data.totals.net)}</Text>
              </View>
            </Card>
          )
        ) : null}
        {data && data.rows.length > 0 ? (
          <View style={{ marginTop: spacing.md }}>
            <CsvExportButton
              filename={`${header.toLowerCase().replace(/\s+/g, "-")}-report.csv`}
              headers={[header, "Income", "Expense", "Net"]}
              rows={[
                ...data.rows.map((r) => [r.name, r.income, r.expense, r.net] as (string | number)[]),
                ["Total", data.totals.income, data.totals.expense, data.totals.net],
              ]}
            />
          </View>
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function CostCenterReportScreen() {
  return <DimensionReport url="/reports/cost-centers" header="Cost Center" />;
}
export function ProjectReportScreen() {
  return <DimensionReport url="/reports/projects" header="Project" />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  colHead: { flexDirection: "row", paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  hLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  colName: { flex: 1 },
  colAmt: { width: 110, textAlign: "right" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { color: colors.text, fontSize: 14 },
  sub: { color: colors.textFaint, fontSize: 11, marginTop: 1 },
  net: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  totalRow: { borderBottomWidth: 0, borderTopWidth: 2, borderTopColor: colors.border },
  totalLabel: { color: colors.mint, fontSize: 14, fontWeight: "700" },
  totalVal: { color: colors.mint, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

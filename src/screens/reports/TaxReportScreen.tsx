import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { AmountRow } from "../../components/ui/AmountRow";
import { CsvExportButton } from "../../components/ui/CsvExportButton";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { TaxSummaryData } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Net tax = output tax collected on sales − input tax paid on purchases.
export function TaxReportScreen() {
  const { data, loading, error } = useFetch<TaxSummaryData>("/reports/tax-summary");
  if (loading) return <Spinner label="Loading…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {data ? (
          <Card>
            <AmountRow label="Output tax (on sales)" amount={data.outputTax} />
            <AmountRow label="Input tax (on purchases)" amount={data.inputTax} divider />
            <View style={styles.net}>
              <Text style={styles.netLabel}>Net payable</Text>
              <Text style={styles.netValue}>{money(data.netPayable)}</Text>
            </View>
          </Card>
        ) : null}
        {data ? (
          <View style={{ marginTop: spacing.md }}>
            <CsvExportButton
              filename="tax-report.csv"
              headers={["Item", "Amount"]}
              rows={[
                ["Output tax (sales)", data.outputTax],
                ["Input tax (purchases)", data.inputTax],
                ["Net payable", data.netPayable],
              ]}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  net: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 2, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.sm },
  netLabel: { color: colors.mint, fontSize: 16, fontWeight: "700" },
  netValue: { color: colors.mint, fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
});

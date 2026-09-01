import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { CsvExportButton } from "../../components/ui/CsvExportButton";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { AgingData, AgingRow } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Only show buckets that actually have money, so mobile rows stay readable.
const BUCKETS: { key: keyof Omit<AgingRow, "customer" | "vendor">; label: string }[] = [
  { key: "current", label: "Current" },
  { key: "d1_30", label: "1–30" },
  { key: "d31_60", label: "31–60" },
  { key: "d61_90", label: "61–90" },
  { key: "d90_plus", label: "90+" },
];

function AgingReport({ url }: { url: string }) {
  const { data, loading, error } = useFetch<AgingData>(url);
  if (loading) return <Spinner label="Loading…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {data ? (
          data.rows.length === 0 ? (
            <Card>
              <Text style={styles.empty}>Nothing outstanding. 🎉</Text>
            </Card>
          ) : (
            <>
              {data.rows.map((r, i) => {
                const name = r.customer ?? r.vendor ?? "—";
                const buckets = BUCKETS.filter((b) => Number(r[b.key]) > 0);
                return (
                  <Card key={i}>
                    <View style={styles.head}>
                      <Text style={styles.name} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.total}>{money(r.total)}</Text>
                    </View>
                    <View style={styles.buckets}>
                      {buckets.map((b) => (
                        <Text key={b.key} style={styles.bucket}>
                          {b.label}: {money(r[b.key])}
                        </Text>
                      ))}
                    </View>
                  </Card>
                );
              })}
              <Card style={styles.totalsCard}>
                <Text style={styles.name}>Total outstanding</Text>
                <Text style={styles.grand}>{money(data.totals.total)}</Text>
              </Card>
              <CsvExportButton
                filename="aging.csv"
                headers={["Party", "Current", "1-30", "31-60", "61-90", "90+", "Total"]}
                rows={data.rows.map((r) => [
                  r.customer ?? r.vendor ?? "—",
                  r.current, r.d1_30, r.d31_60, r.d61_90, r.d90_plus, r.total,
                ])}
              />
            </>
          )
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function ArAgingScreen() {
  return <AgingReport url="/reports/ar-aging" />;
}
export function ApAgingScreen() {
  return <AgingReport url="/reports/ap-aging" />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  name: { color: colors.text, fontSize: 15, fontWeight: "600", flex: 1 },
  total: { color: colors.text, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  buckets: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.sm },
  bucket: { color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"] },
  totalsCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderColor: colors.mint },
  grand: { color: colors.mint, fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { CsvExportButton } from "../../components/ui/CsvExportButton";
import { useFetch } from "../../hooks/useFetch";
import { money, shortDate } from "../../lib/format";
import type { LedgerData } from "../../lib/types";
import type { BooksStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<BooksStackParamList, "GeneralLedger">;

// Account statement: opening balance, every posting with a running balance, closing balance.
export function GeneralLedgerScreen({ route }: Props) {
  const { accountId, code, name } = route.params;
  const { data, loading, error } = useFetch<LedgerData>(`/journal/ledger/${accountId}`);

  if (loading) return <Spinner label="Loading ledger…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.title}>
            {code} · {name}
          </Text>
          <Text style={styles.subtitle}>General ledger statement</Text>
        </View>

        {error ? <ErrorNote message={error} /> : null}

        {data ? (
          <Card>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Opening balance</Text>
              <Text style={styles.metaValue}>{money(data.opening)}</Text>
            </View>

            {data.rows.length === 0 ? (
              <Text style={styles.empty}>No transactions in this account.</Text>
            ) : (
              data.rows.map((r, i) => (
                <View key={i} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowDesc} numberOfLines={1}>
                      {r.description ?? r.memo ?? r.reference ?? "—"}
                    </Text>
                    <Text style={styles.rowDate}>
                      {shortDate(r.date)}
                      {r.reference ? ` · ${r.reference}` : ""}
                    </Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.dc}>
                      {Number(r.debit) > 0 ? `Dr ${money(r.debit)}` : `Cr ${money(r.credit)}`}
                    </Text>
                    <Text style={styles.bal}>{money(r.balance)}</Text>
                  </View>
                </View>
              ))
            )}

            <View style={[styles.metaRow, styles.closing]}>
              <Text style={styles.closingLabel}>Closing balance</Text>
              <Text style={styles.closingValue}>{money(data.closing)}</Text>
            </View>
          </Card>
        ) : null}
        {data ? (
          <View style={{ marginTop: spacing.md }}>
            <CsvExportButton
              filename={`ledger-${code}.csv`}
              headers={["Date", "Description", "Reference", "Debit", "Credit", "Balance"]}
              rows={[
                ["", "Opening balance", "", "", "", data.opening],
                ...data.rows.map((r) => [
                  shortDate(r.date), r.description ?? r.memo ?? "", r.reference ?? "", r.debit, r.credit, r.balance,
                ] as (string | number)[]),
                ["", "Closing balance", "", "", "", data.closing],
              ]}
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
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { color: colors.mint, fontSize: 18, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
  metaLabel: { color: colors.textMuted, fontSize: 13 },
  metaValue: { color: colors.text, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  rowLeft: { flex: 1, gap: 2 },
  rowDesc: { color: colors.text, fontSize: 14 },
  rowDate: { color: colors.textFaint, fontSize: 12 },
  rowRight: { alignItems: "flex-end", gap: 2 },
  dc: { color: colors.textMuted, fontSize: 13, fontVariant: ["tabular-nums"] },
  bal: { color: colors.text, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  closing: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs },
  closingLabel: { color: colors.mint, fontSize: 14, fontWeight: "700" },
  closingValue: { color: colors.mint, fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  empty: { color: colors.textFaint, fontSize: 14, paddingVertical: spacing.lg, textAlign: "center" },
});

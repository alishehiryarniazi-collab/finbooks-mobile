import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { inputDate, money } from "../../lib/format";
import type { Account, AccountType } from "../../lib/types";
import type { BooksStackParamList } from "../../navigation/types";
import { colors, radius, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<BooksStackParamList, "OpeningBalances">;
const TYPE_ORDER: AccountType[] = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];
const TYPE_LABEL: Record<AccountType, string> = {
  ASSET: "Assets", LIABILITY: "Liabilities", EQUITY: "Equity", INCOME: "Income", EXPENSE: "Expenses",
};

// Enter each account's starting balance in its normal direction; the net difference
// is auto-offset to Opening Balance Equity so the entry balances.
export function OpeningBalancesScreen({ navigation }: Props) {
  const { data, loading } = useFetch<{ accounts: Account[] }>("/accounts");
  const [date, setDate] = useState(inputDate());
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Postable accounts, excluding the auto-managed Opening Balance Equity (3200).
  const accounts = useMemo(
    () => (data?.accounts ?? []).filter((a) => a.isPostable && a.code !== "3200"),
    [data],
  );
  const grouped = useMemo(
    () => TYPE_ORDER.map((ty) => ({ type: ty, rows: accounts.filter((a) => a.type === ty) })).filter((g) => g.rows.length > 0),
    [accounts],
  );
  const netDebit = useMemo(() => {
    let net = 0;
    for (const a of accounts) {
      const amt = Number(amounts[a.id]) || 0;
      net += a.normalBalance === "DEBIT" ? amt : -amt;
    }
    return net;
  }, [accounts, amounts]);

  async function post() {
    setBusy(true);
    setError(null);
    try {
      const lines = accounts
        .map((a) => ({ accountId: a.id, amount: Number(amounts[a.id]) || 0 }))
        .filter((l) => Math.abs(l.amount) > 0);
      if (lines.length === 0) {
        setError("Enter at least one opening balance.");
        setBusy(false);
        return;
      }
      await api.post("/accounts/opening-balances", { date, lines });
      navigation.goBack();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading accounts…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="As-of date" value={date} onChangeText={setDate} autoCapitalize="none" />
        <View style={styles.obe}>
          <Text style={styles.obeLabel}>Opening Balance Equity (auto)</Text>
          <Text style={styles.obeVal}>
            {money(Math.abs(netDebit))} {netDebit > 0 ? "Cr" : netDebit < 0 ? "Dr" : ""}
          </Text>
        </View>

        {grouped.map((g) => (
          <Card key={g.type}>
            <Text style={styles.section}>{TYPE_LABEL[g.type]}</Text>
            {g.rows.map((a) => (
              <View key={a.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.code}>{a.code}</Text>
                  <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textFaint}
                  value={amounts[a.id] ?? ""}
                  onChangeText={(t) => setAmounts((m) => ({ ...m, [a.id]: t }))}
                />
              </View>
            ))}
          </Card>
        ))}

        {error ? <ErrorNote message={error} /> : null}
        <Button title={busy ? "Posting…" : "Post Opening Balances"} onPress={post} loading={busy} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  obe: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  obeLabel: { color: colors.textMuted, fontSize: 12 },
  obeVal: { color: colors.text, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  rowLeft: { flex: 1, flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  code: { color: colors.textFaint, fontSize: 12, width: 40 },
  name: { color: colors.text, fontSize: 14, flex: 1 },
  input: {
    width: 120, backgroundColor: "rgba(255,255,255,0.03)", borderColor: colors.border, borderWidth: 1,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text,
    fontSize: 15, textAlign: "right",
  },
});

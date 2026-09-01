import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { SelectField } from "../../components/ui/SelectField";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { api, apiError, apiErrorCode } from "../../lib/api";
import { useFetch } from "../../hooks/useFetch";
import { inputDate, money } from "../../lib/format";
import type { Account } from "../../lib/types";
import type { BooksStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<BooksStackParamList, "JournalForm">;

interface LineDraft {
  accountId: string | null;
  debit: string;
  credit: string;
  description: string;
}
const emptyLine = (): LineDraft => ({ accountId: null, debit: "", credit: "", description: "" });
type Overrides = { allowNegativeCash?: boolean; allowDuplicateRef?: boolean };

// Manual balanced journal voucher: free-form debit/credit lines that must balance.
export function JournalFormScreen({ navigation }: Props) {
  const { data: acctData } = useFetch<{ accounts: Account[] }>("/accounts");
  const [date, setDate] = useState(inputDate());
  const [memo, setMemo] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine(), emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const accountOptions = useMemo(
    () =>
      (acctData?.accounts ?? [])
        .filter((a) => a.isPostable)
        .map((a) => ({ label: `${a.code} · ${a.name}`, value: a.id })),
    [acctData],
  );

  function updateLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  const totals = useMemo(() => {
    let dr = 0;
    let cr = 0;
    for (const l of lines) {
      dr += Number(l.debit) || 0;
      cr += Number(l.credit) || 0;
    }
    return { dr, cr, balanced: Math.abs(dr - cr) < 0.005 && dr > 0 };
  }, [lines]);

  async function submit(overrides: Overrides = {}) {
    const clean = lines
      .filter((l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0))
      .map((l) => ({
        accountId: l.accountId!,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description.trim() || undefined,
      }));
    if (clean.length < 2) return setError("Add at least two lines with an account and an amount.");
    if (!totals.balanced) return setError("Debits must equal credits (and be greater than zero).");

    setBusy(true);
    setError(null);
    try {
      await api.post("/journal", { date, memo, reference, lines: clean, ...overrides });
      navigation.goBack();
    } catch (err) {
      const code = apiErrorCode(err);
      if (code === "NEGATIVE_CASH" || code === "DUPLICATE_REF") {
        // Confirmable warning — ask, then retry with the matching override set.
        Alert.alert("Please confirm", apiError(err), [
          { text: "Cancel", style: "cancel" },
          {
            text: "Proceed",
            onPress: () =>
              submit({
                ...overrides,
                ...(code === "NEGATIVE_CASH" ? { allowNegativeCash: true } : { allowDuplicateRef: true }),
              }),
          },
        ]);
      } else {
        setError(apiError(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.rowGap}>
          <View style={styles.flex}>
            <Field label="Date" value={date} onChangeText={setDate} autoCapitalize="none" />
          </View>
          <View style={styles.flex}>
            <Field label="Reference" value={reference} onChangeText={setReference} />
          </View>
        </View>
        <Field label="Memo" value={memo} onChangeText={setMemo} />

        <Text style={styles.section}>Lines</Text>
        {lines.map((l, i) => (
          <Card key={i} style={styles.lineCard}>
            <View style={styles.lineHead}>
              <Text style={styles.lineNo}>Line {i + 1}</Text>
              {lines.length > 2 ? (
                <Pressable onPress={() => setLines((p) => p.filter((_, idx) => idx !== i))}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
            <SelectField label="Account" value={l.accountId} options={accountOptions} onChange={(v) => updateLine(i, { accountId: v })} placeholder="Choose account" />
            <View style={styles.rowGap}>
              <View style={styles.flex}>
                <Field label="Debit" value={l.debit} onChangeText={(t) => updateLine(i, { debit: t, credit: "" })} keyboardType="decimal-pad" />
              </View>
              <View style={styles.flex}>
                <Field label="Credit" value={l.credit} onChangeText={(t) => updateLine(i, { credit: t, debit: "" })} keyboardType="decimal-pad" />
              </View>
            </View>
          </Card>
        ))}
        <Button title="+ Add line" variant="ghost" onPress={() => setLines((p) => [...p, emptyLine()])} />

        <Card style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Debits {money(totals.dr)}</Text>
            <Text style={styles.totalLabel}>Credits {money(totals.cr)}</Text>
          </View>
          <Text style={[styles.balanced, { color: totals.balanced ? colors.success : colors.danger }]}>
            {totals.balanced ? "✓ Balanced" : "Debits must equal credits"}
          </Text>
        </Card>

        {error ? <ErrorNote message={error} /> : null}
        <Button title={busy ? "Posting…" : "Post Journal Voucher"} onPress={() => submit()} loading={busy} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  rowGap: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginTop: spacing.sm },
  lineCard: { gap: spacing.md },
  lineHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lineNo: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  remove: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  totals: { gap: spacing.sm },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { color: colors.text, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  balanced: { fontSize: 13, fontWeight: "700" },
});

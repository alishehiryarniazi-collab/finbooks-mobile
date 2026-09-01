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

type Props = NativeStackScreenProps<BooksStackParamList, "VoucherForm">;

interface LineDraft {
  accountId: string | null;
  amount: string;
  description: string;
}
const emptyLine = (): LineDraft => ({ accountId: null, amount: "", description: "" });
type Overrides = { allowNegativeCash?: boolean; allowDuplicateRef?: boolean };

// DEBIT = money paid OUT (Payment voucher); CREDIT = money received IN (Receipt voucher).
// Either way: pick the cash/bank account + one or more counter accounts with amounts.
export function VoucherFormScreen({ route, navigation }: Props) {
  const { kind } = route.params;
  const isReceipt = kind === "CREDIT";
  const title = isReceipt ? "Receipt Voucher" : "Payment Voucher";
  const counterLabel = isReceipt ? "Received from (account)" : "Paid to (account)";

  const { data: acctData } = useFetch<{ accounts: Account[] }>("/accounts");
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(inputDate());
  const [memo, setMemo] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const bankOptions = useMemo(
    () =>
      (acctData?.accounts ?? [])
        .filter((a) => a.type === "ASSET" && a.isPostable)
        .map((a) => ({ label: `${a.code} · ${a.name}`, value: a.id })),
    [acctData],
  );
  const counterOptions = useMemo(
    () => (acctData?.accounts ?? []).filter((a) => a.isPostable).map((a) => ({ label: `${a.code} · ${a.name}`, value: a.id })),
    [acctData],
  );

  function updateLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.amount) || 0), 0), [lines]);

  async function submit(overrides: Overrides = {}) {
    if (!bankAccountId) return setError("Choose the cash/bank account.");
    const clean = lines
      .filter((l) => l.accountId && Number(l.amount) > 0)
      .map((l) => ({ accountId: l.accountId!, amount: Number(l.amount), description: l.description.trim() || undefined }));
    if (clean.length === 0) return setError("Add at least one line with an account and amount.");

    setBusy(true);
    setError(null);
    const url = isReceipt ? "/journal/credit-voucher" : "/journal/debit-voucher";
    try {
      await api.post(url, { date, memo, reference, bankAccountId, lines: clean, ...overrides });
      navigation.goBack();
    } catch (err) {
      const code = apiErrorCode(err);
      if (code === "NEGATIVE_CASH" || code === "DUPLICATE_REF") {
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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{isReceipt ? "Money coming IN to cash/bank." : "Money going OUT of cash/bank."}</Text>

        <SelectField label="Cash / Bank account" value={bankAccountId} options={bankOptions} onChange={setBankAccountId} placeholder="Choose account" />
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
              {lines.length > 1 ? (
                <Pressable onPress={() => setLines((p) => p.filter((_, idx) => idx !== i))}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
            <SelectField label={counterLabel} value={l.accountId} options={counterOptions} onChange={(v) => updateLine(i, { accountId: v })} placeholder="Choose account" />
            <Field label="Amount" value={l.amount} onChangeText={(t) => updateLine(i, { amount: t })} keyboardType="decimal-pad" />
            <Field label="Description (optional)" value={l.description} onChangeText={(t) => updateLine(i, { description: t })} />
          </Card>
        ))}
        <Button title="+ Add line" variant="ghost" onPress={() => setLines((p) => [...p, emptyLine()])} />

        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalVal}>{money(total)}</Text>
        </Card>

        {error ? <ErrorNote message={error} /> : null}
        <Button title={busy ? "Posting…" : `Post ${title}`} onPress={() => submit()} loading={busy} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { color: colors.mint, fontSize: 20, fontWeight: "800" },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: -spacing.xs },
  rowGap: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginTop: spacing.sm },
  lineCard: { gap: spacing.md },
  lineHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lineNo: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  remove: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  totalCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: colors.text, fontSize: 16, fontWeight: "700" },
  totalVal: { color: colors.mint, fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
});

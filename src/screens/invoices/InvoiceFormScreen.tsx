import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { SelectField } from "../../components/ui/SelectField";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { api, apiError } from "../../lib/api";
import { useFetch } from "../../hooks/useFetch";
import { inputDate, inputDatePlus, money } from "../../lib/format";
import type { Account, Customer, Invoice } from "../../lib/types";
import type { SalesStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<SalesStackParamList, "InvoiceForm">;

// One editable invoice line held as strings (text inputs); converted to numbers on submit.
interface LineDraft {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRatePercent: string;
  incomeAccountId: string | null;
  code?: string | null; // account code from a loaded draft, resolved to an id once accounts load
}
const emptyLine = (): LineDraft => ({ description: "", quantity: "1", unitPrice: "", taxRatePercent: "0", incomeAccountId: null });

export function InvoiceFormScreen({ route, navigation }: Props) {
  const editId = route.params?.id;
  const { data: custData } = useFetch<{ customers: Customer[] }>("/customers");
  const { data: acctData } = useFetch<{ accounts: Account[] }>("/accounts");

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState(inputDate());
  const [dueDate, setDueDate] = useState(inputDatePlus(30));
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  const customerOptions = useMemo(
    () => (custData?.customers ?? []).map((c) => ({ label: c.name, value: c.id })),
    [custData],
  );
  const incomeOptions = useMemo(
    () =>
      (acctData?.accounts ?? [])
        .filter((a) => a.type === "INCOME" && a.isPostable)
        .map((a) => ({ label: `${a.code} · ${a.name}`, value: a.id })),
    [acctData],
  );

  // When editing a draft, load it and prefill the form.
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const { data } = await api.get<{ invoice: Invoice }>(`/invoices/${editId}`);
        const inv = data.invoice;
        setCustomerId(inv.customerId);
        setIssueDate(inputDate(inv.issueDate));
        setDueDate(inputDate(inv.dueDate));
        setNotes(inv.notes ?? "");
        setLines(
          (inv.lines ?? []).map((l) => ({
            description: l.description,
            quantity: String(Number(l.quantity)),
            unitPrice: String(Number(l.unitPrice)),
            taxRatePercent: String(Number(l.taxRatePercent)),
            incomeAccountId: null,
            code: l.incomeAccount?.code ?? null, // resolved to an id by the effect below
          })),
        );
      } catch (err) {
        setError(apiError(err));
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [editId]);

  // Prefill each edited line's account by matching its code against the loaded accounts
  // (the invoice detail gives the account's code/name, not its id). Only fills empty picks.
  useEffect(() => {
    if (!acctData) return;
    setLines((prev) =>
      prev.map((l) => {
        if (l.incomeAccountId || !l.code) return l;
        const match = acctData.accounts.find((a) => a.code === l.code);
        return match ? { ...l, incomeAccountId: match.id } : l;
      }),
    );
  }, [acctData]);

  function updateLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }
  function removeLine(i: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  // Live totals preview (backend recomputes authoritatively on save).
  const totals = useMemo(() => {
    let sub = 0;
    let tax = 0;
    for (const l of lines) {
      const lt = (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0);
      sub += lt;
      tax += lt * ((Number(l.taxRatePercent) || 0) / 100);
    }
    return { sub, tax, total: sub + tax };
  }, [lines]);

  async function onSave() {
    if (!customerId) return setError("Choose a customer.");
    const clean = lines
      .filter((l) => l.description.trim() && l.incomeAccountId)
      .map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity) || 0,
        unitPrice: Number(l.unitPrice) || 0,
        taxRatePercent: Number(l.taxRatePercent) || 0,
        incomeAccountId: l.incomeAccountId!,
      }));
    if (clean.length === 0) return setError("Add at least one line with a description and income account.");

    setBusy(true);
    setError(null);
    const payload = { customerId, issueDate, dueDate, notes, lines: clean };
    try {
      if (editId) await api.patch(`/invoices/${editId}`, payload);
      else await api.post("/invoices", payload);
      navigation.goBack();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (loadingEdit) return <Spinner label="Loading invoice…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SelectField label="Customer" value={customerId} options={customerOptions} onChange={setCustomerId} placeholder="Choose a customer" />
        <View style={styles.dates}>
          <View style={styles.flex}>
            <Field label="Issue date" value={issueDate} onChangeText={setIssueDate} autoCapitalize="none" />
          </View>
          <View style={styles.flex}>
            <Field label="Due date" value={dueDate} onChangeText={setDueDate} autoCapitalize="none" />
          </View>
        </View>

        <Text style={styles.section}>Line items</Text>
        {lines.map((l, i) => (
          <Card key={i} style={styles.lineCard}>
            <View style={styles.lineHead}>
              <Text style={styles.lineNo}>Line {i + 1}</Text>
              {lines.length > 1 ? (
                <Pressable onPress={() => removeLine(i)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
            <Field label="Description" value={l.description} onChangeText={(t) => updateLine(i, { description: t })} />
            <View style={styles.triple}>
              <View style={styles.flex}>
                <Field label="Qty" value={l.quantity} onChangeText={(t) => updateLine(i, { quantity: t })} keyboardType="decimal-pad" />
              </View>
              <View style={styles.flex}>
                <Field label="Price" value={l.unitPrice} onChangeText={(t) => updateLine(i, { unitPrice: t })} keyboardType="decimal-pad" />
              </View>
              <View style={styles.flex}>
                <Field label="Tax %" value={l.taxRatePercent} onChangeText={(t) => updateLine(i, { taxRatePercent: t })} keyboardType="decimal-pad" />
              </View>
            </View>
            <SelectField label="Income account" value={l.incomeAccountId} options={incomeOptions} onChange={(v) => updateLine(i, { incomeAccountId: v })} placeholder="Choose account" />
          </Card>
        ))}
        <Button title="+ Add line" variant="ghost" onPress={addLine} />

        <Card style={styles.totals}>
          <Row label="Subtotal" value={money(totals.sub)} />
          <Row label="Tax" value={money(totals.tax)} />
          <Row label="Total" value={money(totals.total)} bold />
        </Card>

        <Field label="Notes" value={notes} onChangeText={setNotes} multiline />
        {error ? <ErrorNote message={error} /> : null}
        <Button title={busy ? "Saving…" : editId ? "Save Changes" : "Create Draft"} onPress={onSave} loading={busy} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  dates: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginTop: spacing.sm },
  lineCard: { gap: spacing.md },
  lineHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lineNo: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  remove: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  triple: { flexDirection: "row", gap: spacing.sm },
  totals: { gap: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontVariant: ["tabular-nums"] },
  bold: { color: colors.mint, fontWeight: "700", fontSize: 16 },
});

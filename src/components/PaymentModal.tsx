import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Field } from "./ui/Field";
import { Button } from "./ui/Button";
import { SelectField } from "./ui/SelectField";
import { api, apiError } from "../lib/api";
import { useFetch } from "../hooks/useFetch";
import { inputDate, money } from "../lib/format";
import type { Account } from "../lib/types";
import { colors, radius, spacing } from "../theme/colors";

interface Props {
  visible: boolean;
  endpoint: string; // "/invoices/:id/payments" | "/bills/:id/payments"
  outstanding: string; // prefill + upper bound
  onClose: () => void;
  onSaved: () => void;
}

// Records a payment against an invoice or a bill: pick the cash/bank account, amount, date.
export function PaymentModal({ visible, endpoint, outstanding, onClose, onSaved }: Props) {
  const { data } = useFetch<{ accounts: Account[] }>("/accounts");
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(inputDate());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Only postable asset accounts (cash/bank) can receive/pay money.
  const bankOptions = useMemo(
    () =>
      (data?.accounts ?? [])
        .filter((a) => a.type === "ASSET" && a.isPostable)
        .map((a) => ({ label: `${a.code} · ${a.name}`, value: a.id })),
    [data],
  );

  useEffect(() => {
    if (!visible) return;
    setAmount(outstanding);
    setDate(inputDate());
    setError(null);
    setBankAccountId(null);
  }, [visible, outstanding]);

  async function onSave() {
    const amt = Number(amount);
    if (!bankAccountId) return setError("Choose a cash/bank account.");
    if (!Number.isFinite(amt) || amt <= 0) return setError("Enter a valid amount.");
    setBusy(true);
    setError(null);
    try {
      await api.post(endpoint, { date, amount: amt, bankAccountId });
      onSaved();
      onClose();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Record Payment</Text>
          <Text style={styles.hint}>Outstanding: {money(outstanding)}</Text>
          <View style={styles.form}>
            <SelectField label="Cash / Bank account" value={bankAccountId} options={bankOptions} onChange={setBankAccountId} />
            <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <Field label="Date (yyyy-mm-dd)" value={date} onChangeText={setDate} autoCapitalize="none" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button title="Cancel" variant="ghost" onPress={onClose} />
              </View>
              <View style={styles.flex}>
                <Button title={busy ? "Saving…" : "Save Payment"} onPress={onSave} loading={busy} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#0d1018", borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderTopWidth: 1, borderColor: colors.border, padding: spacing.lg },
  title: { color: colors.mint, fontSize: 18, fontWeight: "700" },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: 2, marginBottom: spacing.md },
  form: { gap: spacing.md },
  error: { color: colors.danger, fontSize: 14 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  flex: { flex: 1 },
});

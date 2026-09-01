import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Field } from "./ui/Field";
import { Button } from "./ui/Button";
import { SelectField } from "./ui/SelectField";
import { api, apiError } from "../lib/api";
import type { Party } from "../lib/types";
import { colors, radius, spacing } from "../theme/colors";

interface Props {
  visible: boolean;
  endpoint: string; // "/customers" | "/vendors"
  noun: string; // "Customer" | "Vendor"
  editing: Party | null; // null = create
  onClose: () => void;
  onSaved: () => void; // parent refetches the list
}

const METHOD_OPTIONS = [
  { label: "—", value: "" },
  { label: "Bank transfer", value: "BANK" },
  { label: "JazzCash", value: "JAZZCASH" },
  { label: "Easypaisa", value: "EASYPAISA" },
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
];

// Add/edit form for a customer or vendor. Name is required; the rest (incl. the
// beneficiary/bank details used for payments/refunds) are optional.
export function PartyFormModal({ visible, endpoint, noun, editing, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [iban, setIban] = useState("");
  const [raastId, setRaastId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(editing?.name ?? "");
    setEmail(editing?.email ?? "");
    setPhone(editing?.phone ?? "");
    setAddress(editing?.address ?? "");
    setNotes(editing?.notes ?? "");
    setPaymentMethod(editing?.paymentMethod ?? "");
    setBankName(editing?.bankName ?? "");
    setAccountTitle(editing?.accountTitle ?? "");
    setAccountNumber(editing?.accountNumber ?? "");
    setIban(editing?.iban ?? "");
    setRaastId(editing?.raastId ?? "");
    setError(null);
  }, [visible, editing]);

  async function onSave() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      name: name.trim(), email, phone, address, notes,
      paymentMethod, bankName, accountTitle, accountNumber, iban, raastId,
    };
    try {
      if (editing) await api.patch(`${endpoint}/${editing.id}`, payload);
      else await api.post(endpoint, payload);
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
          <Text style={styles.title}>{editing ? `Edit ${noun}` : `New ${noun}`}</Text>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Field label="Name *" value={name} onChangeText={setName} />
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Address" value={address} onChangeText={setAddress} />
            <Field label="Notes" value={notes} onChangeText={setNotes} multiline />

            <Text style={styles.section}>Beneficiary / payment details (optional)</Text>
            <SelectField label="Payment method" value={paymentMethod} options={METHOD_OPTIONS} onChange={setPaymentMethod} />
            <Field label="Bank name" value={bankName} onChangeText={setBankName} />
            <Field label="Account title" value={accountTitle} onChangeText={setAccountTitle} />
            <Field label="Account number" value={accountNumber} onChangeText={setAccountNumber} />
            <Field label="IBAN" value={iban} onChangeText={setIban} autoCapitalize="characters" />
            <Field label="Raast ID" value={raastId} onChangeText={setRaastId} />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button title="Cancel" variant="ghost" onPress={onClose} />
              </View>
              <View style={styles.flex}>
                <Button title={busy ? "Saving…" : "Save"} onPress={onSave} loading={busy} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#0d1018", borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderTopWidth: 1, borderColor: colors.border, maxHeight: "90%", padding: spacing.lg },
  title: { color: colors.mint, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },
  form: { gap: spacing.md, paddingBottom: spacing.lg },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginTop: spacing.sm },
  error: { color: colors.danger, fontSize: 14 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  flex: { flex: 1 },
});

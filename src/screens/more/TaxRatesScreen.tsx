import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { FormSheet } from "../../components/ui/FormSheet";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { TaxRate } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

export function TaxRatesScreen() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";
  const { data, loading, error, refetch } = useFetch<{ taxRates: TaxRate[] }>("/tax-rates");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaxRate | null>(null);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openForm(item: TaxRate | null) {
    setEditing(item);
    setName(item?.name ?? "");
    setRate(item ? String(Number(item.ratePercent)) : "");
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return setFormError("Name is required.");
    setBusy(true);
    setFormError(null);
    const payload = { name: name.trim(), ratePercent: Number(rate) || 0 };
    try {
      if (editing) await api.patch(`/tax-rates/${editing.id}`, payload);
      else await api.post("/tax-rates", payload);
      setOpen(false);
      refetch();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete(item: TaxRate) {
    Alert.alert("Delete tax rate", `Delete "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tax-rates/${item.id}`);
            refetch();
          } catch (err) {
            Alert.alert("Couldn't delete", apiError(err));
          }
        },
      },
    ]);
  }

  if (loading) return <Spinner label="Loading tax rates…" />;
  const rates = data?.taxRates ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>Reusable tax presets for invoices & bills.</Text>
        {canWrite ? <Button title="+ New Tax Rate" onPress={() => openForm(null)} /> : null}
        {error ? <ErrorNote message={error} /> : null}

        {rates.length === 0 ? (
          <Card><Text style={styles.empty}>No tax rates yet.</Text></Card>
        ) : (
          rates.map((r) => (
            <Card key={r.id}>
              <View style={styles.row}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={styles.rate}>{Number(r.ratePercent)}%</Text>
              </View>
              {canWrite ? (
                <View style={styles.actions}>
                  <Pressable onPress={() => openForm(r)}><Text style={styles.edit}>Edit</Text></Pressable>
                  <Pressable onPress={() => confirmDelete(r)}><Text style={styles.delete}>Delete</Text></Pressable>
                </View>
              ) : null}
            </Card>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <FormSheet visible={open} title={editing ? "Edit Tax Rate" : "New Tax Rate"} onClose={() => setOpen(false)} onSave={save} busy={busy} error={formError}>
        <Field label="Name (e.g. GST 17%)" value={name} onChangeText={setName} />
        <Field label="Rate percent" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
      </FormSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  hint: { color: colors.textMuted, fontSize: 13 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rate: { color: colors.mint, fontSize: 15, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  edit: { color: colors.mint, fontSize: 14, fontWeight: "600" },
  delete: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

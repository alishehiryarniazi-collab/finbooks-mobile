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
import type { CostCenter } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Cost centers tag journal/invoice/bill lines so profit can be measured per department.
export function CostCentersScreen() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";
  const { data, loading, error, refetch } = useFetch<{ costCenters: CostCenter[] }>("/cost-centers");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenter | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openForm(item: CostCenter | null) {
    setEditing(item);
    setName(item?.name ?? "");
    setCode(item?.code ?? "");
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return setFormError("Name is required.");
    setBusy(true);
    setFormError(null);
    const payload = { name: name.trim(), code: code.trim() };
    try {
      if (editing) await api.patch(`/cost-centers/${editing.id}`, payload);
      else await api.post("/cost-centers", payload);
      setOpen(false);
      refetch();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete(item: CostCenter) {
    Alert.alert("Delete cost center", `Delete "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/cost-centers/${item.id}`);
            refetch();
          } catch (err) {
            Alert.alert("Couldn't delete", apiError(err));
          }
        },
      },
    ]);
  }

  if (loading) return <Spinner label="Loading cost centers…" />;
  const items = data?.costCenters ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {canWrite ? <Button title="+ New Cost Center" onPress={() => openForm(null)} /> : null}
        {error ? <ErrorNote message={error} /> : null}

        {items.length === 0 ? (
          <Card><Text style={styles.empty}>No cost centers yet.</Text></Card>
        ) : (
          items.map((c) => (
            <Card key={c.id}>
              <Text style={styles.name}>{c.code ? `${c.code} · ` : ""}{c.name}</Text>
              {canWrite ? (
                <View style={styles.actions}>
                  <Pressable onPress={() => openForm(c)}><Text style={styles.edit}>Edit</Text></Pressable>
                  <Pressable onPress={() => confirmDelete(c)}><Text style={styles.delete}>Delete</Text></Pressable>
                </View>
              ) : null}
            </Card>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <FormSheet visible={open} title={editing ? "Edit Cost Center" : "New Cost Center"} onClose={() => setOpen(false)} onSave={save} busy={busy} error={formError}>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Code (optional)" value={code} onChangeText={setCode} />
      </FormSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  actions: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  edit: { color: colors.mint, fontSize: 14, fontWeight: "600" },
  delete: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

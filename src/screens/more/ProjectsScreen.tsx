import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { SelectField } from "../../components/ui/SelectField";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { FormSheet } from "../../components/ui/FormSheet";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Project } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "On hold", value: "ON_HOLD" },
];

// Projects tag lines so profit can be measured per job/project.
export function ProjectsScreen() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";
  const { data, loading, error, refetch } = useFetch<{ projects: Project[] }>("/projects");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openForm(item: Project | null) {
    setEditing(item);
    setName(item?.name ?? "");
    setCode(item?.code ?? "");
    setStatus(item?.status ?? "ACTIVE");
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return setFormError("Name is required.");
    setBusy(true);
    setFormError(null);
    const payload = { name: name.trim(), code: code.trim(), status };
    try {
      if (editing) await api.patch(`/projects/${editing.id}`, payload);
      else await api.post("/projects", payload);
      setOpen(false);
      refetch();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete(item: Project) {
    Alert.alert("Delete project", `Delete "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/projects/${item.id}`);
            refetch();
          } catch (err) {
            Alert.alert("Couldn't delete", apiError(err));
          }
        },
      },
    ]);
  }

  if (loading) return <Spinner label="Loading projects…" />;
  const items = data?.projects ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {canWrite ? <Button title="+ New Project" onPress={() => openForm(null)} /> : null}
        {error ? <ErrorNote message={error} /> : null}

        {items.length === 0 ? (
          <Card><Text style={styles.empty}>No projects yet.</Text></Card>
        ) : (
          items.map((p) => (
            <Card key={p.id}>
              <View style={styles.row}>
                <Text style={styles.name}>{p.code ? `${p.code} · ` : ""}{p.name}</Text>
                <Text style={styles.status}>{p.status}</Text>
              </View>
              {canWrite ? (
                <View style={styles.actions}>
                  <Pressable onPress={() => openForm(p)}><Text style={styles.edit}>Edit</Text></Pressable>
                  <Pressable onPress={() => confirmDelete(p)}><Text style={styles.delete}>Delete</Text></Pressable>
                </View>
              ) : null}
            </Card>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <FormSheet visible={open} title={editing ? "Edit Project" : "New Project"} onClose={() => setOpen(false)} onSave={save} busy={busy} error={formError}>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Code (optional)" value={code} onChangeText={setCode} />
        <SelectField label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
      </FormSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  name: { color: colors.text, fontSize: 15, fontWeight: "600", flex: 1 },
  status: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  edit: { color: colors.mint, fontSize: 14, fontWeight: "600" },
  delete: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

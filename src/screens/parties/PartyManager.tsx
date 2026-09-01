import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { PartyFormModal } from "../../components/PartyFormModal";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Party } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

interface Props {
  title: string;
  endpoint: string; // "/customers" | "/vendors"
  noun: string; // "Customer" | "Vendor"
  dataKey: "customers" | "vendors";
}

// Generic list + add/edit/delete for customers or vendors. Write actions are gated by role.
export function PartyManager({ title, endpoint, noun, dataKey }: Props) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<Record<string, Party[]>>(endpoint);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);

  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";
  const canDelete = user?.role === "ADMIN";
  const parties = data?.[dataKey] ?? [];

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: Party) {
    setEditing(p);
    setFormOpen(true);
  }

  function confirmDelete(p: Party) {
    Alert.alert(`Delete ${noun}`, `Delete "${p.name}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`${endpoint}/${p.id}`);
            refetch();
          } catch (err) {
            Alert.alert("Couldn't delete", apiError(err));
          }
        },
      },
    ]);
  }

  if (loading) return <Spinner label={`Loading ${title.toLowerCase()}…`} />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.count}>
          {parties.length} {parties.length === 1 ? noun.toLowerCase() : title.toLowerCase()}
        </Text>
        {canWrite ? <Button title={`+ New ${noun}`} onPress={openCreate} /> : null}
        {error ? <ErrorNote message={error} /> : null}

        {parties.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No {title.toLowerCase()} yet.</Text>
          </Card>
        ) : (
          parties.map((p) => (
            <Card key={p.id}>
              <Text style={styles.name}>{p.name}</Text>
              {p.email ? <Text style={styles.meta}>{p.email}</Text> : null}
              {p.phone ? <Text style={styles.meta}>{p.phone}</Text> : null}
              {canWrite ? (
                <View style={styles.rowActions}>
                  <Pressable onPress={() => openEdit(p)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </Pressable>
                  {canDelete ? (
                    <Pressable onPress={() => confirmDelete(p)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </Card>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <PartyFormModal
        visible={formOpen}
        endpoint={endpoint}
        noun={noun}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  count: { color: colors.textMuted, fontSize: 13 },
  name: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  rowActions: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  editLink: { color: colors.mint, fontSize: 14, fontWeight: "600" },
  deleteLink: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

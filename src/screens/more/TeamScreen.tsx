import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { PasswordField } from "../../components/ui/PasswordField";
import { SelectField } from "../../components/ui/SelectField";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { FormSheet } from "../../components/ui/FormSheet";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Role, TeamMember } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

const ROLE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Accountant", value: "ACCOUNTANT" },
  { label: "Viewer", value: "VIEWER" },
];
const ACTIVE_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export function TeamScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data, loading, error, refetch } = useFetch<{ users: TeamMember[] }>("/users");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [active, setActive] = useState("true");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setName(""); setEmail(""); setPassword(""); setRole("VIEWER"); setActive("true");
    setFormError(null);
    setOpen(true);
  }
  function openEdit(m: TeamMember) {
    setEditing(m);
    setRole(m.role);
    setActive(m.isActive ? "true" : "false");
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setFormError(null);
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, { role, isActive: active === "true" });
      } else {
        if (!name.trim() || !email.trim() || password.length < 6) {
          setBusy(false);
          return setFormError("Name, email, and a 6+ char password are required.");
        }
        await api.post("/users", { name: name.trim(), email: email.trim(), password, role });
      }
      setOpen(false);
      refetch();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading team…" />;
  const members = data?.users ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {isAdmin ? <Button title="+ Add Member" onPress={openAdd} /> : null}
        {error ? <ErrorNote message={error} /> : null}

        {members.map((m) => (
          <Card key={m.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.name}>{m.name}{m.id === user?.id ? " (you)" : ""}</Text>
                <Text style={styles.email}>{m.email}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.role}>{m.role}</Text>
                <StatusBadge status={m.isActive ? "POSTED" : "VOID"} />
              </View>
            </View>
            {isAdmin && m.id !== user?.id ? (
              <Pressable onPress={() => openEdit(m)} style={styles.editWrap}>
                <Text style={styles.edit}>Edit role / access</Text>
              </Pressable>
            ) : null}
          </Card>
        ))}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <FormSheet
        visible={open}
        title={editing ? `Edit ${editing.name}` : "Add Member"}
        onClose={() => setOpen(false)}
        onSave={save}
        busy={busy}
        error={formError}
      >
        {editing ? (
          <>
            <SelectField label="Role" value={role} options={ROLE_OPTIONS} onChange={(v) => setRole(v as Role)} />
            <SelectField label="Access" value={active} options={ACTIVE_OPTIONS} onChange={setActive} />
          </>
        ) : (
          <>
            <Field label="Name" value={name} onChangeText={setName} />
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <PasswordField label="Password (6+ chars)" value={password} onChangeText={setPassword} />
            <SelectField label="Role" value={role} options={ROLE_OPTIONS} onChange={(v) => setRole(v as Role)} />
          </>
        )}
      </FormSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md },
  flex: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  email: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 4 },
  role: { color: colors.mint, fontSize: 12, fontWeight: "700" },
  editWrap: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  edit: { color: colors.mint, fontSize: 14, fontWeight: "600" },
});

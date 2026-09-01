import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Organization } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// Company profile. ADMINs can edit; everyone else sees it read-only.
export function SettingsScreen() {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN";
  const { data, loading, error } = useFetch<{ organization: Organization }>("/organization");

  const [name, setName] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const o = data?.organization;
    if (!o) return;
    setName(o.name);
    setBaseCurrency(o.baseCurrency);
    setAddress(o.address ?? "");
    setPhone(o.phone ?? "");
    setEmail(o.email ?? "");
  }, [data]);

  async function onSave() {
    setBusy(true);
    setSaveError(null);
    setSaved(false);
    try {
      await api.patch("/organization", { name, baseCurrency, address, phone, email });
      setSaved(true);
    } catch (err) {
      setSaveError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading settings…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <ErrorNote message={error} /> : null}
        <Card style={styles.card}>
          <Field label="Company name" value={name} onChangeText={setName} editable={canEdit} />
          <Field label="Base currency (e.g. USD, PKR)" value={baseCurrency} onChangeText={setBaseCurrency} editable={canEdit} autoCapitalize="characters" />
          <Field label="Address" value={address} onChangeText={setAddress} editable={canEdit} multiline />
          <Field label="Phone" value={phone} onChangeText={setPhone} editable={canEdit} keyboardType="phone-pad" />
          <Field label="Email" value={email} onChangeText={setEmail} editable={canEdit} keyboardType="email-address" autoCapitalize="none" />
        </Card>

        {saveError ? <ErrorNote message={saveError} /> : null}
        {saved ? <Text style={styles.saved}>✓ Saved. Currency changes apply after your next login.</Text> : null}

        {canEdit ? (
          <Button title={busy ? "Saving…" : "Save Changes"} onPress={onSave} loading={busy} />
        ) : (
          <Text style={styles.readonly}>Only an admin can change company settings.</Text>
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { gap: spacing.md },
  saved: { color: colors.success, fontSize: 14 },
  readonly: { color: colors.textMuted, fontSize: 13, fontStyle: "italic", textAlign: "center" },
});

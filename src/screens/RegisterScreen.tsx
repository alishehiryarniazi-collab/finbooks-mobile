import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/ui/Screen";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme/colors";

// Create a brand-new company + admin account, then land straight in the app.
export function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<any>();
  const [organizationName, setOrg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await register({ organizationName: organizationName.trim(), name: name.trim(), email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen center>
      <View style={styles.brand}>
        <Text style={styles.logo}>FinBooks</Text>
        <Text style={styles.subtitle}>Create your company</Text>
      </View>

      <Card style={styles.card}>
        <Field label="Company name" value={organizationName} onChangeText={setOrg} />
        <Field label="Your name" value={name} onChangeText={setName} />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Field label="Password (6+ chars)" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={busy ? "Creating…" : "Create company"} onPress={onSubmit} loading={busy} />
      </Card>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
  logo: { color: colors.mint, fontSize: 30, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  card: { gap: spacing.lg },
  error: { color: colors.danger, fontSize: 14 },
  link: { color: colors.mint, fontSize: 14, textAlign: "center" },
});

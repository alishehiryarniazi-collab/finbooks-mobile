import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/ui/Screen";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { api, apiError } from "../lib/api";
import { colors, spacing } from "../theme/colors";

// Requests a password-reset email. The reset link itself opens the web app
// (backend emails a /reset-password?token=… link), so mobile just kicks it off.
export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen center>
      <View style={styles.brand}>
        <Text style={styles.logo}>FinBooks</Text>
        <Text style={styles.subtitle}>Reset your password</Text>
      </View>

      <Card style={styles.card}>
        {sent ? (
          <Text style={styles.sent}>
            ✓ If an account exists for that email, a reset link has been sent. Open it on the web to set a
            new password.
          </Text>
        ) : (
          <>
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={busy ? "Sending…" : "Send reset link"} onPress={onSubmit} loading={busy} />
          </>
        )}
      </Card>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Back to sign in</Text>
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
  sent: { color: colors.success, fontSize: 14, lineHeight: 20 },
  link: { color: colors.mint, fontSize: 14, textAlign: "center" },
});

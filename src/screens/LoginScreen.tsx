import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/ui/Screen";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme/colors";

// Sign-in screen. Pre-filled with the demo admin so testing on the phone is one tap.
export function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("demo@finbooks.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      // On success the navigator swaps to the app tabs automatically (user is set).
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen center>
      <View style={styles.brand}>
        <Text style={styles.logo}>FinBooks</Text>
        <Text style={styles.subtitle}>Sign in to your books</Text>
      </View>

      <Card style={styles.card}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={busy ? "Signing in…" : "Sign in"} onPress={onSubmit} loading={busy} />
      </Card>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>New here? Create a company</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <Text style={styles.hint}>Demo: demo@finbooks.app / demo1234</Text>
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
  hint: { color: colors.textFaint, fontSize: 12, textAlign: "center" },
});

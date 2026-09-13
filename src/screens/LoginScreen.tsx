import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/ui/Screen";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { PasswordField } from "../components/ui/PasswordField";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { getApiBaseUrl, setApiBaseUrl } from "../lib/api";
import { setStoredApiUrl } from "../storage/apiUrl";
import { colors, radius, spacing } from "../theme/colors";

// Sign-in screen. Pre-filled with the demo admin so testing on the phone is one tap.
export function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Server URL editor (so a changed backend IP can be fixed without rebuilding).
  const [serverOpen, setServerOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());

  async function onSubmit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveServer() {
    const url = serverUrl.trim();
    setApiBaseUrl(url);
    await setStoredApiUrl(url);
    setServerOpen(false);
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
          placeholder="you@company.com"
        />
        <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={busy ? "Signing in…" : "Sign in"} onPress={onSubmit} loading={busy} />
      </Card>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>New here? Create a company</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          setServerUrl(getApiBaseUrl());
          setServerOpen(true);
        }}
      >
        <Text style={styles.serverLink}>⚙️ Server settings</Text>
      </Pressable>

      <Modal visible={serverOpen} transparent animationType="fade" onRequestClose={() => setServerOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Backend server URL</Text>
            <Text style={styles.sheetHint}>
              The address of your FinBooks backend. Include /api. Example: http://192.168.1.20:4001/api
            </Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="http://…:4001/api"
              placeholderTextColor={colors.textFaint}
            />
            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button title="Cancel" variant="ghost" onPress={() => setServerOpen(false)} />
              </View>
              <View style={styles.flex}>
                <Button title="Save" onPress={saveServer} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  serverLink: { color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: spacing.xs },
  hint: { color: colors.textFaint, fontSize: 12, textAlign: "center" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: spacing.lg },
  sheet: { backgroundColor: "#0d1018", borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  sheetTitle: { color: colors.mint, fontSize: 16, fontWeight: "700" },
  sheetHint: { color: colors.textMuted, fontSize: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.03)", borderColor: colors.border, borderWidth: 1,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: 15,
  },
  actions: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
});

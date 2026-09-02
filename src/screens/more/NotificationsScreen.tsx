import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { api, apiError } from "../../lib/api";
import { cancelAllReminders, getScheduledCount, scheduleDailyReminder } from "../../lib/notifications";
import { colors, spacing } from "../../theme/colors";

// Notification controls: a remote-push test, and a local daily "bills due" reminder.
export function NotificationsScreen() {
  const [dailyOn, setDailyOn] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reflect whether a local reminder is already scheduled.
  useEffect(() => {
    getScheduledCount().then((n) => setDailyOn(n > 0)).catch(() => {});
  }, []);

  async function toggleDaily(on: boolean) {
    setDailyOn(on);
    try {
      await cancelAllReminders(); // keep it to a single daily reminder
      if (on) await scheduleDailyReminder("Bills due", "Check today's payments due in FinBooks.", 9, 0);
    } catch (err) {
      Alert.alert("Reminder error", apiError(err));
      setDailyOn(!on);
    }
  }

  async function sendTest() {
    setBusy(true);
    try {
      const { data } = await api.post<{ ok: boolean; sentTo: number }>("/notifications/test");
      Alert.alert(
        "Test sent",
        data.sentTo > 0
          ? `Sent to ${data.sentTo} device(s). It should arrive shortly.`
          : "No registered device found yet. Push tokens only register in a development build (not Expo Go).",
      );
    } catch (err) {
      Alert.alert("Couldn't send", apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.title}>Daily bills-due reminder</Text>
              <Text style={styles.desc}>A local reminder every day at 9:00 AM.</Text>
            </View>
            <Switch value={dailyOn} onValueChange={toggleDaily} trackColor={{ true: colors.teal }} thumbColor={colors.mint} />
          </View>
        </Card>

        <Card>
          <Text style={styles.title}>Test push notification</Text>
          <Text style={styles.desc}>Sends a test to this device to check remote push is working.</Text>
          <View style={{ marginTop: spacing.md }}>
            <Button title={busy ? "Sending…" : "Send test"} onPress={sendTest} loading={busy} />
          </View>
        </Card>

        <Text style={styles.note}>
          Note: notifications only fire in a development/Play-Store build, not in Expo Go.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  rowText: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: "600" },
  desc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  note: { color: colors.textFaint, fontSize: 12, fontStyle: "italic", textAlign: "center", marginTop: spacing.sm },
});

import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { apiError } from "../../lib/api";
import type { MoreStackParamList } from "../../navigation/types";
import { colors, radius, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<MoreStackParamList, "MoreHome">;
type Dest = keyof Omit<MoreStackParamList, "MoreHome">;

const ITEMS: { to: Dest; icon: string; title: string }[] = [
  { to: "Settings", icon: "⚙️", title: "Company Settings" },
  { to: "Team", icon: "👥", title: "Team" },
  { to: "Notifications", icon: "🔔", title: "Notifications" },
  { to: "TaxRates", icon: "🧾", title: "Tax Rates" },
  { to: "CostCenters", icon: "🏷️", title: "Cost Centers" },
  { to: "Projects", icon: "📁", title: "Projects" },
];

export function MoreHomeScreen({ navigation }: Props) {
  const { user, logout, switchCompany } = useAuth();
  const [switchOpen, setSwitchOpen] = useState(false);
  const companies = user?.companies ?? [];
  const canSwitch = companies.length > 1;

  async function pick(orgId: string) {
    setSwitchOpen(false);
    if (orgId === user?.orgId) return;
    try {
      await switchCompany(orgId); // app subtree remounts via orgId key → fresh data
    } catch (err) {
      Alert.alert("Couldn't switch", apiError(err));
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="More" />

        <Card style={styles.profile}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.email}</Text>
          <Text style={styles.meta}>
            {user?.role} · {user?.organization?.name}
          </Text>
          {canSwitch ? (
            <Pressable style={styles.switchBtn} onPress={() => setSwitchOpen(true)}>
              <Text style={styles.switchText}>🔄 Switch company ({companies.length})</Text>
            </Pressable>
          ) : null}
        </Card>

        <Card style={styles.menu}>
          {ITEMS.map((it, i) => (
            <Pressable key={it.to} style={[styles.row, i > 0 && styles.rowBorder]} onPress={() => navigation.navigate(it.to)}>
              <Text style={styles.icon}>{it.icon}</Text>
              <Text style={styles.rowTitle}>{it.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </Card>

        <Button title="Log out" variant="ghost" onPress={logout} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <Modal visible={switchOpen} transparent animationType="fade" onRequestClose={() => setSwitchOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSwitchOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Switch company</Text>
            {companies.map((c) => (
              <Pressable key={c.orgId} style={styles.company} onPress={() => pick(c.orgId)}>
                <Text style={[styles.companyName, c.orgId === user?.orgId && styles.companyActive]}>{c.name}</Text>
                <Text style={styles.companyRole}>{c.role}{c.orgId === user?.orgId ? " · current" : ""}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  profile: { gap: spacing.xs },
  name: { color: colors.text, fontSize: 18, fontWeight: "600" },
  meta: { color: colors.textMuted, fontSize: 13 },
  switchBtn: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  switchText: { color: colors.mint, fontSize: 14, fontWeight: "600" },
  menu: { paddingVertical: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { fontSize: 18 },
  rowTitle: { color: colors.text, fontSize: 15, flex: 1 },
  chevron: { color: colors.textFaint, fontSize: 20 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: spacing.lg },
  sheet: { backgroundColor: "#0d1018", borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  sheetTitle: { color: colors.mint, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  company: { paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  companyName: { color: colors.text, fontSize: 15 },
  companyActive: { color: colors.mint, fontWeight: "700" },
  companyRole: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
});

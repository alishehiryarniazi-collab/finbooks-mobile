import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../components/ui/Card";
import { TrendChart } from "../components/ui/TrendChart";
import { Spinner } from "../components/ui/Spinner";
import { api, apiError } from "../lib/api";
import { money, shortDate } from "../lib/format";
import type { DashboardData } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme/colors";

// KPI tiles to render, mapped to the dashboard payload + an accent colour.
const KPIS = [
  { key: "cash", label: "Cash & Bank", accent: colors.mint },
  { key: "receivable", label: "Receivable", accent: colors.blue },
  { key: "payable", label: "Payable", accent: colors.warning },
  { key: "netProfitThisMonth", label: "Net Profit (mo)", accent: colors.success },
] as const;

export function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<DashboardData>("/reports/dashboard");
      setData(res.data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  if (loading) return <Spinner label="Loading dashboard…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.mint} />}
      >
        <View>
          <Text style={styles.title}>{user?.organization?.name ?? "Dashboard"}</Text>
          <Text style={styles.subtitle}>Here's how your business is doing</Text>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : null}

        {data ? (
          <>
            <View style={styles.kpiGrid}>
              {KPIS.map((k) => (
                <Card key={k.key} style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                  <Text style={[styles.kpiValue, { color: k.accent }]}>{money(data.kpis[k.key])}</Text>
                </Card>
              ))}
            </View>

            <View style={styles.links}>
              <Pressable style={styles.linkWrap} onPress={() => navigation.navigate("PaymentsDue")}>
                <Card style={styles.linkCard}>
                  <Text style={styles.linkIcon}>📅</Text>
                  <Text style={styles.linkText}>Payments Due</Text>
                </Card>
              </Pressable>
              <Pressable style={styles.linkWrap} onPress={() => navigation.navigate("Payments")}>
                <Card style={styles.linkCard}>
                  <Text style={styles.linkIcon}>💸</Text>
                  <Text style={styles.linkText}>All Payments</Text>
                </Card>
              </Pressable>
            </View>

            {data.trend.length > 0 ? (
              <Card>
                <Text style={styles.sectionTitle}>Income vs Expense</Text>
                <TrendChart data={data.trend} />
              </Card>
            ) : null}

            <Card>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              {data.recent.length === 0 ? (
                <Text style={styles.empty}>No activity yet.</Text>
              ) : (
                data.recent.map((r, i) => (
                  <View key={r.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {r.memo ?? r.reference ?? "Journal entry"}
                      </Text>
                      <Text style={styles.rowDate}>{shortDate(r.date)}</Text>
                    </View>
                    <Text style={styles.rowAmount}>{money(r.amount)}</Text>
                  </View>
                ))
              )}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { color: colors.mint, fontSize: 22, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  kpiCard: { flexGrow: 1, flexBasis: "45%", minWidth: 140 },
  kpiLabel: { color: colors.textMuted, fontSize: 13 },
  kpiValue: { fontSize: 20, fontWeight: "700", marginTop: spacing.sm },
  links: { flexDirection: "row", gap: spacing.md },
  linkWrap: { flex: 1 },
  linkCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  linkIcon: { fontSize: 18 },
  linkText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.md, gap: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowLeft: { flex: 1, gap: 2 },
  rowTitle: { color: colors.text, fontSize: 14 },
  rowDate: { color: colors.textFaint, fontSize: 12 },
  rowAmount: { color: colors.text, fontSize: 14, fontWeight: "600" },
  empty: { color: colors.textFaint, fontSize: 14, paddingVertical: spacing.lg, textAlign: "center" },
  errorCard: { borderColor: "rgba(251,113,133,0.4)" },
  errorText: { color: colors.danger, fontSize: 14 },
});

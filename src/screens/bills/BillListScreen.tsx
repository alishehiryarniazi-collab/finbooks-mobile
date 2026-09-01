import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useFetch } from "../../hooks/useFetch";
import { money, shortDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import type { Bill } from "../../lib/types";
import type { PurchasesStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<PurchasesStackParamList, "Bills">;

export function BillListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<{ bills: (Bill & { vendor?: { name: string } })[] }>("/bills");
  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  if (loading) return <Spinner label="Loading bills…" />;
  const bills = data?.bills ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Bills" subtitle="Accounts payable" />

        <View style={styles.topActions}>
          {canWrite ? (
            <View style={styles.flex}>
              <Button title="+ New Bill" onPress={() => navigation.navigate("BillForm", {})} />
            </View>
          ) : null}
          <View style={styles.flex}>
            <Button title="Vendors" variant="ghost" onPress={() => navigation.navigate("Vendors")} />
          </View>
        </View>

        {error ? <ErrorNote message={error} /> : null}

        {bills.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No bills yet.</Text>
          </Card>
        ) : (
          bills.map((b) => (
            <Pressable key={b.id} onPress={() => navigation.navigate("BillView", { id: b.id })}>
              <Card>
                <View style={styles.head}>
                  <Text style={styles.number}>{b.number}</Text>
                  <StatusBadge status={b.status} />
                </View>
                <Text style={styles.vendor}>{b.vendor?.name ?? "—"}</Text>
                <View style={styles.foot}>
                  <Text style={styles.due}>Due {shortDate(b.dueDate)}</Text>
                  <Text style={styles.total}>{money(b.total)}</Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  topActions: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  number: { color: colors.text, fontSize: 16, fontWeight: "700" },
  vendor: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  due: { color: colors.textFaint, fontSize: 12 },
  total: { color: colors.text, fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

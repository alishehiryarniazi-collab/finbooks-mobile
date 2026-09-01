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
import type { Invoice } from "../../lib/types";
import type { SalesStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<SalesStackParamList, "Invoices">;

export function InvoiceListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<{ invoices: (Invoice & { customer?: { name: string } })[] }>(
    "/invoices",
  );
  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";

  // Re-fetch whenever we return to this screen (e.g. after creating/posting an invoice).
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  if (loading) return <Spinner label="Loading invoices…" />;
  const invoices = data?.invoices ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Invoices" subtitle="Accounts receivable" />

        <View style={styles.topActions}>
          {canWrite ? (
            <View style={styles.flex}>
              <Button title="+ New Invoice" onPress={() => navigation.navigate("InvoiceForm", {})} />
            </View>
          ) : null}
          <View style={styles.flex}>
            <Button title="Customers" variant="ghost" onPress={() => navigation.navigate("Customers")} />
          </View>
        </View>

        {error ? <ErrorNote message={error} /> : null}

        {invoices.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No invoices yet.</Text>
          </Card>
        ) : (
          invoices.map((inv) => (
            <Pressable key={inv.id} onPress={() => navigation.navigate("InvoiceView", { id: inv.id })}>
              <Card>
                <View style={styles.head}>
                  <Text style={styles.number}>{inv.number}</Text>
                  <StatusBadge status={inv.status} />
                </View>
                <Text style={styles.customer}>{inv.customer?.name ?? "—"}</Text>
                <View style={styles.foot}>
                  <Text style={styles.due}>Due {shortDate(inv.dueDate)}</Text>
                  <Text style={styles.total}>{money(inv.total)}</Text>
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
  customer: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  due: { color: colors.textFaint, fontSize: 12 },
  total: { color: colors.text, fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  empty: { color: colors.textFaint, fontSize: 14, textAlign: "center", paddingVertical: spacing.lg },
});

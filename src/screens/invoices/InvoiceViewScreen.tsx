import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { AmountRow } from "../../components/ui/AmountRow";
import { PaymentModal } from "../../components/PaymentModal";
import { useFetch } from "../../hooks/useFetch";
import { api, apiError } from "../../lib/api";
import { sharePdf } from "../../lib/share";
import { invoiceHtml } from "../../lib/documentHtml";
import { money, shortDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import type { Invoice, Party } from "../../lib/types";
import type { SalesStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<SalesStackParamList, "InvoiceView">;

export function InvoiceViewScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<{ invoice: Invoice & { customer?: Party } }>(`/invoices/${id}`);
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";
  const inv = data?.invoice;

  // Fires an action endpoint (post/void), then refreshes. `after` can navigate away.
  async function act(path: string, after?: () => void) {
    setBusy(true);
    try {
      await api.post(`/invoices/${id}/${path}`);
      refetch();
      after?.();
    } catch (err) {
      Alert.alert("Action failed", apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSharePdf() {
    try {
      await sharePdf(invoiceHtml(inv!, user?.organization ?? null), `Invoice-${inv!.number}`);
    } catch (err) {
      Alert.alert("Couldn't share", apiError(err));
    }
  }

  function confirmVoid() {
    Alert.alert("Void invoice", "This reverses its ledger entry. Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Void", style: "destructive", onPress: () => act("void") },
    ]);
  }

  function confirmDelete() {
    Alert.alert("Delete draft", "Delete this draft invoice?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/invoices/${id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Couldn't delete", apiError(err));
          }
        },
      },
    ]);
  }

  if (loading) return <Spinner label="Loading invoice…" />;
  if (error || !inv)
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <View style={styles.content}>
          <ErrorNote message={error ?? "Invoice not found."} />
        </View>
      </SafeAreaView>
    );

  const outstanding = (Number(inv.total) - Number(inv.amountPaid)).toFixed(2);
  const isDraft = inv.status === "DRAFT";
  const isOpen = inv.status === "SENT" || inv.status === "PARTIAL";

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headRow}>
          <Text style={styles.number}>{inv.number}</Text>
          <StatusBadge status={inv.status} />
        </View>
        <Text style={styles.customer}>{inv.customer?.name ?? "—"}</Text>
        <Text style={styles.dates}>
          Issued {shortDate(inv.issueDate)} · Due {shortDate(inv.dueDate)}
        </Text>

        {/* Line items */}
        <Card>
          <Text style={styles.section}>Items</Text>
          {inv.lines?.map((l) => (
            <AmountRow
              key={l.id}
              label={l.description}
              sublabel={`${l.quantity} × ${money(l.unitPrice)}${Number(l.taxRatePercent) > 0 ? ` · tax ${l.taxRatePercent}%` : ""}`}
              amount={l.lineTotal}
              divider
            />
          ))}
          <AmountRow label="Subtotal" amount={inv.subtotal} divider />
          <AmountRow label="Tax" amount={inv.taxTotal} />
          <AmountRow label="Total" amount={inv.total} bold divider />
          {Number(inv.amountPaid) > 0 ? <AmountRow label="Paid" amount={inv.amountPaid} /> : null}
          {Number(outstanding) > 0 && inv.status !== "DRAFT" ? (
            <AmountRow label="Outstanding" amount={outstanding} />
          ) : null}
        </Card>

        {/* Share as PDF — available to everyone, any status */}
        <Button title="Share PDF" variant="ghost" onPress={onSharePdf} />

        {/* Actions */}
        {canWrite ? (
          <View style={styles.actions}>
            {isDraft ? (
              <>
                <Button title={busy ? "Posting…" : "Post to Ledger"} onPress={() => act("post")} loading={busy} />
                <Button title="Edit" variant="ghost" onPress={() => navigation.navigate("InvoiceForm", { id: inv.id })} />
                <Button title="Delete Draft" variant="ghost" onPress={confirmDelete} />
              </>
            ) : null}
            {isOpen ? (
              <>
                <Button title="Record Payment" onPress={() => setPayOpen(true)} />
                {Number(inv.amountPaid) === 0 ? <Button title="Void" variant="ghost" onPress={confirmVoid} /> : null}
              </>
            ) : null}
          </View>
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <PaymentModal
        visible={payOpen}
        endpoint={`/invoices/${id}/payments`}
        outstanding={outstanding}
        onClose={() => setPayOpen(false)}
        onSaved={refetch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  number: { color: colors.mint, fontSize: 22, fontWeight: "800" },
  customer: { color: colors.text, fontSize: 16 },
  dates: { color: colors.textFaint, fontSize: 13 },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: spacing.xs },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});

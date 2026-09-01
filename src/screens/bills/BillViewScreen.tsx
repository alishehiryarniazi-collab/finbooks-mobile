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
import { billHtml } from "../../lib/documentHtml";
import { money, shortDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import type { Bill, Party } from "../../lib/types";
import type { PurchasesStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<PurchasesStackParamList, "BillView">;

export function BillViewScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<{ bill: Bill & { vendor?: Party } }>(`/bills/${id}`);
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const canWrite = user?.role === "ADMIN" || user?.role === "ACCOUNTANT";
  const bill = data?.bill;

  async function act(path: string) {
    setBusy(true);
    try {
      await api.post(`/bills/${id}/${path}`);
      refetch();
    } catch (err) {
      Alert.alert("Action failed", apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSharePdf() {
    try {
      await sharePdf(billHtml(bill!, user?.organization ?? null), `Bill-${bill!.number}`);
    } catch (err) {
      Alert.alert("Couldn't share", apiError(err));
    }
  }

  function confirmVoid() {
    Alert.alert("Void bill", "This reverses its ledger entry. Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Void", style: "destructive", onPress: () => act("void") },
    ]);
  }

  function confirmDelete() {
    Alert.alert("Delete draft", "Delete this draft bill?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/bills/${id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Couldn't delete", apiError(err));
          }
        },
      },
    ]);
  }

  if (loading) return <Spinner label="Loading bill…" />;
  if (error || !bill)
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <View style={styles.content}>
          <ErrorNote message={error ?? "Bill not found."} />
        </View>
      </SafeAreaView>
    );

  const outstanding = (Number(bill.total) - Number(bill.amountPaid)).toFixed(2);
  const isDraft = bill.status === "DRAFT";
  const isOpen = bill.status === "OPEN" || bill.status === "PARTIAL";

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headRow}>
          <Text style={styles.number}>{bill.number}</Text>
          <StatusBadge status={bill.status} />
        </View>
        <Text style={styles.vendor}>{bill.vendor?.name ?? "—"}</Text>
        <Text style={styles.dates}>
          Billed {shortDate(bill.billDate)} · Due {shortDate(bill.dueDate)}
        </Text>

        <Card>
          <Text style={styles.section}>Items</Text>
          {bill.lines?.map((l) => (
            <AmountRow
              key={l.id}
              label={l.description}
              sublabel={`${l.quantity} × ${money(l.unitPrice)}${Number(l.taxRatePercent) > 0 ? ` · tax ${l.taxRatePercent}%` : ""}`}
              amount={l.lineTotal}
              divider
            />
          ))}
          <AmountRow label="Subtotal" amount={bill.subtotal} divider />
          <AmountRow label="Tax" amount={bill.taxTotal} />
          <AmountRow label="Total" amount={bill.total} bold divider />
          {Number(bill.amountPaid) > 0 ? <AmountRow label="Paid" amount={bill.amountPaid} /> : null}
          {Number(outstanding) > 0 && bill.status !== "DRAFT" ? <AmountRow label="Outstanding" amount={outstanding} /> : null}
        </Card>

        <Button title="Share PDF" variant="ghost" onPress={onSharePdf} />

        {canWrite ? (
          <View style={styles.actions}>
            {isDraft ? (
              <>
                <Button title={busy ? "Posting…" : "Post to Ledger"} onPress={() => act("post")} loading={busy} />
                <Button title="Edit" variant="ghost" onPress={() => navigation.navigate("BillForm", { id: bill.id })} />
                <Button title="Delete Draft" variant="ghost" onPress={confirmDelete} />
              </>
            ) : null}
            {isOpen ? (
              <>
                <Button title="Record Payment" onPress={() => setPayOpen(true)} />
                {Number(bill.amountPaid) === 0 ? <Button title="Void" variant="ghost" onPress={confirmVoid} /> : null}
              </>
            ) : null}
          </View>
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <PaymentModal
        visible={payOpen}
        endpoint={`/bills/${id}/payments`}
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
  vendor: { color: colors.text, fontSize: 16 },
  dates: { color: colors.textFaint, fontSize: 13 },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: spacing.xs },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});

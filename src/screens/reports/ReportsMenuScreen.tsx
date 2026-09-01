import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import type { ReportsStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<ReportsStackParamList, "ReportsMenu">;
type Dest = keyof Omit<ReportsStackParamList, "ReportsMenu">;

// Each report the app can open, with an icon and a one-line description.
const REPORTS: { to: Dest; icon: string; title: string; desc: string }[] = [
  { to: "Analysis", icon: "🔎", title: "Financial Analysis", desc: "Ratios, health score & insights" },
  { to: "TrialBalance", icon: "⚖️", title: "Trial Balance", desc: "Debits vs credits across accounts" },
  { to: "ProfitLoss", icon: "📈", title: "Profit & Loss", desc: "Income minus expenses" },
  { to: "BalanceSheet", icon: "🏦", title: "Balance Sheet", desc: "Assets, liabilities & equity" },
  { to: "ArAging", icon: "⏳", title: "AR Aging", desc: "Who owes you, by overdue bucket" },
  { to: "ApAging", icon: "⌛", title: "AP Aging", desc: "What you owe, by overdue bucket" },
  { to: "TaxReport", icon: "🧮", title: "Tax Report", desc: "Output vs input tax, net payable" },
  { to: "CostCenterReport", icon: "🏷️", title: "Cost Center Report", desc: "Profit by cost centre" },
  { to: "ProjectReport", icon: "📁", title: "Project Report", desc: "Profit by project" },
];

export function ReportsMenuScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Reports" subtitle="Everything computed from the ledger" />
        {REPORTS.map((r) => (
          <Pressable key={r.to} onPress={() => navigation.navigate(r.to)}>
            <Card style={styles.card}>
              <Text style={styles.icon}>{r.icon}</Text>
              <View style={styles.text}>
                <Text style={styles.title}>{r.title}</Text>
                <Text style={styles.desc}>{r.desc}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Card>
          </Pressable>
        ))}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  icon: { fontSize: 22 },
  text: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: "600" },
  desc: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  chevron: { color: colors.textFaint, fontSize: 22 },
});

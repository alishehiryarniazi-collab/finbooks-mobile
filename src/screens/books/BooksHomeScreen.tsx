import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import type { BooksStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

type Props = NativeStackScreenProps<BooksStackParamList, "BooksHome">;
type Dest = "Accounts" | "Journal" | "OpeningBalances";

const ITEMS: { to: Dest; icon: string; title: string; desc: string }[] = [
  { to: "Accounts", icon: "📚", title: "Chart of Accounts", desc: "All accounts & balances; tap for the ledger" },
  { to: "Journal", icon: "📗", title: "Vouchers & Journal", desc: "Receipts, payments & journal entries" },
  { to: "OpeningBalances", icon: "🎯", title: "Opening Balances", desc: "Set starting balances when going live" },
];

// The Books hub — the entry point for bookkeeping (accounts + vouchers).
export function BooksHomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Books" subtitle="Your accounts and vouchers" />
        {ITEMS.map((it) => (
          <Pressable key={it.to} onPress={() => navigation.navigate(it.to)}>
            <Card style={styles.card}>
              <Text style={styles.icon}>{it.icon}</Text>
              <View style={styles.text}>
                <Text style={styles.title}>{it.title}</Text>
                <Text style={styles.desc}>{it.desc}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: { fontSize: 24 },
  text: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: "600" },
  desc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: colors.textFaint, fontSize: 22 },
});

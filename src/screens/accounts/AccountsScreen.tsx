import { Fragment } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { Account, AccountType } from "../../lib/types";
import type { BooksStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme/colors";

const TYPE_ORDER: AccountType[] = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];
const TYPE_LABEL: Record<AccountType, string> = {
  ASSET: "Assets",
  LIABILITY: "Liabilities",
  EQUITY: "Equity",
  INCOME: "Income",
  EXPENSE: "Expenses",
};

type Props = NativeStackScreenProps<BooksStackParamList, "Accounts">;

// Chart of accounts grouped by type. Detail (postable) accounts are tappable and
// open their general-ledger statement; group rows are just headers with a roll-up.
export function AccountsScreen({ navigation }: Props) {
  const { data, loading, error } = useFetch<{ accounts: Account[] }>("/accounts");

  if (loading) return <Spinner label="Loading accounts…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>Tap a detail account to see its ledger</Text>
        {error ? <ErrorNote message={error} /> : null}

        {data
          ? TYPE_ORDER.map((type) => {
              const rows = data.accounts.filter((a) => a.type === type);
              if (rows.length === 0) return null;
              return (
                <Card key={type}>
                  <Text style={styles.section}>{TYPE_LABEL[type]}</Text>
                  {rows.map((a) => (
                    <Fragment key={a.id}>
                      {a.isPostable ? (
                        <Pressable
                          style={styles.row}
                          onPress={() =>
                            navigation.navigate("GeneralLedger", { accountId: a.id, code: a.code, name: a.name })
                          }
                        >
                          <Text style={styles.code}>{a.code}</Text>
                          <Text style={styles.name} numberOfLines={1}>
                            {a.name}
                          </Text>
                          <Text style={styles.amount}>{money(a.balance)}</Text>
                        </Pressable>
                      ) : (
                        <View style={[styles.row, styles.groupRow]}>
                          <Text style={styles.code}>{a.code}</Text>
                          <Text style={[styles.name, styles.groupName]} numberOfLines={1}>
                            {a.name}
                          </Text>
                        </View>
                      )}
                    </Fragment>
                  ))}
                </Card>
              );
            })
          : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  hint: { color: colors.textMuted, fontSize: 13 },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  groupRow: { opacity: 0.7 },
  code: { color: colors.textFaint, fontSize: 12, width: 44, fontVariant: ["tabular-nums"] },
  name: { color: colors.text, fontSize: 14, flex: 1 },
  groupName: { fontWeight: "700" },
  amount: { color: colors.text, fontSize: 14, fontVariant: ["tabular-nums"] },
});

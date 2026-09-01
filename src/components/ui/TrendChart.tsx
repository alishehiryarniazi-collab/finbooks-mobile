import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";

interface Point {
  month: string; // "YYYY-MM"
  income: string;
  expense: string;
}

const MAX_BAR = 120; // px height for the tallest bar

// A lightweight income-vs-expense bar chart drawn with plain Views (no chart library,
// so nothing to break on a new SDK). Bars scale to the largest value in the series.
export function TrendChart({ data }: { data: Point[] }) {
  const values = data.flatMap((d) => [Number(d.income) || 0, Number(d.expense) || 0]);
  const max = Math.max(1, ...values); // avoid divide-by-zero on empty books

  return (
    <View>
      <View style={styles.chart}>
        {data.map((d) => {
          const inc = Number(d.income) || 0;
          const exp = Number(d.expense) || 0;
          return (
            <View key={d.month} style={styles.group}>
              <View style={styles.bars}>
                <View style={[styles.bar, { height: (inc / max) * MAX_BAR, backgroundColor: colors.mint }]} />
                <View style={[styles.bar, { height: (exp / max) * MAX_BAR, backgroundColor: colors.violet }]} />
              </View>
              <Text style={styles.month}>{d.month.slice(5)}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.mint }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.violet }]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: MAX_BAR + 20 },
  group: { flex: 1, alignItems: "center", gap: spacing.xs },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: MAX_BAR },
  bar: { width: 10, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 2 },
  month: { color: colors.textFaint, fontSize: 10 },
  legend: { flexDirection: "row", justifyContent: "center", gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { color: colors.textMuted, fontSize: 12 },
});

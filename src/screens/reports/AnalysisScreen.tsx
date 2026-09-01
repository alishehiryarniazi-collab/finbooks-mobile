import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorNote } from "../../components/ui/ErrorNote";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../lib/format";
import type { AnalysisData } from "../../lib/types";
import { colors, spacing } from "../../theme/colors";

// The backend sends insights as i18n keys + params (so the web can localise). The mobile
// app has no i18n yet, so we render them from a small English template map here.
const INSIGHT_TEXT: Record<string, (p: Record<string, string>) => string> = {
  "analysis.ins.netMarginHealthy": (p) => `Healthy net margin of ${p.pct}%`,
  "analysis.ins.netMarginThin": (p) => `Thin net margin of ${p.pct}%`,
  "analysis.ins.netMarginLoss": (p) => `Operating at a loss (${p.pct}% margin)`,
  "analysis.ins.liquidityStrong": (p) => `Strong liquidity — current ratio ${p.ratio}`,
  "analysis.ins.liquidityAdequate": (p) => `Adequate liquidity — current ratio ${p.ratio}`,
  "analysis.ins.liquidityTight": (p) => `Tight liquidity — current ratio ${p.ratio}`,
  "analysis.ins.receivablesHigh": (p) => `Receivables are ${p.pct}% of revenue`,
  "analysis.ins.cashMonths": (p) => `~${p.months} months of expenses in cash`,
  "analysis.ins.debtToEquity": (p) => `Debt-to-equity is ${p.ratio}`,
  "analysis.ins.netUp": (p) => `Net result up by ${p.amount} vs last month`,
  "analysis.ins.netDown": (p) => `Net result down by ${p.amount} vs last month`,
};

const TONE_COLOR = { good: colors.success, warn: colors.warning, info: colors.blue } as const;

// Ratios we surface, with how to format each value.
const RATIOS: { key: string; label: string; kind: "ratio" | "pct" | "days" }[] = [
  { key: "currentRatio", label: "Current ratio", kind: "ratio" },
  { key: "quickRatio", label: "Quick ratio", kind: "ratio" },
  { key: "grossMarginPct", label: "Gross margin", kind: "pct" },
  { key: "netMarginPct", label: "Net margin", kind: "pct" },
  { key: "returnOnEquityPct", label: "Return on equity", kind: "pct" },
  { key: "debtToEquity", label: "Debt to equity", kind: "ratio" },
  { key: "arDays", label: "AR days", kind: "days" },
  { key: "apDays", label: "AP days", kind: "days" },
];

function fmtRatio(v: number | null, kind: "ratio" | "pct" | "days") {
  if (v === null || v === undefined) return "—";
  if (kind === "pct") return `${v.toFixed(1)}%`;
  if (kind === "days") return `${Math.round(v)}d`;
  return v.toFixed(2);
}

export function AnalysisScreen() {
  const { data, loading, error } = useFetch<AnalysisData>("/reports/analysis");
  if (loading) return <Spinner label="Analysing…" />;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <ErrorNote message={error} /> : null}
        {data ? (
          <>
            {/* Health score */}
            <Card style={styles.healthCard}>
              <Text style={styles.healthLabel}>Financial health</Text>
              <Text style={[styles.healthScore, { color: healthColor(data.healthScore) }]}>
                {data.healthScore}
                <Text style={styles.healthMax}> / 100</Text>
              </Text>
            </Card>

            {/* KPIs */}
            <View style={styles.kpiGrid}>
              <Kpi label="Revenue" value={money(data.kpis.revenue)} />
              <Kpi label="Net profit" value={money(data.kpis.netProfit)} />
              <Kpi label="Cash" value={money(data.kpis.cash)} />
              <Kpi label="Equity" value={money(data.kpis.equity)} />
            </View>

            {/* Insights */}
            {data.insights.length > 0 ? (
              <Card>
                <Text style={styles.section}>Insights</Text>
                {data.insights.map((ins, i) => {
                  const render = INSIGHT_TEXT[ins.key];
                  const text = render ? render(ins.params) : ins.key;
                  return (
                    <View key={i} style={styles.insight}>
                      <View style={[styles.dot, { backgroundColor: TONE_COLOR[ins.tone] }]} />
                      <Text style={styles.insightText}>{text}</Text>
                    </View>
                  );
                })}
              </Card>
            ) : null}

            {/* Ratios */}
            <Card>
              <Text style={styles.section}>Key ratios</Text>
              <View style={styles.ratioGrid}>
                {RATIOS.map((r) => (
                  <View key={r.key} style={styles.ratioCell}>
                    <Text style={styles.ratioLabel}>{r.label}</Text>
                    <Text style={styles.ratioValue}>{fmtRatio(data.ratios[r.key] ?? null, r.kind)}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </Card>
  );
}

function healthColor(score: number) {
  if (score >= 70) return colors.success;
  if (score >= 40) return colors.warning;
  return colors.danger;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  healthCard: { alignItems: "center" },
  healthLabel: { color: colors.textMuted, fontSize: 13 },
  healthScore: { fontSize: 44, fontWeight: "800", marginTop: spacing.xs },
  healthMax: { fontSize: 16, fontWeight: "600", color: colors.textFaint },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  kpiCard: { flexGrow: 1, flexBasis: "45%", minWidth: 140 },
  kpiLabel: { color: colors.textMuted, fontSize: 13 },
  kpiValue: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: spacing.xs, fontVariant: ["tabular-nums"] },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: spacing.sm },
  insight: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  insightText: { color: colors.text, fontSize: 14, flex: 1 },
  ratioGrid: { flexDirection: "row", flexWrap: "wrap" },
  ratioCell: { width: "50%", paddingVertical: spacing.sm },
  ratioLabel: { color: colors.textMuted, fontSize: 12 },
  ratioValue: { color: colors.text, fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
});

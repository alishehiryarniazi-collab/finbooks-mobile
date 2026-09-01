import { useState } from "react";
import { Alert } from "react-native";
import { Button } from "./Button";
import { toCsv } from "../../lib/csv";
import { shareCsv } from "../../lib/share";

interface Props {
  filename: string; // e.g. "trial-balance.csv"
  headers: string[];
  rows: (string | number)[][];
}

// Builds a CSV from headers + rows and opens the OS share sheet. Reused across reports.
export function CsvExportButton({ filename, headers, rows }: Props) {
  const [busy, setBusy] = useState(false);
  async function onPress() {
    setBusy(true);
    try {
      await shareCsv(filename, toCsv(headers, rows));
    } catch (err) {
      Alert.alert("Export failed", err instanceof Error ? err.message : "Could not export CSV.");
    } finally {
      setBusy(false);
    }
  }
  return <Button title={busy ? "Exporting…" : "Export CSV"} variant="ghost" onPress={onPress} loading={busy} />;
}

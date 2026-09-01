// Minimal CSV builder. Quotes any field containing a comma, quote, or newline.
function esc(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

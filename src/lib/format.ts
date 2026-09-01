// Formatting helpers. Money values arrive from the API as fixed-2 strings
// (e.g. "1234.50") so we never do float math on the client.

// The active currency is set once from the logged-in org (see AuthContext), so
// every money() call formats in the company's currency instead of a fixed USD.
let activeCurrency = "USD";
export function setActiveCurrency(code?: string | null) {
  if (code) activeCurrency = code;
}

export function money(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(n) ? n : 0;
  try {
    // Hermes ships Intl, but guard anyway in case a currency code is unusual.
    return safe.toLocaleString(undefined, { style: "currency", currency: activeCurrency });
  } catch {
    return `${activeCurrency} ${safe.toFixed(2)}`;
  }
}

export function shortDate(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—"; // guard bad/missing dates
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// yyyy-mm-dd for date text inputs (default value + what the API expects).
export function inputDate(value?: string | Date): string {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

// Adds `days` to today and returns yyyy-mm-dd (e.g. a default due date 30 days out).
export function inputDatePlus(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

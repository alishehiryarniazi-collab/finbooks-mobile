import { money, shortDate } from "./format";
import type { Bill, DocumentLine, Invoice, Organization } from "./types";

// Escape user text before dropping it into the PDF HTML.
function h(s: string | null | undefined): string {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}

function lineRows(lines: DocumentLine[] = []): string {
  return lines
    .map(
      (l) => `<tr>
        <td>${h(l.description)}</td>
        <td class="r">${Number(l.quantity)}</td>
        <td class="r">${money(l.unitPrice)}</td>
        <td class="r">${Number(l.taxRatePercent) > 0 ? `${l.taxRatePercent}%` : "—"}</td>
        <td class="r">${money(l.lineTotal)}</td>
      </tr>`,
    )
    .join("");
}

// One printable A4 document (light theme — PDFs print on white paper).
function docHtml(opts: {
  org: Organization | null;
  title: string;
  number: string;
  partyLabel: string;
  partyName: string;
  dateLabel: string;
  dateValue: string;
  dueValue: string;
  lines: DocumentLine[];
  subtotal: string;
  taxTotal: string;
  total: string;
  amountPaid: string;
  notes: string | null;
}): string {
  const outstanding = (Number(opts.total) - Number(opts.amountPaid)).toFixed(2);
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Roboto, Arial, sans-serif; color: #111; padding: 28px; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .company { font-size: 20px; font-weight: 800; }
    .muted { color: #666; font-size: 12px; line-height: 1.5; }
    h1 { font-size: 26px; margin: 0 0 4px; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
    th { color: #666; font-size: 11px; text-transform: uppercase; }
    .r { text-align: right; }
    .totals { margin-top: 16px; margin-left: auto; width: 260px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { font-weight: 800; font-size: 15px; border-top: 2px solid #111; margin-top: 4px; padding-top: 8px; }
    .notes { margin-top: 24px; font-size: 12px; color: #444; }
  </style></head><body>
    <div class="top">
      <div>
        <div class="company">${h(opts.org?.name) || "FinBooks"}</div>
        <div class="muted">${h(opts.org?.address)}<br/>${h(opts.org?.phone)} ${h(opts.org?.email)}</div>
      </div>
      <div style="text-align:right">
        <h1>${opts.title}</h1>
        <div class="muted">#${h(opts.number)}</div>
      </div>
    </div>
    <div class="muted">
      <strong>${opts.partyLabel}:</strong> ${h(opts.partyName)}<br/>
      ${opts.dateLabel}: ${shortDate(opts.dateValue)} · Due: ${shortDate(opts.dueValue)}
    </div>
    <table>
      <thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Tax</th><th class="r">Amount</th></tr></thead>
      <tbody>${lineRows(opts.lines)}</tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${money(opts.subtotal)}</span></div>
      <div><span>Tax</span><span>${money(opts.taxTotal)}</span></div>
      <div class="grand"><span>Total</span><span>${money(opts.total)}</span></div>
      ${Number(opts.amountPaid) > 0 ? `<div><span>Paid</span><span>${money(opts.amountPaid)}</span></div><div><span>Outstanding</span><span>${money(outstanding)}</span></div>` : ""}
    </div>
    ${opts.notes ? `<div class="notes"><strong>Notes:</strong> ${h(opts.notes)}</div>` : ""}
  </body></html>`;
}

export function invoiceHtml(inv: Invoice & { customer?: { name: string } }, org: Organization | null): string {
  return docHtml({
    org, title: "INVOICE", number: inv.number,
    partyLabel: "Bill to", partyName: inv.customer?.name ?? "—",
    dateLabel: "Issued", dateValue: inv.issueDate, dueValue: inv.dueDate,
    lines: inv.lines ?? [], subtotal: inv.subtotal, taxTotal: inv.taxTotal, total: inv.total,
    amountPaid: inv.amountPaid, notes: inv.notes,
  });
}

export function billHtml(bill: Bill & { vendor?: { name: string } }, org: Organization | null): string {
  return docHtml({
    org, title: "BILL", number: bill.number,
    partyLabel: "From", partyName: bill.vendor?.name ?? "—",
    dateLabel: "Billed", dateValue: bill.billDate, dueValue: bill.dueDate,
    lines: bill.lines ?? [], subtotal: bill.subtotal, taxTotal: bill.taxTotal, total: bill.total,
    amountPaid: bill.amountPaid, notes: bill.notes,
  });
}

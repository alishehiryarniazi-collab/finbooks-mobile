// Types shared with the backend API. Kept as a focused subset of the web app's
// frontend/src/lib/types.ts — we'll grow this as more screens are ported.

export type Role = "ADMIN" | "ACCOUNTANT" | "VIEWER";

export interface Organization {
  id: string;
  name: string;
  baseCurrency: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoDataUrl: string | null;
}

export interface CompanyRef {
  orgId: string;
  name: string;
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role; // role in the ACTIVE company
  orgId: string; // active company
  organization: Organization | null;
  companies: CompanyRef[]; // companies this user can switch between
}

// --- Dashboard (GET /reports/dashboard) ------------------------------------
export interface DashboardData {
  kpis: {
    cash: string;
    receivable: string;
    payable: string;
    netProfitThisMonth: string;
    incomeThisMonth: string;
    expenseThisMonth: string;
  };
  trend: { month: string; income: string; expense: string }[];
  recent: {
    id: string;
    date: string;
    memo: string | null;
    reference: string | null;
    amount: string;
  }[];
}

// --- Settings entities -----------------------------------------------------
export interface TaxRate {
  id: string;
  name: string;
  ratePercent: string;
  isActive: boolean;
}
export interface CostCenter {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
}
export interface Project {
  id: string;
  name: string;
  code: string | null;
  status: string; // ACTIVE | COMPLETED | ON_HOLD
  isActive: boolean;
}
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

// --- Journal / Vouchers ----------------------------------------------------
export type VoucherType = "JOURNAL" | "DEBIT" | "CREDIT";

export interface JournalLineView {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
  description: string | null;
  account?: { code: string; name: string };
}

export interface JournalEntry {
  id: string;
  date: string;
  memo: string | null;
  reference: string | null;
  status: "DRAFT" | "POSTED" | "VOID";
  source: string;
  voucherType: VoucherType;
  lines: JournalLineView[];
  createdBy?: { name: string };
}

// --- Chart of Accounts (GET /accounts) -------------------------------------
export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: string | null;
  normalBalance: "DEBIT" | "CREDIT";
  parentId: string | null;
  isPostable: boolean;
  isActive: boolean;
  debit: string;
  credit: string;
  balance: string;
}

// --- General Ledger (GET /journal/ledger/:accountId) ------------------------
export interface LedgerRow {
  date: string;
  memo: string | null;
  reference: string | null;
  voucherType: string;
  description: string | null;
  debit: string;
  credit: string;
  balance: string;
}
export interface LedgerData {
  account: { id: string; code: string; name: string; type: AccountType; normalBalance: string };
  opening: string;
  rows: LedgerRow[];
  closing: string;
}

// --- Reports ---------------------------------------------------------------
export interface TrialBalanceData {
  rows: { code: string; name: string; type: string; debit: string; credit: string }[];
  totalDebit: string;
  totalCredit: string;
  balanced: boolean;
}

// Line shared by P&L and Balance Sheet sections.
export interface ReportLine {
  code: string;
  name: string;
  amount: string;
}

export interface ProfitLossData {
  income: ReportLine[];
  expenses: ReportLine[];
  totalIncome: string;
  totalExpense: string;
  netProfit: string;
}

export interface BalanceSheetData {
  assets: ReportLine[];
  liabilities: ReportLine[];
  equity: ReportLine[];
  currentEarnings: string;
  totalAssets: string;
  totalLiabilities: string;
  totalEquity: string;
  balanced: boolean;
}

export interface AgingRow {
  customer?: string;
  vendor?: string;
  current: string;
  d1_30: string;
  d31_60: string;
  d61_90: string;
  d90_plus: string;
  total: string;
}
export interface AgingData {
  rows: AgingRow[];
  totals: Omit<AgingRow, "customer" | "vendor">;
}

export interface TaxSummaryData {
  outputTax: string;
  inputTax: string;
  netPayable: string;
}

export interface AnalysisData {
  kpis: { revenue: string; netProfit: string; cash: string; equity: string };
  ratios: Record<string, number | null>;
  healthScore: number;
  trend: { month: string; income: string; expense: string; net: string }[];
  insights: { key: string; params: Record<string, string>; tone: "good" | "warn" | "info" }[];
}

// --- Parties (customers / vendors) -----------------------------------------
export interface Party {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  // Beneficiary / payment details (all optional) — where to send/refund money.
  paymentMethod?: string | null; // BANK | JAZZCASH | EASYPAISA | CASH | CHEQUE
  bankName?: string | null;
  accountTitle?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  raastId?: string | null;
}
export type Customer = Party;
export type Vendor = Party;

// --- Payments (GET /payments) ----------------------------------------------
export interface Payment {
  id: string;
  type: "RECEIVED" | "MADE";
  date: string;
  amount: string;
  method: string | null;
  reference: string | null;
  bankAccount: { code: string; name: string };
  allocations: { invoice?: { number: string } | null; bill?: { number: string } | null; amount: string }[];
}

// --- Dimension reports (cost centre / project P&L) -------------------------
export interface DimensionRow {
  id: string;
  name: string;
  income: string;
  expense: string;
  net: string;
}
export interface DimensionData {
  rows: DimensionRow[];
  totals: { income: string; expense: string; net: string };
}

// --- Invoices & Bills ------------------------------------------------------
export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "VOID";
export type BillStatus = "DRAFT" | "OPEN" | "PARTIAL" | "PAID" | "VOID";

export interface DocumentLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRatePercent: string;
  lineTotal: string;
  incomeAccount?: { code: string; name: string };
  expenseAccount?: { code: string; name: string };
}

export interface Invoice {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: string;
  taxTotal: string;
  total: string;
  amountPaid: string;
  notes: string | null;
  customerId: string;
  customer?: { name: string } | Party;
  lines?: DocumentLine[];
}

export interface Bill {
  id: string;
  number: string;
  billDate: string;
  dueDate: string;
  status: BillStatus;
  subtotal: string;
  taxTotal: string;
  total: string;
  amountPaid: string;
  notes: string | null;
  vendorId: string;
  vendor?: { name: string } | Party;
  lines?: DocumentLine[];
}

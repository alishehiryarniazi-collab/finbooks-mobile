// Navigation param lists — one per stack. Centralising these gives every screen
// type-safe route params and navigation calls.

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Payments: undefined;
  PaymentsDue: undefined;
};

export type BooksStackParamList = {
  BooksHome: undefined;
  Accounts: undefined;
  OpeningBalances: undefined;
  GeneralLedger: { accountId: string; code: string; name: string };
  Journal: undefined;
  JournalView: { id: string };
  JournalForm: undefined; // manual balanced journal voucher
  VoucherForm: { kind: "DEBIT" | "CREDIT" }; // cash/bank payment or receipt voucher
};

export type SalesStackParamList = {
  Invoices: undefined;
  InvoiceView: { id: string };
  InvoiceForm: { id?: string }; // id present = edit a draft, absent = create
  Customers: undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Settings: undefined;
  Team: undefined;
  TaxRates: undefined;
  CostCenters: undefined;
  Projects: undefined;
  Notifications: undefined;
};

export type PurchasesStackParamList = {
  Bills: undefined;
  BillView: { id: string };
  BillForm: { id?: string };
  Vendors: undefined;
};

export type ReportsStackParamList = {
  ReportsMenu: undefined;
  TrialBalance: undefined;
  ProfitLoss: undefined;
  BalanceSheet: undefined;
  ArAging: undefined;
  ApAging: undefined;
  TaxReport: undefined;
  Analysis: undefined;
  CostCenterReport: undefined;
  ProjectReport: undefined;
};

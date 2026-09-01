import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/Spinner";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { PaymentsScreen } from "../screens/money/PaymentsScreen";
import { PaymentsDueScreen } from "../screens/money/PaymentsDueScreen";
import { OpeningBalancesScreen } from "../screens/accounts/OpeningBalancesScreen";
import { CostCenterReportScreen, ProjectReportScreen } from "../screens/reports/DimensionReportScreens";
import { MoreHomeScreen } from "../screens/more/MoreHomeScreen";
import { SettingsScreen } from "../screens/more/SettingsScreen";
import { TeamScreen } from "../screens/more/TeamScreen";
import { TaxRatesScreen } from "../screens/more/TaxRatesScreen";
import { CostCentersScreen } from "../screens/more/CostCentersScreen";
import { ProjectsScreen } from "../screens/more/ProjectsScreen";
import { BooksHomeScreen } from "../screens/books/BooksHomeScreen";
import { AccountsScreen } from "../screens/accounts/AccountsScreen";
import { GeneralLedgerScreen } from "../screens/accounts/GeneralLedgerScreen";
import { JournalListScreen } from "../screens/journal/JournalListScreen";
import { JournalViewScreen } from "../screens/journal/JournalViewScreen";
import { JournalFormScreen } from "../screens/journal/JournalFormScreen";
import { VoucherFormScreen } from "../screens/journal/VoucherFormScreen";
import { ReportsMenuScreen } from "../screens/reports/ReportsMenuScreen";
import { TrialBalanceScreen } from "../screens/reports/TrialBalanceScreen";
import { ProfitLossScreen } from "../screens/reports/ProfitLossScreen";
import { BalanceSheetScreen } from "../screens/reports/BalanceSheetScreen";
import { ArAgingScreen, ApAgingScreen } from "../screens/reports/AgingScreens";
import { TaxReportScreen } from "../screens/reports/TaxReportScreen";
import { AnalysisScreen } from "../screens/reports/AnalysisScreen";
import { InvoiceListScreen } from "../screens/invoices/InvoiceListScreen";
import { InvoiceViewScreen } from "../screens/invoices/InvoiceViewScreen";
import { InvoiceFormScreen } from "../screens/invoices/InvoiceFormScreen";
import { CustomersScreen } from "../screens/parties/CustomersScreen";
import { BillListScreen } from "../screens/bills/BillListScreen";
import { BillViewScreen } from "../screens/bills/BillViewScreen";
import { BillFormScreen } from "../screens/bills/BillFormScreen";
import { VendorsScreen } from "../screens/parties/VendorsScreen";
import type {
  BooksStackParamList,
  ReportsStackParamList,
  SalesStackParamList,
  PurchasesStackParamList,
  MoreStackParamList,
  DashboardStackParamList,
} from "./types";
import { colors } from "../theme/colors";

const RootStack = createNativeStackNavigator();
const Auth = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Dashboard = createNativeStackNavigator<DashboardStackParamList>();
const Books = createNativeStackNavigator<BooksStackParamList>();
const Reports = createNativeStackNavigator<ReportsStackParamList>();
const Sales = createNativeStackNavigator<SalesStackParamList>();
const Purchases = createNativeStackNavigator<PurchasesStackParamList>();
const More = createNativeStackNavigator<MoreStackParamList>();

// Shared dark header for pushed (detail) screens, so back navigation looks native.
const stackHeader = {
  headerStyle: { backgroundColor: colors.bg2 },
  headerTintColor: colors.mint,
  headerTitleStyle: { color: "#fff" },
  headerShadowVisible: false,
} as const;

// Dashboard tab: overview + quick links to Payments / Payments Due.
function DashboardStack() {
  return (
    <Dashboard.Navigator screenOptions={stackHeader}>
      <Dashboard.Screen name="DashboardHome" component={DashboardScreen} options={{ headerShown: false }} />
      <Dashboard.Screen name="Payments" component={PaymentsScreen} options={{ title: "All Payments" }} />
      <Dashboard.Screen name="PaymentsDue" component={PaymentsDueScreen} options={{ title: "Payments Due" }} />
    </Dashboard.Navigator>
  );
}

// Books tab: a hub → chart of accounts (→ ledger) and vouchers/journal (→ view/create).
function BooksStack() {
  return (
    <Books.Navigator screenOptions={stackHeader}>
      <Books.Screen name="BooksHome" component={BooksHomeScreen} options={{ headerShown: false }} />
      <Books.Screen name="Accounts" component={AccountsScreen} options={{ title: "Chart of Accounts" }} />
      <Books.Screen name="OpeningBalances" component={OpeningBalancesScreen} options={{ title: "Opening Balances" }} />
      <Books.Screen name="GeneralLedger" component={GeneralLedgerScreen} options={{ title: "Ledger" }} />
      <Books.Screen name="Journal" component={JournalListScreen} options={{ title: "Vouchers" }} />
      <Books.Screen name="JournalView" component={JournalViewScreen} options={{ title: "Voucher" }} />
      <Books.Screen name="JournalForm" component={JournalFormScreen} options={{ title: "Journal Voucher" }} />
      <Books.Screen
        name="VoucherForm"
        component={VoucherFormScreen}
        options={({ route }) => ({ title: route.params?.kind === "CREDIT" ? "Receipt Voucher" : "Payment Voucher" })}
      />
    </Books.Navigator>
  );
}

// Reports tab: a menu → each individual report.
function ReportsStack() {
  return (
    <Reports.Navigator screenOptions={stackHeader}>
      <Reports.Screen name="ReportsMenu" component={ReportsMenuScreen} options={{ headerShown: false }} />
      <Reports.Screen name="Analysis" component={AnalysisScreen} options={{ title: "Financial Analysis" }} />
      <Reports.Screen name="TrialBalance" component={TrialBalanceScreen} options={{ title: "Trial Balance" }} />
      <Reports.Screen name="ProfitLoss" component={ProfitLossScreen} options={{ title: "Profit & Loss" }} />
      <Reports.Screen name="BalanceSheet" component={BalanceSheetScreen} options={{ title: "Balance Sheet" }} />
      <Reports.Screen name="ArAging" component={ArAgingScreen} options={{ title: "AR Aging" }} />
      <Reports.Screen name="ApAging" component={ApAgingScreen} options={{ title: "AP Aging" }} />
      <Reports.Screen name="TaxReport" component={TaxReportScreen} options={{ title: "Tax Report" }} />
      <Reports.Screen name="CostCenterReport" component={CostCenterReportScreen} options={{ title: "Cost Center Report" }} />
      <Reports.Screen name="ProjectReport" component={ProjectReportScreen} options={{ title: "Project Report" }} />
    </Reports.Navigator>
  );
}

// Sales tab: invoices list → view/create/edit, plus customer management.
function SalesStack() {
  return (
    <Sales.Navigator screenOptions={stackHeader}>
      <Sales.Screen name="Invoices" component={InvoiceListScreen} options={{ headerShown: false }} />
      <Sales.Screen name="InvoiceView" component={InvoiceViewScreen} options={{ title: "Invoice" }} />
      <Sales.Screen
        name="InvoiceForm"
        component={InvoiceFormScreen}
        options={({ route }) => ({ title: route.params?.id ? "Edit Invoice" : "New Invoice" })}
      />
      <Sales.Screen name="Customers" component={CustomersScreen} options={{ title: "Customers" }} />
    </Sales.Navigator>
  );
}

// Purchases tab: bills list → view/create/edit, plus vendor management.
function PurchasesStack() {
  return (
    <Purchases.Navigator screenOptions={stackHeader}>
      <Purchases.Screen name="Bills" component={BillListScreen} options={{ headerShown: false }} />
      <Purchases.Screen name="BillView" component={BillViewScreen} options={{ title: "Bill" }} />
      <Purchases.Screen
        name="BillForm"
        component={BillFormScreen}
        options={({ route }) => ({ title: route.params?.id ? "Edit Bill" : "New Bill" })}
      />
      <Purchases.Screen name="Vendors" component={VendorsScreen} options={{ title: "Vendors" }} />
    </Purchases.Navigator>
  );
}

// More tab: profile + logout, and the settings screens (company, team, tax, cost centers, projects).
function MoreStack() {
  return (
    <More.Navigator screenOptions={stackHeader}>
      <More.Screen name="MoreHome" component={MoreHomeScreen} options={{ headerShown: false }} />
      <More.Screen name="Settings" component={SettingsScreen} options={{ title: "Company Settings" }} />
      <More.Screen name="Team" component={TeamScreen} options={{ title: "Team" }} />
      <More.Screen name="TaxRates" component={TaxRatesScreen} options={{ title: "Tax Rates" }} />
      <More.Screen name="CostCenters" component={CostCentersScreen} options={{ title: "Cost Centers" }} />
      <More.Screen name="Projects" component={ProjectsScreen} options={{ title: "Projects" }} />
    </More.Navigator>
  );
}

// A tiny helper so tab icons stay one-liners.
const icon = (glyph: string) => ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 18 }}>{glyph}</Text>
);

// The signed-in app: bottom tabs. Sales/Purchases/Vouchers tabs get added here as
// those modules are ported.
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.bg2, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.mint,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 10 }, // keep 6 tabs readable on narrow phones
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarIcon: icon("📊") }} />
      <Tab.Screen name="Sales" component={SalesStack} options={{ tabBarIcon: icon("🧾") }} />
      <Tab.Screen name="Purchases" component={PurchasesStack} options={{ tabBarIcon: icon("📥") }} />
      <Tab.Screen name="Books" component={BooksStack} options={{ tabBarIcon: icon("📚") }} />
      <Tab.Screen name="Reports" component={ReportsStack} options={{ tabBarIcon: icon("📈") }} />
      <Tab.Screen name="More" component={MoreStack} options={{ tabBarIcon: icon("⋯") }} />
    </Tab.Navigator>
  );
}

// Logged-out flow: sign in or create a company.
function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Register" component={RegisterScreen} />
      <Auth.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Auth.Navigator>
  );
}

// Remounts the whole tab tree when the active company changes, so every screen
// refetches fresh data for the new company.
function AppRoot() {
  const { user } = useAuth();
  return <AppTabs key={user?.orgId ?? "app"} />;
}

// Top-level switch: splash while restoring the session, then auth flow or the app.
export function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Starting FinBooks…" />;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="App" component={AppRoot} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
}

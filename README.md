# FinBooks Mobile

The mobile app for FinBooks — a double-entry accounting system I built. This is the React Native
(Expo) client; it talks to the same Node/Express + MySQL backend as the web app, so both share one
API and one database.

It covers the full bookkeeping cycle on a phone: invoices, bills, payments, vouchers, the general
ledger, and financial reports — with role-based access, PDF/CSV export, and push notifications.

## Tech
- React Native + Expo (SDK 54), TypeScript
- React Navigation (bottom tabs + native stacks)
- Axios for the API, JWT stored in the device secure store
- expo-notifications + Firebase Cloud Messaging (via Expo push) for notifications
- expo-print / expo-file-system for PDF and CSV export

## Features
- **Dashboard** — cash/receivable/payable KPIs, income-vs-expense chart, recent activity
- **Sales** — invoices (create, edit, post, record payment, void) + customers
- **Purchases** — bills (same actions) + vendors
- **Books** — chart of accounts, general ledger, and vouchers (receipt / payment / journal)
- **Reports** — trial balance, P&L, balance sheet, AR/AP aging, tax, cost-centre & project P&L,
  plus a financial-analysis view (ratios, health score, insights)
- **More** — company settings, team & roles, tax rates, cost centres, projects, opening balances,
  payments & payments-due, and notification settings
- **Push notifications** — remote push on activity + local reminders
- Multi-company switch, register / forgot-password, PDF (invoices/bills) and CSV (reports) export

Roles are enforced everywhere: Admin, Accountant (read/write), Viewer (read-only).

## Running it (development)
1. Start the backend (see `../accounting-system/backend`) and note your PC's LAN IP.
2. Install deps and start Metro:
   ```
   npm install
   npx expo start
   ```
3. Open in Expo Go (dev) or install a build (see below). If the app can't reach the backend,
   set the URL in-app: **Login → ⚙️ Server settings**.

> Push notifications only work in a real build (dev/production), not in Expo Go.

## Building (EAS)
```
npx eas-cli build --platform android --profile preview      # test APK
npx eas-cli build --platform android --profile production    # Play Store AAB
```

## Configuration
- `src/config/env.ts` — backend URL (auto-detects the Metro LAN IP in dev; `MANUAL_API_URL` for
  standalone builds). The URL is also editable at runtime from the login screen.
- `app.json` — app identity, icon/splash, and native config (notifications, Firebase, cleartext).

## Project structure
```
src/
  screens/       # one folder per area (invoices, bills, books, journal, reports, parties, more, money)
  components/ui/ # reusable UI kit (Card, Button, Field, SelectField, DataTable-style rows, …)
  navigation/    # tab + stack navigators and their param types
  context/       # auth state
  lib/           # api, formatting, csv, pdf/share, notifications, types
  storage/       # secure token + server-URL storage
  theme/         # Aurora dark palette
```

## Notes
- The backend and the web frontend live in `../accounting-system` and are their own thing.
- Not yet done: Urdu/Arabic localisation (the web app has it; the mobile app is English for now).

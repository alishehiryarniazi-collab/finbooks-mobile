# PROJECT_NOTES — FinBooks Mobile

React Native (Expo) mobile client for FinBooks. Talks to the SAME backend as the web app
(`accounting-system/backend`). The web frontend and backend are untouched.

## Purpose
A phone app version of FinBooks for the portfolio — built as increment #1: the foundation
that proves the full mobile stack works end-to-end against the real API. Remaining modules
are ported screen-by-screen after this spine is solid.

## Tech stack
- **Expo SDK 54** + React Native 0.81 + React 19 + **TypeScript**
  (Pinned to SDK 54 on purpose — Ali's phone's Expo Go only supports SDK 54. Do NOT bump the
  Expo SDK or Expo Go will reject the project. For a newer SDK, build a dev/standalone APK instead.)
- **React Navigation v7** — native-stack (auth ↔ app switch) + bottom-tabs
- **axios** for API calls (native apps bypass browser CORS, so we hit the API directly)
- **expo-secure-store** — JWT kept in the OS keychain/keystore (not plain storage)
- **expo-constants** — auto-derives the backend URL from Metro's LAN IP
- Styling: typed theme (`src/theme/colors.ts`) + React Native StyleSheet, wrapped in a small
  reusable UI kit. (NativeWind/Tailwind can be layered in later; kept out of the foundation
  to avoid bleeding-edge version risk on the first "does it run" milestone.)

## Folder structure
```
mobile/
  App.tsx                     # providers (SafeArea → Auth) + NavigationContainer
  index.ts                    # Expo entry (registers App)
  src/
    config/env.ts             # API base URL (auto LAN IP, manual override available)
    theme/colors.ts           # Aurora palette + spacing/radius tokens
    lib/ api.ts · format.ts · types.ts
    storage/token.ts          # secure-store token wrapper
    context/AuthContext.tsx   # user/login/logout/session-restore
    navigation/RootNavigator.tsx
    components/ui/ Screen · Card · Button · Field · Spinner
    screens/ LoginScreen · DashboardScreen · MoreScreen
```

## Status — ALL MODULES BUILT & RUNNING ON DEVICE (2026-09-01)
Six bottom tabs, all working against the live backend:
- [x] **Dashboard** — KPIs + recent activity
- [x] **Sales** — Invoices (list/view/create/edit/post/payment/void) + Customers CRUD
- [x] **Purchases** — Bills (list/view/create/edit/post/payment/void) + Vendors CRUD
- [x] **Books** — hub → Chart of Accounts → Ledger; Vouchers/Journal (list/view/reverse,
      create Receipt/Payment/Journal vouchers with negative-cash & duplicate-ref guards)
- [x] **Reports** — Analysis, Trial Balance, P&L, Balance Sheet, AR/AP Aging, Tax
- [x] **More** — Company Settings, Team, Tax Rates, Cost Centers, Projects, logout
- [x] Auth: login/logout/session restore, JWT in secure-store; role-gated write actions
- [x] `tsc --noEmit` clean · `expo export` bundles clean · verified on Ali's Android phone

## Reusable pieces (src/components)
UI kit: Screen, Card, Button, Field, SelectField (modal picker), Spinner, PageHeader,
ErrorNote, StatusBadge, AmountRow, FormSheet. Shared: PartyFormModal, PartyManager,
PaymentModal. Hook: useFetch. All screens are thin and lean on these.

## How to run (local, on your phone)
1. Start the backend (MySQL running):
   ```
   cd ../backend
   npm run dev            # http://localhost:4001, listens on your LAN too
   ```
2. Install **Expo Go** on your phone (free, from Play Store / App Store).
3. Put your phone on the **same Wi-Fi** as your PC.
4. Start the app:
   ```
   npx expo start
   ```
   Scan the QR: Android → Expo Go's scanner; iOS → Camera app.
5. If Windows Firewall prompts, **allow Node.js on Private networks** (needed so your phone can reach the backend).
6. If the app can't reach the server, set `MANUAL_API_URL` in `src/config/env.ts` to
   `http://<your-PC-IPv4>:4001/api` (find the IP with `ipconfig`).

Log in with the demo admin: **demo@finbooks.app / demo1234**

## Parity with the web app — COMPLETE (except i18n)
All web features are now in the mobile app:
- Opening Balances, Payments list, Payments Due, Cost Center Report, Project Report
- Register (sign-up), Forgot password (emails a reset link that opens on web)
- Beneficiary/bank details on customers & vendors
- Dashboard income-vs-expense trend chart (custom Views, no chart library)
- Invoice/Bill PDF export (expo-print + expo-sharing) — from each document's "Share PDF"
- CSV export on every report + the ledger (expo-file-system + expo-sharing)
- Multi-company switcher (More → Switch company); app subtree remounts on switch

Native modules added (all bundled in Expo Go, SDK 54): expo-print, expo-sharing, expo-file-system.

## Push notifications (Firebase / Expo) — CODE DONE, needs a dev build to fire
- Client: `expo-notifications` + `expo-device`; `src/lib/notifications.ts` (permissions, Expo push
  token, local reminders). AuthContext registers the device token to the backend after login.
  `More → Notifications`: send-test button + daily bills-due local reminder toggle.
- Backend (accounting-system): `PushToken` model + migration; `POST/DELETE /notifications/token`,
  `POST /notifications/test`; `services/push.ts` (sendExpoPush + notifyOrg); payments trigger a
  push to the team. All endpoints smoke-tested (200/201).
- Delivery uses Expo push service (FCM under the hood). app.json: android package `com.finbooks.app`
  + expo-notifications plugin.
- **Ali's remaining steps (deployment):** create Firebase project → add Android app (com.finbooks.app)
  → download `google-services.json` into finbooks-mobile/ → add `"googleServicesFile": "./google-services.json"`
  under android in app.json → `eas init` → `eas build --profile development --platform android` →
  `eas credentials` (upload FCM key). Push (local + remote) only fires in a dev/Play-Store build, NOT Expo Go.

STILL NOT DONE (deferred by Ali):
- i18n / RTL (Urdu / Arabic) — app is English only for now.

Draft edit: editing a draft invoice/bill now prefills each line's account — the form
matches the line's account code (from the detail endpoint) against the loaded accounts
list to recover the id (client-side only; backend untouched).

## Deployment / launch status (2026-09-03)
DONE:
- Firebase project `finbooks-dadd6` created; Android app `com.finbooks.app`; `google-services.json`
  in place; FCM V1 service-account key uploaded to EAS. (Service-account key is gitignored.)
- EAS linked (owner `sharyarkhan`, projectId in app.json); `eas.json` with dev/preview/production.
- App icon + splash (Aurora) and a white notification icon.
- `usesCleartextTraffic: true` (expo-build-properties) so built APKs can reach an http:// backend
  during testing — set to false once the backend is https.
- Backend URL is runtime-configurable (Login → Server settings) and defaults to the PC LAN IP.
- Privacy policy: `legal/privacy-policy.html` (fill in the contact email; host it publicly).
- Backend deploy guide + Dockerfile: `../accounting-system/backend/DEPLOY.md` + `Dockerfile`.
- Preview APK built on EAS and installed on Ali's phone.

REMAINING (human steps — see the ordered checklist Claude gave):
1. Test push on the installed build (login → token registers → send test / backend push).
2. Host the backend publicly (MySQL + API over https) — the app can't use a LAN IP in production.
3. Point the app at the https backend, disable cleartext, build a production `.aab`.
4. Play Console ($25) + listing + screenshots + hosted privacy-policy URL → submit.
- Optional: Urdu/Arabic i18n.

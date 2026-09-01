import Constants from "expo-constants";

// --- Where the mobile app finds the FinBooks backend -----------------------
// A phone can't use "localhost:4001" — on the phone, localhost is the phone itself.
// It must reach your PC over the local Wi-Fi network by its LAN IP address.
//
// Good news: when you run the app with Expo, Metro already knows your PC's LAN IP,
// so we auto-derive the API URL from it. You usually don't need to touch anything.
//
// If auto-detection ever fails (some networks/VPNs), set MANUAL_API_URL by hand:
//   1. On your PC run:  ipconfig   (look for "IPv4 Address", e.g. 192.168.1.20)
//   2. Put it below, including the port and /api, e.g.
//        const MANUAL_API_URL = "http://192.168.1.20:4001/api";
const MANUAL_API_URL = "";

// Backend port (see accounting-system/backend/.env → PORT=4001).
const BACKEND_PORT = 4001;

// Pull the Metro/dev-server host (e.g. "192.168.1.20:8081") that Expo injects,
// and reuse just its IP for our API. Falls back to localhost for web/simulator.
function deriveApiUrl(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    // Older Expo Go field, kept as a fallback.
    (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;

  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:${BACKEND_PORT}/api`;
  return `http://localhost:${BACKEND_PORT}/api`;
}

export const API_BASE_URL = MANUAL_API_URL || deriveApiUrl();

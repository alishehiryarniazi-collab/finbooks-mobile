import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { getToken } from "../storage/token";

// One axios instance for the whole app, pointed at the FinBooks backend.
// (Native apps aren't subject to browser CORS, so we call the API directly.)
export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// Attach the JWT to every request. Reading the token is async on mobile
// (secure store), and axios supports async request interceptors.
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any backend/axios error into a readable STRING so the UI never shows
// "[object Object]" or a raw stack. Mirrors the web app's apiError helper.
export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // No response at all usually means the phone couldn't reach the PC.
    if (!err.response) {
      return "Can't reach the server. Make sure the backend is running and your phone is on the same Wi-Fi as your PC.";
    }
    const data = err.response.data as { error?: unknown; message?: unknown } | undefined;
    const candidate = data?.error ?? data?.message ?? err.message;
    if (typeof candidate === "string") return candidate;
    if (candidate != null) return JSON.stringify(candidate);
    return "Something went wrong.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// Machine-readable code for confirmable warnings (e.g. "NEGATIVE_CASH", "DUPLICATE_REF"),
// so the UI can ask the user to confirm and retry with an override.
export function apiErrorCode(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    const code = (err.response?.data as { code?: unknown } | undefined)?.code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

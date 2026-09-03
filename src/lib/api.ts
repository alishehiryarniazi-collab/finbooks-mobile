import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { getToken } from "../storage/token";
import { getStoredApiUrl } from "../storage/apiUrl";

// One axios instance for the whole app, pointed at the FinBooks backend.
// (Native apps aren't subject to browser CORS, so we call the API directly.)
export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// The backend URL can be changed at runtime (Login → Server settings) and is loaded
// from device storage at startup, so a changed LAN IP never needs an app rebuild.
export function getApiBaseUrl(): string {
  return api.defaults.baseURL ?? API_BASE_URL;
}
export function setApiBaseUrl(url: string): void {
  api.defaults.baseURL = url.trim();
}
export async function loadStoredApiUrl(): Promise<void> {
  const stored = await getStoredApiUrl();
  if (stored) api.defaults.baseURL = stored;
}

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
    const data = err.response.data as { error?: unknown; message?: unknown; details?: unknown } | undefined;
    // Field-level validation (zod): tell the user EXACTLY which field is wrong and why,
    // instead of a generic "Validation failed".
    const fieldMsg = formatValidation(data?.details);
    if (fieldMsg) return fieldMsg;
    const candidate = data?.error ?? data?.message ?? err.message;
    if (typeof candidate === "string") return candidate;
    if (candidate != null) return JSON.stringify(candidate);
    return "Something went wrong.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// "organizationName" -> "Organization name" so error lines read naturally.
function prettyField(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// Turns a zod flatten() payload ({ fieldErrors, formErrors }) into a readable
// "Field: reason" list, one issue per line.
function formatValidation(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
  const parts: string[] = [];
  if (d.fieldErrors) {
    for (const [field, msgs] of Object.entries(d.fieldErrors)) {
      if (Array.isArray(msgs) && msgs.length > 0) parts.push(`${prettyField(field)}: ${msgs.join(", ")}`);
    }
  }
  if (Array.isArray(d.formErrors)) parts.push(...d.formErrors);
  return parts.length > 0 ? parts.join("\n") : null;
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

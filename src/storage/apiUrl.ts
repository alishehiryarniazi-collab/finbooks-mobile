import * as SecureStore from "expo-secure-store";

// The backend URL the app talks to. Stored on-device so it can be changed at runtime
// (e.g. when your PC's LAN IP changes) WITHOUT rebuilding the app.
const KEY = "finbooks_api_url";

export async function getStoredApiUrl(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function setStoredApiUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, url.trim());
}

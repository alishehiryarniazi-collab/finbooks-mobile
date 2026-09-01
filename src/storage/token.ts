import * as SecureStore from "expo-secure-store";

// The JWT is kept in the device's secure store (iOS Keychain / Android Keystore),
// NOT plain AsyncStorage — so another app or a casual filesystem read can't lift it.
// This is the mobile equivalent of the web app's localStorage token, but hardened.

const TOKEN_KEY = "finbooks_token";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    // Secure store can throw on some devices/emulators — fail closed (no token).
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

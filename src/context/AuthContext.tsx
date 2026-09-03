import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { api, apiError, loadStoredApiUrl } from "../lib/api";
import { setActiveCurrency } from "../lib/format";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import type { User } from "../lib/types";
import { clearToken, getToken, setToken } from "../storage/token";

// Global auth state, mirroring the web app's AuthContext but with async secure-store
// for the token. Any screen can read the user or call login/logout via useAuth().
export interface RegisterPayload {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true only during the initial session-restore check
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  switchCompany: (orgId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep the display currency in sync with the active company whenever the user changes.
  function setUser(u: User | null) {
    setUserState(u);
    setActiveCurrency(u?.organization?.baseCurrency);
  }

  // On launch: if a token is stored, restore the session by fetching the current user.
  useEffect(() => {
    (async () => {
      await loadStoredApiUrl(); // use the saved backend URL (if any) before any request
      if (!(await getToken())) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get<{ user: User }>("/auth/me");
        setUser(data.user);
      } catch {
        await clearToken(); // stale/expired token — drop it
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Once we have a logged-in user (and whenever they switch company), register this device's
  // push token with the backend so it can send notifications. Fails quietly in Expo Go or
  // before the app is EAS-linked (no token yet) — remote push needs a development build.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;
      try {
        await api.post("/notifications/token", { token, platform: Platform.OS });
      } catch {
        /* backend endpoint not ready / offline — ignore; we'll re-register next launch */
      }
    })();
  }, [user?.id, user?.orgId]);

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      await setToken(data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiError(err));
    }
  }

  // Register creates a new company + admin user and logs straight in.
  async function register(payload: RegisterPayload) {
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/register", payload);
      await setToken(data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiError(err));
    }
  }

  // Switch the active company: get a token scoped to it, then swap the user. The app
  // subtree is keyed by orgId (see RootNavigator) so every screen refetches for the new company.
  async function switchCompany(orgId: string) {
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/switch", { orgId });
      await setToken(data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiError(err));
    }
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, switchCompany, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Small hook so screens do `const { user, login } = useAuth();`.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

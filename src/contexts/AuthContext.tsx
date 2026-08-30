import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@/types";
import { getUser, setUser, clearUser, devLogin } from "@/lib/storage";
import { authApi, subjectsApi, setAuthToken, clearAuthToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
});

async function postLoginSetup(apiUser: { id: string; email: string; name: string; picture?: string }) {
  const user: User = { id: apiUser.id, email: apiUser.email, name: apiUser.name, picture: apiUser.picture };
  setUser(user);
  // Seed default GATE subjects for this user in MongoDB (no-op if already seeded)
  try { await subjectsApi.seed(); } catch { /* offline */ }
  return user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Show stored user immediately for fast UI
      const stored = getUser();
      if (stored) {
        setUserState(stored);
      }

      // 2. Refresh from backend using token/cookie session
      try {
        const { user: apiUser } = await authApi.me();
        if (apiUser?.id && apiUser.id !== "dev-user-id") {
          const u = await postLoginSetup(apiUser);
          setUserState(u);
          setLoading(false);
          return;
        }
      } catch { /* offline — keep stored user if any */ }

      if (!stored) {
        setUserState(null);
      }
      setLoading(false);
    })();
  }, []);

  const login = async () => {
    try {
      const { token, user: apiUser } = await authApi.devLogin();
      if (token) setAuthToken(token);
      const u = await postLoginSetup(apiUser);
      setUserState(u);
    } catch {
      // Full offline fallback
      const u = devLogin();
      setUserState(u);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const { token, user: apiUser } = await authApi.googleLogin(credential);
      if (token) setAuthToken(token);
      const u = await postLoginSetup(apiUser);
      setUserState(u);
    } catch (err) {
      console.error("Google login failed:", err);
      throw err;
    }
  };

  const logout = () => {
    clearAuthToken();
    clearUser();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

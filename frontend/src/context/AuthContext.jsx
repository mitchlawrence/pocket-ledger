import { createContext, useContext, useEffect, useState } from "react";
import {
  api,
  refreshAccessToken,
  setAccessToken,
  setSessionExpiredHandler,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));

    async function restoreSession() {
      const token = await refreshAccessToken();
      if (token) {
        try {
          const data = await api("/auth/me");
          setUser(data.user);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }

    restoreSession();
  }, []);

  async function signup(name, email, password) {
    const data = await api("/auth/signup", {
      method: "POST",
      body: { name, email, password },
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

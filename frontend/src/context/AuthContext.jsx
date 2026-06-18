import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";

const TOKEN_KEY = "fitconnection_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  };
  const refreshUser = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };
  const value = useMemo(
    () => ({ user, loading, authenticate, refreshUser, logout }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

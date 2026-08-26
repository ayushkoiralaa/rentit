import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("rentit_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem("rentit_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("rentit_token", res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem("rentit_token", res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("rentit_token");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.user);
    return res.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

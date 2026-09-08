import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("smartserve_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      setUser(data);
      localStorage.setItem("smartserve_user", JSON.stringify(data));
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", formData);
      // Do NOT sign in — account must be approved by an admin first
      return { success: true, message: data.message, isApproved: data.isApproved };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smartserve_user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

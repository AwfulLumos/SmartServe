import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

// ──────────────────────────────────────────────────────
// AUTHENTICATION CONTEXT
// Shares the login/authentication state application-wide
// Allows components to easily access current user data
// ──────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ──────────────────────────────────────────────────────
// AUTH PROVIDER COMPONENT
// Exposes authentication data and utility actions to child components
// Implements core login, registration, and logout flows
// ──────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // ──────────────────────────────────────────────────────
  // USER STATE - Tracks the active logged-in user session
  // Retains user profile across hard browser reloads
  // ──────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      // Retrieve the saved user data from localStorage cache
      const stored = localStorage.getItem("smartserve_user");
      // Parse the JSON data if cached, otherwise fall back to null
      return stored ? JSON.parse(stored) : null;
    } catch {
      // Fall back to null if access to localStorage fails
      return null;
    }
  });

  // ──────────────────────────────────────────────────────
  // LOADING STATE - Tracks auth actions in progress (e.g. login/register)
  // ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  const persistUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem("smartserve_user", JSON.stringify(nextUser));
      if (nextUser.token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${nextUser.token}`;
      }
    } else {
      localStorage.removeItem("smartserve_user");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // ──────────────────────────────────────────────────────
  // AUTOMATIC HEADER INTERCEPTOR SETUP
  // When a user token is present, automatically append a Bearer Authorization header to all API requests
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.token) {
      // Append JWT token authorization header
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      // Clear authorization headers when session is destroyed
      delete api.defaults.headers.common["Authorization"];
    }
  }, [user]);

  // ──────────────────────────────────────────────────────
  // LOGIN FUNCTION - Authenticates user credentials
  // ──────────────────────────────────────────────────────
  const login = async (username, password) => {
    setLoading(true); // Toggle active load indicator
    try {
      // Post user credentials to backend
      const { data } = await api.post("/auth/login", { username, password });
      // Persist authenticated user session
      persistUser(data);
      sessionStorage.setItem("smartserve_admin_just_logged_in", "true");
      return { success: true }; // Authentication successful
    } catch (err) {
      // Return server response errors
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false); // Stop load indicator
    }
  };

  // ──────────────────────────────────────────────────────
  // REGISTER FUNCTION - Submit registration requests
  // Registration requests require administrative approval before authentication is allowed
  // ──────────────────────────────────────────────────────
  const register = async (formData) => {
    setLoading(true); // Toggle load state
    try {
      // Submit registration data payload
      const { data } = await api.post("/auth/register", formData);
      // Inform client that user requires approval to log in
      return { success: true, message: data.message, isApproved: data.isApproved };
    } catch (err) {
      // Return server-side validation error messages
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // ──────────────────────────────────────────────────────
  // LOGOUT FUNCTION - Terminates the active user session
  // ──────────────────────────────────────────────────────
  const logout = () => {
    persistUser(null);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      const currentToken = user?.token;
      const merged = { ...data, token: currentToken };
      persistUser(merged);
      return { success: true, data: merged };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to refresh profile" };
    }
  };

  const updateProfile = async (payload) => {
    try {
      const { data } = await api.patch("/auth/me/profile", payload);
      const merged = { ...data, token: user?.token };
      persistUser(merged);
      return { success: true, data: merged };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update profile" };
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const { data } = await api.post("/auth/me/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const merged = { ...data, token: user?.token };
      persistUser(merged);
      return { success: true, data: merged };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to upload image" };
    }
  };

  const deleteMyAccount = async () => {
    try {
      const { data } = await api.delete("/auth/me/profile");
      logout();
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete account" };
    }
  };

  // ──────────────────────────────────────────────────────
  // CHANGE PASSWORD - admin changing their own password
  // ──────────────────────────────────────────────────────
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      await api.patch("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      logout(); // Force re-authentication
      return { success: true, message: "Password changed successfully. Please log in with your new password." };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Password change failed" };
    }
  };

  // ──────────────────────────────────────────────────────
  // RESET STAFF PASSWORD - admin resetting another staff member's password
  // ──────────────────────────────────────────────────────
  const resetStaffPassword = async (staffId) => {
    try {
      const { data } = await api.post(`/auth/staff/${staffId}/reset-password`);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Password reset failed" };
    }
  };

  // ──────────────────────────────────────────────────────
  // PROVIDER RETURN - Exposes auth data context to child components
  // ──────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshMe,
        updateProfile,
        uploadProfileImage,
        deleteMyAccount,
        changePassword,
        resetStaffPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ──────────────────────────────────────────────────────
// USE AUTH HOOK - Easy custom hook access to the auth context
// Can only be used inside components wrapped in an AuthProvider
// ──────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

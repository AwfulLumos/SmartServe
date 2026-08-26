import {
  createContext, // To create a context object that can be shared across the app
  useContext,    // To consume the current context value in a custom hook
  useState,      // To hold the student auth state
  useEffect,     // To run side effects when student data changes
  useCallback    // To memoize functions
} from "react";
import api from "../utils/api";            // Axios instance with shared base URL + Authorization header for general auth requests
import studentApi from "../utils/studentApi"; // Axios instance with student token interceptor for student-only requests

const StudentAuthContext = createContext(null); // Context object for student auth data

export function StudentAuthProvider({ children }) {
  // ──────────────────────────────────────────────────────
  // STUDENT STATE
  // Holds the current logged-in student
  // Automatically reads saved data from localStorage if available
  // ──────────────────────────────────────────────────────
  const [student, setStudent] = useState(() => {
    try {
      const stored = localStorage.getItem("smartserve_student");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false); // To track if auth action is loading

  const persistStudent = (next) => {
    setStudent((prev) => {
      const updated = typeof next === "function" ? next(prev) : next;
      localStorage.setItem("smartserve_student", JSON.stringify(updated));
      return updated;
    });
  };

  // ──────────────────────────────────────────────────────
  // SET AUTH TOKEN IN API HELPER
  // When a student token is present, automatically add it to the Authorization header
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (student?.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${student.token}`;
    }
  }, [student]);

  // ──────────────────────────────────────────────────────
  // LOGIN FUNCTION
  // Tries to login using schoolId and password
  // Saves student data and token on success
  // ──────────────────────────────────────────────────────
  const login = async (schoolId, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/student/auth/login", { schoolId, password });
      persistStudent(data);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // REFRESH STUDENT FUNCTION
  // Fetches the latest student info from the server
  // Useful when profile data or eco points update
  // ──────────────────────────────────────────────────────
  const refreshStudent = useCallback(async () => {
    try {
      const { data } = await studentApi.get("/student/auth/me");
      persistStudent((prev) => ({ ...prev, ...data }));
    } catch { /* silent */ }
  }, []);

  // ──────────────────────────────────────────────────────
  // UPDATE PROFILE FUNCTION
  // Logged-in student can update own editable account fields
  // ──────────────────────────────────────────────────────
  const updateProfile = async (payload) => {
    try {
      const { data } = await studentApi.patch("/student/auth/me", payload);
      persistStudent((prev) => ({ ...prev, ...data }));
      return { success: true, student: data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Profile update failed" };
    }
  };

  // ──────────────────────────────────────────────────────
  // UPDATE PROFILE PHOTO FUNCTION
  // Uploads image and updates logged-in student profile photo
  // ──────────────────────────────────────────────────────
  const updateProfilePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const { data } = await studentApi.patch("/student/auth/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      persistStudent((prev) => ({ ...prev, ...data }));
      return { success: true, student: data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Photo upload failed" };
    }
  };

  // ──────────────────────────────────────────────────────
  // LOGOUT FUNCTION
  // Clears student session and localStorage data
  // ──────────────────────────────────────────────────────
  const logout = () => {
    setStudent(null);
    localStorage.removeItem("smartserve_student");
  };

  // ──────────────────────────────────────────────────────
  // CHANGE PASSWORD FUNCTION
  // Logged-in user changes their own password
  // Requires old password verification before allowing new password
  // ──────────────────────────────────────────────────────
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      await studentApi.patch("/student/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      // After successful password change, logout the user to force re-authentication
      logout();
      return { success: true, message: "Password changed successfully. Please log in with your new password." };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Password change failed" };
    }
  };

  // ──────────────────────────────────────────────────────
  // PROVIDER RETURN
  // Passes the auth state and functions to child components
  // ──────────────────────────────────────────────────────
  return (
    <StudentAuthContext.Provider
      value={{
        student,
        loading,
        login,
        logout,
        refreshStudent,
        changePassword,
        updateProfile,
        updateProfilePhoto,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

// ──────────────────────────────────────────────────────
// CUSTOM HOOK
// Used in components to easily access student auth data
// ──────────────────────────────────────────────────────
export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be used within StudentAuthProvider");
  return ctx;
}

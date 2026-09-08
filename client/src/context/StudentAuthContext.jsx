import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import studentApi from "../utils/studentApi";

const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const stored = localStorage.getItem("smartserve_student");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student?.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${student.token}`;
    }
  }, [student]);

  const login = async (schoolId, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/student/auth/login", { schoolId, password });
      setStudent(data);
      localStorage.setItem("smartserve_student", JSON.stringify(data));
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const refreshStudent = async () => {
    try {
      const { data } = await studentApi.get("/student/auth/me");
      const updated = { ...student, ...data };
      setStudent(updated);
      localStorage.setItem("smartserve_student", JSON.stringify(updated));
    } catch { /* silent */ }
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem("smartserve_student");
  };

  return (
    <StudentAuthContext.Provider value={{ student, loading, login, logout, refreshStudent }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be used within StudentAuthProvider");
  return ctx;
}

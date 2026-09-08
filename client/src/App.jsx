import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { StudentAuthProvider, useStudentAuth } from "./context/StudentAuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetCode from "./pages/VerifyResetCode";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RegisterStudent from "./pages/admin/RegisterStudent";
import Inventory from "./pages/admin/Inventory";
import Rewards from "./pages/admin/Rewards";
import Orders from "./pages/admin/Orders";
import Settings from "./pages/admin/Settings";
import StudentSplash from "./pages/student/StudentSplash";
import StudentLogin from "./pages/student/StudentLogin";
import StudentForgotPassword from "./pages/student/StudentForgotPassword";
import StudentVerifyResetCode from "./pages/student/StudentVerifyResetCode";
import StudentResetPassword from "./pages/student/StudentResetPassword";
import StudentDashboard from "./pages/student/StudentDashboard";

// Admin-only pages — redirect students to their dashboard, unauthenticated to /login
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const { student } = useStudentAuth();
  if (user) return children;
  if (student) return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// Admin auth pages (login/register) — redirect if already authenticated by either side
function GuestRoute({ children }) {
  const { user } = useAuth();
  const { student } = useStudentAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  if (student) return <Navigate to="/student/dashboard" replace />;
  return children;
}

// Student-only pages — redirect admins to their dashboard, unauthenticated to /student/login
function StudentProtectedRoute({ children }) {
  const { student } = useStudentAuth();
  const { user } = useAuth();
  if (student) return children;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/student/login" replace />;
}

// Student auth pages (login) — redirect if already authenticated by either side
function StudentGuestRoute({ children }) {
  const { student } = useStudentAuth();
  const { user } = useAuth();
  if (student) return <Navigate to="/student/dashboard" replace />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

/**
 * Mounts the correct NotificationProvider once for the whole session.
 * - Admin/staff gets role="admin"
 * - Student/employee gets role="student"
 * Must live inside both AuthProvider and StudentAuthProvider.
 */
function AppNotificationsGate({ children }) {
  const { user } = useAuth();
  const { student, refreshStudent } = useStudentAuth();

  if (user) {
    return (
      <NotificationProvider role="admin" token={user.token} id={user._id}>
        {children}
      </NotificationProvider>
    );
  }
  if (student) {
    const handleStudentNotification = (notif) => {
      // Refresh points balance whenever eco points or rewards change
      if (notif.type === "byoc_awarded" || notif.type === "reward_redeemed") {
        refreshStudent();
      }
    };
    return (
      <NotificationProvider
        role="student"
        token={student.token}
        id={student._id}
        onNotification={handleStudentNotification}
      >
        {children}
      </NotificationProvider>
    );
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
          <AppNotificationsGate>
          <Routes>
            {/* Admin / Staff routes */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-code" element={<VerifyResetCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/register-student"
              element={
                <ProtectedRoute>
                  <RegisterStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/rewards"
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route path="/student" element={<StudentSplash />} />
            <Route
              path="/student/login"
              element={
                <StudentGuestRoute>
                  <StudentLogin />
                </StudentGuestRoute>
              }
            />
            <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
            <Route path="/student/verify-reset-code" element={<StudentVerifyResetCode />} />
            <Route path="/student/reset-password" element={<StudentResetPassword />} />
            <Route
              path="/student/dashboard"
              element={
                <StudentProtectedRoute>
                  <StudentDashboard />
                </StudentProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          </AppNotificationsGate>
        </BrowserRouter>
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App;

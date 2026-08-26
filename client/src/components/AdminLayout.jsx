// Import React hooks used for state, references, and side effects
import { useState, useRef, useEffect, createContext, useContext } from "react";

// Import routing tools from React Router
// NavLink is used for sidebar links
// useNavigate is used to redirect the user after logout
import { NavLink, useNavigate, useLocation } from "react-router-dom";
// Used to show small popup messages/toasts
import toast from "react-hot-toast";

// Import icons used in the admin dashboard UI
import {
  IoGridOutline,
  IoPersonAddOutline,
  IoCubeOutline,
  IoReceiptOutline,
  IoNotificationsOutline,
  IoBarChartOutline,
  IoGiftOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoRestaurantOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoCheckmarkDoneOutline,
  IoReceiptOutline as IoOrderIcon,
  IoLeafOutline,
  IoGiftOutline as IoRewardIcon,
  IoChatbubblesOutline,
  IoTimeOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import { MdPeopleOutline, MdMenuBook, MdHistoryEdu } from "react-icons/md";

// Import authentication context
// This gives access to the logged-in user and logout function
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

// Import SmartServe logo used in the sidebar
import logo from "../assets/logo/logo.png";

const resolveProfileImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

// ── Notification type config ──────────────────────────────────────────────────
const NOTIF_CONFIG = {
  order_placed: { label: "New Order", icon: <IoOrderIcon />, color: "bg-blue-100 text-blue-600" },
  order_status: { label: "Order Update", icon: <IoOrderIcon />, color: "bg-yellow-100 text-yellow-600" },
  byoc_awarded: { label: "Eco Points", icon: <IoLeafOutline />, color: "bg-green-100 text-[#4a6741]" },
  reward_redeemed: { label: "Reward Redeemed", icon: <IoRewardIcon />, color: "bg-purple-100 text-purple-600" },
};

function timeAgo(dateStr) {

  // Get the difference between current time and notification time
  // Date.now() = current timestamp in milliseconds
  // new Date(dateStr).getTime() = notification timestamp
  const diff = Date.now() - new Date(dateStr).getTime();
  // Convert milliseconds into minutes
  // 60000 ms = 1 minute
  const m = Math.floor(diff / 60000);
  // If less than 1 minute ago
  if (m < 1) return "just now";
  // If less than 60 minutes ago
  // Example: 5m ago
  if (m < 60) return `${m}m ago`;
  // Convert minutes into hours
  const h = Math.floor(m / 60);
  // If less than 24 hours ago
  // Example: 2h ago
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Notification Bell (uses context) ─────────────────────────────────────────
function NotificationBell() {
  // ──────────────────────────────────────────────────────
  // Hook Usage: useNotifications()
  // Gets notification data and state management functions
  // ──────────────────────────────────────────────────────
  // notifications = array of all notifications for this user
  // unread = count of unread notifications (number)
  // markAllRead = function to mark all notifications as read
  // markOneRead = function to mark a single notification as read by ID
  const { notifications, unread, markAllRead, markOneRead } = useNotifications();

  // ──────────────────────────────────────────────────────
  // Hook Usage: useState()
  // Controls whether the notification dropdown is open or closed
  // ──────────────────────────────────────────────────────
  // open = true/false for dropdown visibility
  // setOpen = function to update dropdown visibility state
  const [open, setOpen] = useState(false);

  // ──────────────────────────────────────────────────────
  // Hook Usage: useRef()
  // Stores a reference to the dropdown DOM element
  // Used to detect clicks outside the dropdown
  // ──────────────────────────────────────────────────────
  const dropdownRef = useRef(null);

  // ──────────────────────────────────────────────────────
  // Hook Usage: useEffect()
  // Purpose: Close notification dropdown when clicking outside
  // Runs once on component mount (empty dependency array [])
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    // Event handler: Executes whenever user clicks anywhere on page
    const handler = (e) => {
      // Check if:
      // 1. dropdownRef exists (reference to dropdown DOM element)
      // 2. the clicked element is NOT inside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // If user clicked outside, close the notification dropdown
        setOpen(false);
      }
    };
    // Add mousedown event listener to entire document
    document.addEventListener("mousedown", handler);
    // Cleanup function: Remove event listener when component unmounts
    // Prevents memory leaks and duplicate listeners
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        // ──────────────────────────────────────────────────────
        // Event Handler: onClick
        // Runs when user clicks the notification bell icon
        // ──────────────────────────────────────────────────────
        onClick={() => {
          // Toggle dropdown: if open, close it; if closed, open it
          const opening = !open;
          setOpen(opening);

          // Automatically mark all notifications as read when opening dropdown
          // Only runs if:
          // 1. Dropdown is being opened (opening === true)
          // 2. There are unread notifications (unread > 0)
          if (opening && unread > 0) markAllRead();
        }}
        // Tailwind styling:
        // relative = allows positioning of badge
        // gray text color
        // hover effect
        // smooth transition animation
        className="relative text-gray-500 hover:text-gray-700 transition"
      >
        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* Notification Bell Icon */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <IoNotificationsOutline className="text-2xl" />

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* Notification Badge: Unread Count Indicator */}
        {/* Shows a red badge with number of unread notifications */}
        {/* Only displays if unread count > 0 */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold px-0.5">
            {/* Display unread count, but cap at "99+" to prevent overflow */}
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        // Notification dropdown styling:
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-bold text-sm text-gray-800">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[#4a6741] font-semibold hover:underline"
              >
                <IoCheckmarkDoneOutline className="text-base" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-400 text-sm">
                No notifications yet
              </li>
            ) : (
              notifications.map((n) => {
                const cfg = NOTIF_CONFIG[n.type] || { label: n.type, icon: <IoNotificationsOutline />, color: "bg-gray-100 text-gray-500" };
                return (
                  <li
                    key={n._id}
                    // Calls function to mark all notifications as read
                    onClick={() => !n.read && markOneRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${!n.read ? "bg-[#f0f7ec]" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{n.title}</p>
                      <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#4a6741] flex-shrink-0 mt-1" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Real-Time Campus Clock & Service Date Component ──────────────────────────
function HeaderClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="hidden sm:flex items-center gap-3 bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-1.5 shadow-2xs">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        <IoCalendarOutline className="text-sm text-[#4a6741]" />
        <span>{formattedDate}</span>
      </div>
      <div className="h-3.5 w-px bg-gray-300" />
      <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-gray-800">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4a6741] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4a6741]"></span>
        </span>
        <IoTimeOutline className="text-sm text-[#4a6741]" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
}

// ── Context for Admin Layout Actions ──────────────────────────────────────────
export const AdminLayoutContext = createContext(null);

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) {
    return { triggerLogout: () => { }, triggerReload: () => { } };
  }
  return ctx;
}

export function triggerAdminLogout() {
  window.dispatchEvent(new CustomEvent("smartserve:admin-logout"));
}

// ── Custom Animated 3-Second Admin Loading Screen Component ────────────────────
function AdminLoadingScreen({ progress, statusText, onSkip }) {
  const remainingSec = Math.max(0, ((3000 - (progress / 100) * 3000) / 1000)).toFixed(1);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#182715] via-[#2a4023] to-[#4a6741] text-white p-6 transition-all duration-500 ease-out select-none">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#86b049]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e8f5be]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        {/* Brand Circle Card Container fitting the logo perfectly */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center p-2 shadow-2xl overflow-hidden">
            <img src={logo} alt="SmartServe Logo" className="w-full h-full object-cover rounded-full drop-shadow-md" />
          </div>
        </div>

        {/* Brand Titles */}
        <h2 className="text-2xl font-black tracking-wide text-white drop-shadow">
          SmartServe Admin
        </h2>
        <p className="text-[11px] uppercase tracking-widest text-[#e8f5be] font-bold mt-0.5 mb-6">
          Management Portal
        </p>

        {/* Dynamic Status Text */}
        <div className="h-7 mb-4 flex items-center justify-center">
          <p className="text-sm font-medium text-white/90 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#e8f5be] animate-ping" />
            {statusText}
          </p>
        </div>

        {/* 3-Second Progress Bar */}
        <div className="w-full bg-black/35 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-inner mb-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#86b049] via-[#a3cf5a] to-[#e8f5be] transition-all duration-75 ease-out shadow-lg shadow-[#86b049]/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage & Time Indicator */}
        <div className="w-full flex justify-between items-center text-xs font-semibold text-white/70 px-1 mb-6">
          <span>Loading data...</span>
          <span className="text-[#e8f5be] font-mono text-sm font-bold">{Math.round(progress)}%</span>
          <span className="font-mono text-[#e8f5be]">{remainingSec}s</span>
        </div>

        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white/80 hover:text-white transition"
          >
            Skip loading ›
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-[11px] text-white/50 tracking-wider">
        SmartServe Security Verified • Admin Session
      </div>
    </div>
  );
}

// ── Custom Animated 3-Second Admin Logout Screen Component ────────────────────
function AdminLogoutScreen({ countdown, progress, user }) {
  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const profileImageSrc = resolveProfileImageUrl(user?.profileImageUrl || "");
  const strokeDashoffset = 2 * Math.PI * 46 * (1 - progress / 100);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#141b13] via-[#233321] to-[#152314] text-white p-6 transition-all duration-500 ease-out select-none">
      {/* Red/Emerald Ambient Background Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-red-900/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#4a6741]/25 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        {/* User Avatar with Circular Countdown Ring */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="46"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="46"
              stroke="#ef4444"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-75 ease-linear"
            />
          </svg>

          {/* Avatar Photo or Initials */}
          <div className="absolute w-20 h-20 rounded-full bg-[#4a6741] border-2 border-white/40 shadow-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xl">
            {profileImageSrc ? (
              <img src={profileImageSrc} alt={user?.fullName || "Admin"} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>

        {/* 3-Second Badge */}
        <div className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-sm mb-3 shadow-inner">
          Logging out in {countdown}s
        </div>

        {/* Farewell Texts */}
        <h2 className="text-2xl font-black text-white tracking-wide">
          Logging Out...
        </h2>
        <p className="text-sm text-gray-200 mt-1 mb-1 font-medium">
          Goodbye, <span className="font-bold text-[#e8f5be]">{user?.fullName || "Administrator"}</span>!
        </p>
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
          Safely terminating your administrative session and clearing session security tokens...
        </p>

        {/* Logout Progress Bar */}
        <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/15 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#e8f5be] transition-all duration-75 ease-out shadow-md shadow-red-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1.5 font-medium">
          <IoLogOutOutline className="text-red-400 text-sm animate-pulse" />
          Redirecting to admin login screen...
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar Navigation Items
// Purpose:
// List of menu items displayed in the admin sidebar.
// Each object represents one sidebar button/link.
// ─────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", icon: <IoGridOutline />, to: "/dashboard" },
  { label: "Orders", icon: <IoReceiptOutline />, to: "/dashboard/orders" },
  { label: "Menu Management", icon: <MdMenuBook />, to: "/dashboard/settings/menu" },
  { label: "Inventory", icon: <IoCubeOutline />, to: "/dashboard/inventory" },
  { label: "Register User", icon: <IoPersonAddOutline />, to: "/dashboard/register-student" },
  { label: "Rewards", icon: <IoGiftOutline />, to: "/dashboard/rewards" },
  { label: "Analytics", icon: <IoBarChartOutline />, to: "/dashboard/analytics" },
  { label: "Feedbacks", icon: <IoChatbubblesOutline />, to: "/dashboard/feedbacks" },
  { label: "Staff Accounts", icon: <MdPeopleOutline />, to: "/dashboard/settings/staff" },
  { label: "Audit Log", icon: <MdHistoryEdu />, to: "/dashboard/settings/audit" },
];

// ─────────────────────────────────────────────
// AdminLayout Component
// Purpose:
// Main layout/template for the admin dashboard.
// This wraps all admin pages with:
// - sidebar
// - topbar
// - notifications
// - main content area
// ─────────────────────────────────────────────

export default function AdminLayout({ children, breadcrumb = "Dashboard" }) {
  // ──────────────────────────────────────────────────────
  // Component Props (Parameters)
  // ──────────────────────────────────────────────────────
  // children = dynamic page content rendered inside this layout
  // breadcrumb = page title text displayed in the topbar
  //   (defaults to "Dashboard" if not provided)

  // ──────────────────────────────────────────────────────
  // Hook Usage: useAuth()
  // Gets authentication functions and current user data
  // ──────────────────────────────────────────────────────
  // logout = function to log out the current user
  // user = object with current user's info (fullName, email, etc.)
  const { logout, user } = useAuth();

  // ──────────────────────────────────────────────────────
  // Hook Usage: useNavigate(), useLocation()
  // Used for programmatic page navigation (redirects) & route detection
  // ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();

  // ──────────────────────────────────────────────────────
  // Hook Usage: useState()
  // Controls sidebar visibility on mobile devices
  // ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Loading screen state (3-second interval) ──────────
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Initializing SmartServe Admin Portal...");

  // ── Logout screen state (3-second interval) ───────────
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  // Trigger 3-second loading screen ONLY when logging in
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("smartserve_admin_just_logged_in");
    if (justLoggedIn === "true") {
      setIsLoading(true);
      setLoadingProgress(0);

      const startTime = Date.now();
      const duration = 3000; // 3 seconds interval

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setLoadingProgress(progress);

        if (progress < 35) {
          setLoadingStatus("Connecting to SmartServe server...");
        } else if (progress < 70) {
          setLoadingStatus("Fetching administrative data & metrics...");
        } else if (progress < 100) {
          setLoadingStatus("Finalizing dashboard layout...");
        }

        if (elapsed >= duration) {
          clearInterval(timer);
          setIsLoading(false);
          sessionStorage.removeItem("smartserve_admin_just_logged_in");
        }
      }, 30);

      return () => clearInterval(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Logout Function with 3-second Logout Screen
  // ─────────────────────────────────────────────
  const handleLogout = () => {
    setIsLoggingOut(true);
    setLogoutProgress(0);
    setLogoutCountdown(3);

    const startTime = Date.now();
    const duration = 3000; // 3 seconds interval

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      const remainingSeconds = Math.max(1, Math.ceil((duration - elapsed) / 1000));

      setLogoutProgress(progress);
      setLogoutCountdown(remainingSeconds);

      if (elapsed >= duration) {
        clearInterval(timer);
        logout();
        navigate("/login", { replace: true });
      }
    }, 30);
  };

  // Global custom event listener so Account page or any child can trigger animated logout
  useEffect(() => {
    const handleLogoutEvent = () => {
      handleLogout();
    };
    window.addEventListener("smartserve:admin-logout", handleLogoutEvent);
    return () => window.removeEventListener("smartserve:admin-logout", handleLogoutEvent);
  }, []);

  // ─────────────────────────────────────────────
  // User Initials Generator
  // Purpose:
  // Automatically creates initials for avatar display
  //
  // Example:
  // "Juan Dela Cruz" → "JD"
  // "Maria Santos" → "MS"
  // ─────────────────────────────────────────────


  // ──────────────────────────────────────────────────────
  // Derived Value: User Initials for Avatar
  // Purpose: Generate user initials for display in topbar avatar
  // Logic: Take first letter of each word in full name
  // ──────────────────────────────────────────────────────
  // Example: "Juan Dela Cruz" → "JD"
  // Example: "Maria Santos" → "MS"
  // Fallback: "A" if no fullName is available
  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const profileImageSrc = resolveProfileImageUrl(user?.profileImageUrl || "");

  return (
    <AdminLayoutContext.Provider value={{ triggerLogout: handleLogout }}>
      {/* ── Custom Animated 3-Second Logout Screen Overlay ── */}
      {isLoggingOut && (
        <AdminLogoutScreen
          countdown={logoutCountdown}
          progress={logoutProgress}
          user={user}
        />
      )}

      {/* ── Custom Animated 3-Second Loading Screen Overlay ── */}
      {isLoading && !isLoggingOut && (
        <AdminLoadingScreen
          progress={loadingProgress}
          statusText={loadingStatus}
          onSkip={() => setIsLoading(false)}
        />
      )}

      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* Mobile Overlay (Backdrop) */}
        {/* Purpose: Semi-transparent dark overlay behind sidebar on mobile */}
        {/* Only visible when sidebar is open AND on small screens (lg:hidden) */}
        {/* Clicking overlay closes the sidebar */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            // Event Handler: Close sidebar when user clicks the overlay
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* Sidebar Navigation Panel */}
        {/* Purpose: Main navigation menu for admin dashboard */}
        {/* Features:
          - Fixed on mobile, static on desktop
          - Slides in/out from left side (mobile)
          - Dark green background with white text
          - Contains logo, menu items, and logout button */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-[260px] flex-shrink-0 flex flex-col
          bg-[#4a6741] text-white
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-hidden
        `}
        >
          {/* Decorative circles */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-24 right-[-60px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* Sidebar Header: Logo and App Title */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
            {/* App Logo Image */}
            <img src={logo} alt="SmartServe" className="w-10 h-10 object-contain flex-shrink-0" />
            <div>
              {/* App Name */}
              <p className="font-bold text-base leading-tight">SmartServe</p>
              {/* Subtext: "Admin Portal" */}
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* Navigation Menu Section */}
          {/* Purpose: Displays sidebar menu items that user can click to navigate */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 relative z-10">
            {/* "MENU" Section Label */}
            <p className="text-white/40 text-[10px] uppercase tracking-widest px-3 mb-2">Menu</p>
            <ul className="space-y-0.5">
              {/* Loop through navItems array and render each menu item */}
              {navItems.map(({ label, icon, to, wip }) => (
                <li key={label}>
                  {/* Render different UI based on whether feature is Work In Progress (wip) */}
                  {wip ? (
                    // ──────────────────────────────────────────────────────
                    // WIP Button: For features not yet implemented
                    // ──────────────────────────────────────────────────────
                    <button
                      // Event Handlers:
                      // 1. Close sidebar when feature button is clicked
                      // 2. Show toast notification "Not yet implemented"
                      onClick={() => {
                        setSidebarOpen(false);
                        toast("Not yet implemented", { icon: "🚧" });
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <span className="text-[18px]">{icon}</span>
                      {label}
                    </button>
                  ) : (
                    // ──────────────────────────────────────────────────────
                    // NavLink: For implemented features
                    // Automatically highlights active link with different color
                    // ──────────────────────────────────────────────────────
                    <NavLink
                      // Navigation path
                      to={to}
                      // end={true} only for exact dashboard match
                      end={to === "/dashboard"}
                      // Close sidebar on mobile when link is clicked
                      onClick={() => setSidebarOpen(false)}
                      // Dynamic className: Changes appearance based on whether this link is active
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive
                          ? "bg-white text-[#4a6741] shadow-sm"
                          /* Inactive Link: White text with green background on hover */
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <span className="text-[18px]">{icon}</span>
                      {label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* Logout Button Section */}
          {/* Positioned at bottom of sidebar */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <div className="px-3 pb-5 relative z-20">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white w-full transition cursor-pointer"
            >
              <IoLogOutOutline className="text-[18px]" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* Topbar Header */}
          {/* Purpose: Top navigation bar with breadcrumb, search, and user profile */}
          {/* Features:
            - Sticky header with white background
            - Responsive: Changes layout on mobile vs desktop
            - Contains breadcrumb title and user actions */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 flex items-center px-6 lg:px-8 gap-6">
            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* Mobile Hamburger Menu Button */}
            {/* Only visible on small screens (lg:hidden) */}
            {/* When clicked, opens the sidebar menu */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <button
              className="lg:hidden text-gray-500 text-2xl"
              // Event Handler: Show sidebar when hamburger button is clicked (mobile only)
              onClick={() => setSidebarOpen(true)}
            >
              <IoMenuOutline />
            </button>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* Breadcrumb Section */}
            {/* Purpose: Display current page title and location in app hierarchy */}
            {/* Shows: "Admin Portal" (subtitle) and breadcrumb prop (page title) */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <div className="min-w-0">
              {/* Subtitle: "ADMIN PORTAL" */}
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                Admin Portal
              </p>
              {/* Page Title: Passed as breadcrumb prop from parent */}
              {/* Example: "Dashboard", "Inventory", "Orders", etc. */}
              <p className="text-sm font-bold text-gray-800 truncate">{breadcrumb}</p>
            </div>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* Real-Time Campus Clock & Service Date */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <div className="flex-1 flex justify-center">
              <HeaderClock />
            </div>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* Right-side Actions Section */}
            {/* Contains: Notification bell and user profile avatar */}
            {/* Positioned on far right of topbar (ml-auto) */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 ml-auto">
              {/* ──────────────────────────────────────────────────────────────────── */}
              {/* Notification Bell Component */}
              {/* Displays: Notification list when clicked, shows unread count badge */}
              {/* ──────────────────────────────────────────────────────────────────── */}
              <NotificationBell />

              {/* ──────────────────────────────────────────────────────────────────── */}
              {/* User Avatar */}
              {/* Purpose: Display logged-in user's initials in a circular avatar */}
              {/* Example: "Juan Dela Cruz" displays as "JD" */}
              {/* ──────────────────────────────────────────────────────────────────── */}
              <button
                onClick={() => navigate("/dashboard/account")}
                title="View account information"
                className="w-9 h-9 rounded-full bg-[#4a6741] border border-[#4a6741]/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden hover:scale-105 transition"
              >
                {profileImageSrc ? (
                  <img src={profileImageSrc} alt={user?.fullName || "User"} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </button>
            </div>
          </header>

          {/* Page content */}
          <main key={location.pathname} className="flex-1 overflow-y-auto p-6 lg:p-8 animate-admin-page-fade-in">
            {children}
          </main>
        </div>
      </div>
    </AdminLayoutContext.Provider>
  );
}

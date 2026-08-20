// Import React hooks used for state, references, and side effects
import { useState, useRef, useEffect } from "react";

// Import routing tools from React Router
// NavLink is used for sidebar links
// useNavigate is used to redirect the user after logout

import { NavLink, useNavigate } from "react-router-dom";
// Used to show small popup messages/toasts
import toast from "react-hot-toast";

// Import icons used in the admin dashboard UI
import {
  IoGridOutline,
  IoPersonAddOutline,
  IoSearchOutline,
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
} from "react-icons/io5";
import { MdPeopleOutline, MdMenuBook, MdNotificationsNone, MdHistoryEdu } from "react-icons/md";

// Import authentication context
// This gives access to the logged-in user and logout function
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

// Import SmartServe logo used in the sidebar
import logo from "../assets/logo/logo.png";

// ── Notification type config ──────────────────────────────────────────────────
const NOTIF_CONFIG = {
  order_placed:    { label: "New Order",       icon: <IoOrderIcon />,  color: "bg-blue-100 text-blue-600" },
  order_status:    { label: "Order Update",    icon: <IoOrderIcon />,  color: "bg-yellow-100 text-yellow-600" },
  byoc_awarded:    { label: "Eco Points",      icon: <IoLeafOutline />, color: "bg-green-100 text-[#4a6741]" },
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

// ─────────────────────────────────────────────
// Sidebar Navigation Items
// Purpose:
// Ito ang listahan ng menu items na makikita sa admin sidebar.
// Each object represents one sidebar button/link.
// ─────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", icon: <IoGridOutline />, to: "/dashboard" },
  { label: "Register User", icon: <IoPersonAddOutline />, to: "/dashboard/register-student" },
  { label: "User Lookup", icon: <IoSearchOutline />, to: "/dashboard/student-lookup", wip: true },
  { label: "Inventory", icon: <IoCubeOutline />, to: "/dashboard/inventory" },
  { label: "Orders", icon: <IoReceiptOutline />, to: "/dashboard/orders" },
  { label: "Alerts", icon: <IoNotificationsOutline />, to: "/dashboard/alerts", wip: true },
  { label: "Analytics", icon: <IoBarChartOutline />, to: "/dashboard/analytics" },
  { label: "Rewards", icon: <IoGiftOutline />, to: "/dashboard/rewards" },
  { label: "Staff Accounts", icon: <MdPeopleOutline />, to: "/dashboard/settings/staff" },
  { label: "Menu Management", icon: <MdMenuBook />, to: "/dashboard/settings/menu" },
  { label: "Alert Settings", icon: <MdNotificationsNone />, to: "/dashboard/settings/alerts" },
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
  // Hook Usage: useNavigate()
  // Used for programmatic page navigation (redirects)
  // ──────────────────────────────────────────────────────
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────
  // Hook Usage: useState()
  // Controls sidebar visibility on mobile devices
  // ──────────────────────────────────────────────────────
  // sidebarOpen = true when sidebar is visible, false when hidden
  // setSidebarOpen = function to toggle sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

// ─────────────────────────────────────────────
// Logout Function
// Purpose:
// Logs out the current user
// then redirects to the login page
// ─────────────────────────────────────────────

  // ──────────────────────────────────────────────────────
  // Event Handler Function: handleLogout
  // Purpose: Logout user and redirect to login page
  // ──────────────────────────────────────────────────────
  const handleLogout = () => {
    // Call logout() function from AuthContext
    // This removes:
    // - Authentication token
    // - Current user data from session
    // - Any cached user credentials
    logout();

    // Redirect user to the login page
    // navigate() is React Router's programmatic navigation
    navigate("/login");
  };

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

  return (
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
        <div className="px-3 pb-5 relative z-10">
          <button
            // Event Handler: Call handleLogout() function when clicked
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white w-full transition"
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
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4">
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
          {/* Search Bar */}
          {/* Only visible on medium screens and up (hidden sm:flex) */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            {/* Search Icon */}
            <IoSearchOutline className="text-gray-400 text-base flex-shrink-0" />
            {/* Search Input Field */}
            {/* Note: This is a placeholder - actual search functionality would need to be implemented */}
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
            />
          </div>

          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* Right-side Actions Section */}
          {/* Contains: Notification bell and user profile avatar */}
          {/* Positioned on far right of topbar (ml-auto) */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 ml-auto">
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
            <div className="w-8 h-8 rounded-full bg-[#4a6741] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {/* Display user initials (generated above) */}
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

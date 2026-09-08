import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import logo from "../assets/logo/logo.png";

// ── Notification type config ──────────────────────────────────────────────────
const NOTIF_CONFIG = {
  order_placed:    { label: "New Order",       icon: <IoOrderIcon />,  color: "bg-blue-100 text-blue-600" },
  order_status:    { label: "Order Update",    icon: <IoOrderIcon />,  color: "bg-yellow-100 text-yellow-600" },
  byoc_awarded:    { label: "Eco Points",      icon: <IoLeafOutline />, color: "bg-green-100 text-[#4a6741]" },
  reward_redeemed: { label: "Reward Redeemed", icon: <IoRewardIcon />, color: "bg-purple-100 text-purple-600" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Notification Bell (uses context) ─────────────────────────────────────────
function NotificationBell() {
  const { notifications, unread, markAllRead, markOneRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening && unread > 0) markAllRead();
        }}
        className="relative text-gray-500 hover:text-gray-700 transition"
      >
        <IoNotificationsOutline className="text-2xl" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold px-0.5">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
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

const navItems = [
  { label: "Dashboard", icon: <IoGridOutline />, to: "/dashboard" },
  { label: "Register Student and Employee", icon: <IoPersonAddOutline />, to: "/dashboard/register-student" },
  { label: "Student & Employee Lookup", icon: <IoSearchOutline />, to: "/dashboard/student-lookup", wip: true },
  { label: "Inventory", icon: <IoCubeOutline />, to: "/dashboard/inventory" },
  { label: "Orders", icon: <IoReceiptOutline />, to: "/dashboard/orders" },
  { label: "Alerts", icon: <IoNotificationsOutline />, to: "/dashboard/alerts", wip: true },
  { label: "Analytics", icon: <IoBarChartOutline />, to: "/dashboard/analytics", wip: true },
  { label: "Rewards", icon: <IoGiftOutline />, to: "/dashboard/rewards" },
  { label: "Settings", icon: <IoSettingsOutline />, to: "/dashboard/settings" },
];

export default function AdminLayout({ children, breadcrumb = "Dashboard" }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img src={logo} alt="SmartServe" className="w-10 h-10 object-contain flex-shrink-0" />
          <div>
            <p className="font-bold text-base leading-tight">SmartServe</p>
            <p className="text-white/60 text-[10px] uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 relative z-10">
          <p className="text-white/40 text-[10px] uppercase tracking-widest px-3 mb-2">Menu</p>
          <ul className="space-y-0.5">
            {navItems.map(({ label, icon, to, wip }) => (
              <li key={label}>
                {wip ? (
                  <button
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
                  <NavLink
                    to={to}
                    end={to === "/dashboard"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive
                        ? "bg-white text-[#4a6741] shadow-sm"
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

        {/* Logout */}
        <div className="px-3 pb-5 relative z-10">
          <button
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
        {/* Topbar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-gray-500 text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            <IoMenuOutline />
          </button>

          {/* Breadcrumb */}
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">
              Admin Portal
            </p>
            <p className="text-sm font-bold text-gray-800 truncate">{breadcrumb}</p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <IoSearchOutline className="text-gray-400 text-base flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-[#4a6741] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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

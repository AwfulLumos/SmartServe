import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  IoGlobeOutline,
  IoWifiOutline,
  IoDesktopOutline,
  IoPhonePortraitOutline,
  IoTabletPortraitOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoCheckmarkOutline,
  IoCopyOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoInformationCircleOutline,
  IoPulseOutline,
  IoCloseOutline,
  IoRadioOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoWarningOutline,
  IoTrashOutline,
  IoShieldOutline,
  IoLockClosedOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import api from "../../../utils/api";
import { SkeletonTable } from "../../SkeletonLoader";
import CustomFilterSelect from "./CustomFilterSelect";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "all", label: "All Account Types" },
  { value: "student", label: "Student" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

const DEVICE_OPTIONS = [
  { value: "all", label: "All Devices" },
  { value: "mobile", label: "Smartphone / Mobile" },
  { value: "desktop", label: "Desktop / Laptop" },
  { value: "tablet", label: "Tablet Device" },
];

const ACTIVITY_OPTIONS = [
  { value: "all", label: "All Activity" },
  { value: "recent", label: "Active Recently" },
  { value: "inactive", label: "Inactive / Idle" },
];

const FAILED_ACCOUNT_OPTIONS = [
  { value: "all", label: "All Account Types" },
  { value: "student", label: "Student Accounts" },
  { value: "staff", label: "Staff Accounts" },
  { value: "admin", label: "Admin Accounts" },
  { value: "staff_admin", label: "Staff & Admins" },
  { value: "unknown", label: "Unregistered / Unknown" },
];

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

const formatTimeAgo = (rawDate) => {
  if (!rawDate) return { relative: "No time recorded", full: "No recorded time", isRecent: false };
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return { relative: "Unknown", full: String(rawDate), isRecent: false };

  const now = Date.now();
  const diffMs = now - d.getTime();
  const full = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  if (diffMs < 60000 && diffMs > -10000) {
    return { relative: "Just now", full, isRecent: true };
  }
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return { relative: `${diffMin}m ago`, full, isRecent: diffMin <= 15 };
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return { relative: `${diffHours}h ago`, full, isRecent: false };
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return { relative: `${diffDays}d ago`, full, isRecent: false };

  const shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return { relative: shortDate, full, isRecent: false };
};

export default function UsersIpTrackerTab() {
  const navigate = useNavigate();

  // Active View Tab: 'users' or 'failedLogins'
  const [activeView, setActiveView] = useState("users");

  // ── Users State ─────────────────────────────────────────────────────────────
  const [data, setData] = useState({ stats: {}, sessions: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [copiedIp, setCopiedIp] = useState(null);

  // Inspector Modal State (User)
  const [selectedUser, setSelectedUser] = useState(null);

  // Ping Testing State
  const [pingingUser, setPingingUser] = useState(null);
  const [pingResults, setPingResults] = useState({});

  // Pagination State (Users)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // ── Failed Logins State ───────────────────────────────────────────────────
  const [failedData, setFailedData] = useState({ stats: {}, attempts: [], total: 0, page: 1, pages: 1 });
  const [failedLoading, setFailedLoading] = useState(false);
  const [failedSearch, setFailedSearch] = useState("");
  const [failedAccountType, setFailedAccountType] = useState("all");
  const [failedDevice, setFailedDevice] = useState("all");
  const [failedPage, setFailedPage] = useState(1);
  const [failedPageSize, setFailedPageSize] = useState(15);

  // Failed Login Inspector & Modals
  const [selectedFailed, setSelectedFailed] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // ── Fetching Data ─────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/network/sessions");
      setData(res.data || { stats: {}, sessions: [] });
    } catch {
      toast.error("Failed to load users & IP tracker data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFailedLogins = useCallback(async () => {
    setFailedLoading(true);
    try {
      const params = new URLSearchParams({
        page: failedPage,
        limit: failedPageSize,
        ...(failedSearch && { search: failedSearch }),
        ...(failedAccountType !== "all" && { accountType: failedAccountType }),
        ...(failedDevice !== "all" && { deviceType: failedDevice }),
      });
      const res = await api.get(`/network/failed-logins?${params}`);
      setFailedData(res.data || { stats: {}, attempts: [], total: 0, page: 1, pages: 1 });
    } catch {
      toast.error("Failed to load failed login logs");
    } finally {
      setFailedLoading(false);
    }
  }, [failedPage, failedPageSize, failedSearch, failedAccountType, failedDevice]);

  useEffect(() => {
    fetchUsers();
    fetchFailedLogins();
  }, []);

  useEffect(() => {
    if (activeView === "failedLogins") {
      fetchFailedLogins();
    }
  }, [activeView, fetchFailedLogins]);

  // Lock background scroll when any inspector or delete modal is open
  useEffect(() => {
    if (selectedUser || selectedFailed || deleteTarget || clearModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedUser, selectedFailed, deleteTarget, clearModalOpen]);

  const copyIp = (ip, e) => {
    if (e) e.stopPropagation();
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
    toast.success(`Copied IP ${ip}`);
  };

  const handlePing = async (user, e) => {
    if (e) e.stopPropagation();
    const ip = user.ipAddress || user.ip;
    if (!ip) {
      toast.error("No IP address assigned to ping");
      return;
    }

    setPingingUser(user._id);
    try {
      const res = await api.post("/network/ping", { ipAddress: ip, name: user.name });
      setPingResults((prev) => ({
        ...prev,
        [user._id]: res.data,
      }));
      toast.success(`Ping response from ${ip}: ${res.data.roundTripTimeMs} ms`);
    } catch {
      toast.error(`Ping failed for ${ip}`);
    } finally {
      setPingingUser(null);
    }
  };

  const handleDeleteFailedEntry = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/network/failed-logins/${deleteTarget._id}`);
      toast.success("Failed login attempt removed");
      setDeleteTarget(null);
      fetchFailedLogins();
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAllFailed = async () => {
    setClearing(true);
    try {
      const res = await api.delete("/network/failed-logins/clear-all");
      toast.success(res.data?.message || "All failed login records cleared");
      setClearModalOpen(false);
      fetchFailedLogins();
    } catch {
      toast.error("Failed to clear records");
    } finally {
      setClearing(false);
    }
  };

  // ── Users Filter Pipeline ─────────────────────────────────────────────────
  const filteredSessions = useMemo(() => {
    const list = data.sessions || [];
    const query = searchQuery.trim().toLowerCase();
    const now = Date.now();

    return list.filter((item) => {
      // 1. Text Search Filter
      if (query) {
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesId = item.userId?.toLowerCase().includes(query) || item.identifier?.toLowerCase().includes(query);
        const matchesEmail = item.email?.toLowerCase().includes(query);
        const matchesIp = item.ipAddress?.includes(query);
        const matchesRegion = item.region?.toLowerCase().includes(query) || item.networkZone?.toLowerCase().includes(query);
        const matchesDevice = item.deviceType?.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesEmail && !matchesIp && !matchesRegion && !matchesDevice) {
          return false;
        }
      }

      // 2. Account Type Filter
      if (accountTypeFilter !== "all") {
        if (accountTypeFilter === "student" && item.userType !== "student") return false;
        if (accountTypeFilter === "staff" && (item.userType !== "admin" || item.role === "admin")) return false;
        if (accountTypeFilter === "admin" && item.role !== "admin") return false;
      }

      // 3. Device Form Factor Filter
      if (deviceFilter !== "all") {
        const d = (item.deviceType || "").toLowerCase();
        if (deviceFilter === "mobile" && !d.includes("phone") && !d.includes("mobile")) return false;
        if (deviceFilter === "desktop" && !d.includes("desktop") && !d.includes("pc") && !d.includes("laptop")) return false;
        if (deviceFilter === "tablet" && !d.includes("tablet") && !d.includes("ipad")) return false;
      }

      // 4. Activity Filter
      if (activityFilter !== "all") {
        const isRecent = item.lastActive && now - new Date(item.lastActive).getTime() < 30 * 60 * 1000;
        if (activityFilter === "recent" && !isRecent) return false;
        if (activityFilter === "inactive" && isRecent) return false;
      }

      return true;
    });
  }, [data.sessions, searchQuery, accountTypeFilter, deviceFilter, activityFilter]);

  // Pagination Slice for Users
  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, accountTypeFilter, deviceFilter, activityFilter, pageSize]);

  const stats = data.stats || {};
  const failedStats = failedData.stats || {};

  return (
    <div className="space-y-6">
      {/* ── Sub-Navigation View Switcher ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("users")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeView === "users"
              ? "bg-[#4a6741] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            <IoPeopleOutline className="text-base" />
            <span>Registered Users & Telemetry</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeView === "users" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                }`}
            >
              {data.sessions?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveView("failedLogins")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeView === "failedLogins"
              ? "bg-rose-700 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            <IoWarningOutline className="text-base" />
            <span>Failed Login Attempts</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeView === "failedLogins"
                ? "bg-white/20 text-white"
                : failedStats.total > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              {failedStats.total ?? 0}
            </span>
          </button>
        </div>

        {activeView === "failedLogins" && failedData.total > 0 && (
          <button
            onClick={() => setClearModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
          >
            <IoTrashOutline className="text-sm" />
            <span>Clear Failed Logs</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: REGISTERED USERS & TELEMETRY                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === "users" && (
        <>
          {/* ── Metric Summary Cards ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Users */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Total Users Tracked
                </span>
                <div className="text-2xl font-black text-gray-800 mt-1">
                  {stats.totalSessions ?? (data.sessions || []).length}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">All students, staff & administrators</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#e8f5e2] text-[#4a6741] flex items-center justify-center text-2xl flex-shrink-0">
                <IoPeopleOutline />
              </div>
            </div>

            {/* Card 2: Students */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Students
                </span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {stats.totalStudents ?? stats.studentsOnWifi ?? 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Registered student accounts</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
                <IoPhonePortraitOutline />
              </div>
            </div>

            {/* Card 3: Staff & Admins */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Staff & Admins
                </span>
                <div className="text-2xl font-black text-purple-600 mt-1">
                  {stats.totalStaffAdmins ?? stats.adminsOnLan ?? 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Active staff & administrators</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                <IoDesktopOutline />
              </div>
            </div>

            {/* Card 4: Active Today */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Active Recently
                </span>
                <div className="text-2xl font-black text-blue-600 mt-1 flex items-center gap-2">
                  {stats.liveCount ?? 0}
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Telemetry active within 30 mins</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0">
                <IoPulseOutline />
              </div>
            </div>
          </div>

          {/* ── Search & Filters Controls Card Container (Styled identically to Menu Management) ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-[240px] relative">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, student ID, email, assigned IP, or device…"
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  title="Clear search"
                >
                  <IoCloseOutline className="text-lg" />
                </button>
              )}
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <CustomFilterSelect
                  value={accountTypeFilter}
                  onChange={setAccountTypeFilter}
                  options={ACCOUNT_TYPE_OPTIONS}
                />
                <CustomFilterSelect
                  value={deviceFilter}
                  onChange={setDeviceFilter}
                  options={DEVICE_OPTIONS}
                />
                <CustomFilterSelect
                  value={activityFilter}
                  onChange={setActivityFilter}
                  options={ACTIVITY_OPTIONS}
                />
              </div>

              <button
                onClick={fetchUsers}
                disabled={loading}
                className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0 cursor-pointer disabled:opacity-50"
                title="Refresh"
              >
                <IoRefreshOutline className={`text-base ${loading ? "animate-spin text-[#4a6741]" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── Telemetry Table ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-5">
                <SkeletonTable rows={8} columns={7} showHeader={false} />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl mb-3">
                  <IoGlobeOutline />
                </div>
                <h3 className="text-base font-bold text-gray-800">No matching users found</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  Try adjusting your search keywords or clearing active filters to see all registered users.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setAccountTypeFilter("all");
                    setDeviceFilter("all");
                    setActivityFilter("all");
                  }}
                  className="mt-4 px-4 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] transition shadow-sm cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">User / Student</th>
                      <th className="py-3.5 px-4">Account Type</th>
                      <th className="py-3.5 px-4">Assigned IP Address</th>
                      <th className="py-3.5 px-4">Region</th>
                      <th className="py-3.5 px-4">Device Form Factor</th>
                      <th className="py-3.5 px-4">Last Activity</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {paginatedSessions.map((session, idx) => {
                      const ip = session.ipAddress || session.ip || "";
                      const device = session.deviceType || session.device || "Unknown Device";
                      const deviceLower = device.toLowerCase();
                      const isMobile = deviceLower.includes("phone") || deviceLower.includes("mobile");
                      const isTablet = deviceLower.includes("tablet") || deviceLower.includes("ipad");
                      const isStudent = session.userType !== "admin";
                      const lastActive = session.lastActive || session.lastActiveAt;
                      const isPinging = pingingUser === session._id;
                      const pingData = pingResults[session._id];

                      return (
                        <tr
                          key={session._id || `user-row-${idx}`}
                          onClick={() => setSelectedUser(session)}
                          className="hover:bg-[#d7ecc8]/10 transition cursor-pointer group"
                        >
                          {/* Column 1: User / Student */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#d7ecc8]/40 border border-[#4a6741]/20 flex items-center justify-center text-[#4a6741] font-bold text-xs flex-shrink-0 overflow-hidden">
                                {session.avatar ? (
                                  <img
                                    src={resolveImageUrl(session.avatar)}
                                    alt={session.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (session.name || "U")[0]?.toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-gray-900 block truncate group-hover:text-[#4a6741] transition">
                                  {session.name || "Unknown User"}
                                </span>
                                <span className="text-[11px] text-gray-400 font-mono block truncate">
                                  {session.userId || session.identifier || "—"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Account Type */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isStudent
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : session.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-sky-50 text-sky-700 border-sky-200"
                                }`}
                            >
                              {session.roleLabel || (isStudent ? "Student (BYOD)" : "Staff")}
                            </span>
                          </td>

                          {/* Column 3: Assigned IP Address */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-gray-800">
                                {ip || "—"}
                              </span>
                              {ip && (
                                <button
                                  onClick={(e) => copyIp(ip, e)}
                                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition cursor-pointer"
                                  title="Copy assigned IP"
                                >
                                  {copiedIp === ip ? (
                                    <IoCheckmarkOutline className="text-emerald-600 text-sm" />
                                  ) : (
                                    <IoCopyOutline className="text-xs" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Column 4: Region */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <IoLocationOutline className="text-red-500 text-sm flex-shrink-0" />
                              <span className="font-semibold text-gray-800 text-xs">Philippines</span>
                            </div>
                          </td>

                          {/* Column 5: Device Form Factor */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              {isMobile ? (
                                <IoPhonePortraitOutline className="text-sm text-emerald-600 flex-shrink-0" />
                              ) : isTablet ? (
                                <IoTabletPortraitOutline className="text-sm text-amber-600 flex-shrink-0" />
                              ) : (
                                <IoDesktopOutline className="text-sm text-purple-600 flex-shrink-0" />
                              )}
                              <span className="truncate max-w-[140px]" title={device}>
                                {device}
                              </span>
                            </div>
                          </td>

                          {/* Column 6: Last Activity */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {(() => {
                              const timeInfo = formatTimeAgo(lastActive);
                              return (
                                <div
                                  className="text-gray-500 font-mono text-[11px] flex items-center gap-1.5"
                                  title={timeInfo.full}
                                >
                                  {timeInfo.isRecent && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                  )}
                                  <span>{timeInfo.relative}</span>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Column 7: Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Ping Test Button */}
                              <button
                                onClick={(e) => handlePing(session, e)}
                                disabled={isPinging}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${pingData
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-gray-50 hover:bg-[#4a6741] hover:text-white text-gray-700 border-gray-200"
                                  }`}
                                title="Test connection latency with ICMP Ping"
                              >
                                <IoRadioOutline className={`text-xs ${isPinging ? "animate-spin text-[#4a6741]" : ""}`} />
                                {isPinging ? "Pinging..." : pingData ? `${pingData.roundTripTimeMs}ms` : "Ping"}
                              </button>

                              {/* Inspect Modal Trigger */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(session);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-[#4a6741] hover:text-white rounded-lg text-[10px] font-bold text-gray-700 transition cursor-pointer"
                                title="Inspect user telemetry details"
                              >
                                <IoInformationCircleOutline className="text-xs" />
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Table Pagination Bar ──────────────────────────────────── */}
            {!loading && filteredSessions.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50/50">
                <div className="text-xs text-gray-500 flex items-center gap-3">
                  <span>
                    Showing{" "}
                    <strong className="text-gray-800">
                      {(currentPage - 1) * pageSize + 1} -{" "}
                      {Math.min(currentPage * pageSize, filteredSessions.length)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{filteredSessions.length}</strong> users
                  </span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#4a6741] cursor-pointer shadow-xs"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                    title="Previous Page"
                  >
                    <IoChevronBackOutline />
                  </button>

                  <div className="text-xs font-semibold px-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                    title="Next Page"
                  >
                    <IoChevronForwardOutline />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: FAILED LOGIN ATTEMPTS TRACKER                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === "failedLogins" && (
        <>
          {/* ── Failed Logins Summary Metric Cards ──────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Failed Logins */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Total Failed Attempts
                </span>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {failedStats.total ?? 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Recorded unsuccessful logins</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl flex-shrink-0">
                <IoWarningOutline />
              </div>
            </div>

            {/* Card 2: Student Failed Logins */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Student Attempts
                </span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {failedStats.studentTotal ?? 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Invalid student login attempts</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl flex-shrink-0">
                <IoPhonePortraitOutline />
              </div>
            </div>

            {/* Card 3: Staff & Admin Failed Logins */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Staff & Admin Attempts
                </span>
                <div className="text-2xl font-black text-purple-600 mt-1">
                  {failedStats.staffAdminTotal ?? 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Staff portal failed logins</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                <IoShieldOutline />
              </div>
            </div>

            {/* Card 4: Last 24 Hours */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Recent (24 Hours)
                </span>
                <div className="text-2xl font-black text-indigo-600 mt-1 flex items-center gap-2">
                  {failedStats.recent24h ?? 0}
                  {failedStats.recent24h > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Attempts in past 24 hours</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
                <IoTimeOutline />
              </div>
            </div>
          </div>

          {/* ── Search & Filter Controls (Menu Management Styling) ──────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-[240px] relative">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                value={failedSearch}
                onChange={(e) => {
                  setFailedSearch(e.target.value);
                  setFailedPage(1);
                }}
                placeholder="Search by name, student ID, username, IP, or failure reason…"
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
              />
              {failedSearch && (
                <button
                  onClick={() => {
                    setFailedSearch("");
                    setFailedPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  title="Clear search"
                >
                  <IoCloseOutline className="text-lg" />
                </button>
              )}
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <CustomFilterSelect
                  value={failedAccountType}
                  onChange={(val) => {
                    setFailedAccountType(val);
                    setFailedPage(1);
                  }}
                  options={FAILED_ACCOUNT_OPTIONS}
                />
                <CustomFilterSelect
                  value={failedDevice}
                  onChange={(val) => {
                    setFailedDevice(val);
                    setFailedPage(1);
                  }}
                  options={DEVICE_OPTIONS}
                />
              </div>

              <button
                onClick={fetchFailedLogins}
                disabled={failedLoading}
                className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0 cursor-pointer disabled:opacity-50"
                title="Refresh Failed Logins"
              >
                <IoRefreshOutline className={`text-base ${failedLoading ? "animate-spin text-[#4a6741]" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── Failed Logins Telemetry Table ────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {failedLoading ? (
              <div className="p-5">
                <SkeletonTable rows={6} columns={8} showHeader={false} />
              </div>
            ) : failedData.attempts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-3">
                  <IoCheckmarkOutline />
                </div>
                <h3 className="text-base font-bold text-gray-800">No failed login attempts recorded</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  {failedSearch || failedAccountType !== "all" || failedDevice !== "all"
                    ? "No attempts match your current search or filter criteria."
                    : "All recent login attempts for both students and staff have succeeded."}
                </p>
                {(failedSearch || failedAccountType !== "all" || failedDevice !== "all") && (
                  <button
                    onClick={() => {
                      setFailedSearch("");
                      setFailedAccountType("all");
                      setFailedDevice("all");
                      setFailedPage(1);
                    }}
                    className="mt-4 px-4 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] transition shadow-sm cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">User / Attempted Identifier</th>
                      <th className="py-3.5 px-4">Account Type</th>
                      <th className="py-3.5 px-4">Assigned IP Address</th>
                      <th className="py-3.5 px-4">Region</th>
                      <th className="py-3.5 px-4">Device Form Factor</th>
                      <th className="py-3.5 px-4">Failure Reason</th>
                      <th className="py-3.5 px-4">Attempted At</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {failedData.attempts.map((attempt) => {
                      const ip = attempt.ipAddress || attempt.ip || "";
                      const device = attempt.deviceType || attempt.device || "Unknown Device";
                      const deviceLower = device.toLowerCase();
                      const isMobile = deviceLower.includes("phone") || deviceLower.includes("mobile");
                      const isTablet = deviceLower.includes("tablet") || deviceLower.includes("ipad");
                      const isStudent = attempt.accountType === "student";
                      const isAdmin = attempt.accountType === "admin";
                      const isStaff = attempt.accountType === "staff";
                      const timeInfo = formatTimeAgo(attempt.attemptedAt || attempt.createdAt);

                      return (
                        <tr
                          key={attempt._id}
                          onClick={() => setSelectedFailed(attempt)}
                          className="hover:bg-rose-50/20 transition cursor-pointer group"
                        >
                          {/* Column 1: User / Attempted Identifier */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs flex-shrink-0 overflow-hidden">
                                <IoAlertCircleOutline className="text-lg text-rose-600" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-gray-900 block truncate group-hover:text-rose-700 transition">
                                  {attempt.name || "Unregistered Account"}
                                </span>
                                <span className="text-[11px] text-gray-500 font-mono block truncate">
                                  {attempt.identifier || "—"} {attempt.email ? `• ${attempt.email}` : ""}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Account Type */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isStudent
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isAdmin
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : isStaff
                                    ? "bg-sky-50 text-sky-700 border-sky-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}
                            >
                              {attempt.roleLabel || (isStudent ? "Student" : isStaff ? "Staff" : isAdmin ? "Admin" : "Unknown")}
                            </span>
                          </td>

                          {/* Column 3: Assigned IP Address */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-gray-800">
                                {ip || "—"}
                              </span>
                              {ip && (
                                <button
                                  onClick={(e) => copyIp(ip, e)}
                                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition cursor-pointer"
                                  title="Copy IP"
                                >
                                  {copiedIp === ip ? (
                                    <IoCheckmarkOutline className="text-emerald-600 text-sm" />
                                  ) : (
                                    <IoCopyOutline className="text-xs" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Column 4: Region */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <IoLocationOutline className="text-red-500 text-sm flex-shrink-0" />
                              <span className="font-semibold text-gray-800 text-xs">Philippines</span>
                            </div>
                          </td>

                          {/* Column 5: Device Form Factor */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              {isMobile ? (
                                <IoPhonePortraitOutline className="text-sm text-emerald-600 flex-shrink-0" />
                              ) : isTablet ? (
                                <IoTabletPortraitOutline className="text-sm text-amber-600 flex-shrink-0" />
                              ) : (
                                <IoDesktopOutline className="text-sm text-purple-600 flex-shrink-0" />
                              )}
                              <span className="truncate max-w-[140px]" title={device}>
                                {device}
                              </span>
                            </div>
                          </td>

                          {/* Column 6: Failure Reason */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                              <IoLockClosedOutline className="text-xs" />
                              {attempt.reason}
                            </span>
                          </td>

                          {/* Column 7: Attempted At */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div
                              className="text-gray-500 font-mono text-[11px] flex items-center gap-1.5"
                              title={timeInfo.full}
                            >
                              {timeInfo.isRecent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                              )}
                              <span>{timeInfo.relative}</span>
                            </div>
                          </td>

                          {/* Column 8: Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFailed(attempt);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-700 transition cursor-pointer"
                                title="Inspect attempt details"
                              >
                                <IoInformationCircleOutline className="text-xs" />
                                Inspect
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(attempt);
                                }}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="Delete log entry"
                              >
                                <IoTrashOutline className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Failed Logins Pagination Bar ──────────────────────────── */}
            {!failedLoading && failedData.attempts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50/50">
                <div className="text-xs text-gray-500 flex items-center gap-3">
                  <span>
                    Showing{" "}
                    <strong className="text-gray-800">
                      {(failedPage - 1) * failedPageSize + 1} -{" "}
                      {Math.min(failedPage * failedPageSize, failedData.total)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{failedData.total}</strong> records
                  </span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>Per page:</span>
                    <select
                      value={failedPageSize}
                      onChange={(e) => {
                        setFailedPageSize(Number(e.target.value));
                        setFailedPage(1);
                      }}
                      className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#4a6741] cursor-pointer shadow-xs"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFailedPage((p) => Math.max(1, p - 1))}
                    disabled={failedPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                    title="Previous Page"
                  >
                    <IoChevronBackOutline />
                  </button>

                  <div className="text-xs font-semibold px-2 text-gray-700">
                    Page {failedPage} of {failedData.pages || 1}
                  </div>

                  <button
                    onClick={() => setFailedPage((p) => Math.min(failedData.pages || 1, p + 1))}
                    disabled={failedPage >= (failedData.pages || 1)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                    title="Next Page"
                  >
                    <IoChevronForwardOutline />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── User Telemetry Inspector Modal (Mounted via Portal) ───────── */}
      {selectedUser &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-scaleUp my-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/40 flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden shadow-xs">
                    {selectedUser.avatar ? (
                      <img
                        src={resolveImageUrl(selectedUser.avatar)}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (selectedUser.name || "U")[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-tight text-white truncate">{selectedUser.name}</h3>
                    <p className="text-[11px] text-white/80 font-mono mt-0.5 truncate">
                      {selectedUser.userId || selectedUser.identifier || "ID"} {selectedUser.email ? `• ${selectedUser.email}` : ""}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#4a6741] shadow-2xs">
                      {selectedUser.roleLabel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex-shrink-0"
                  title="Close modal"
                >
                  <IoCloseOutline className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Telemetry Grid */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold text-[#4a6741] uppercase tracking-wider flex items-center gap-1.5">
                    <IoGlobeOutline className="text-base" /> Network & IP Telemetry
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Assigned IP Address</span>
                      <div className="flex items-center justify-between mt-1">
                        <code className="font-mono font-bold text-gray-800">{selectedUser.ipAddress}</code>
                        <button
                          onClick={() => copyIp(selectedUser.ipAddress)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition cursor-pointer"
                          title="Copy IP"
                        >
                          {copiedIp === selectedUser.ipAddress ? (
                            <IoCheckmarkOutline className="text-emerald-600 text-xs" />
                          ) : (
                            <IoCopyOutline className="text-xs" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Network Status</span>
                      <div className="font-bold text-gray-800 mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Online & Active
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                        {selectedUser.networkZone || (selectedUser.userType === "admin" ? "Management Station" : "Campus Wi-Fi Client")}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Region & Country</span>
                      <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                        <IoLocationOutline className="text-red-500 text-xs" />
                        Philippines
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                        {selectedUser.networkZone || "Campus Network Zone"}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Device Form Factor</span>
                      <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                        {selectedUser.deviceType?.toLowerCase().includes("phone") ||
                          selectedUser.deviceType?.toLowerCase().includes("mobile") ? (
                          <IoPhonePortraitOutline className="text-emerald-600 text-xs" />
                        ) : (
                          <IoDesktopOutline className="text-purple-600 text-xs" />
                        )}
                        <span className="truncate">{selectedUser.deviceType}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block mt-0.5">Physical Hardware Profile</span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">
                    Account Information
                  </span>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Account Classification</span>
                    <span className="font-bold text-gray-800">{selectedUser.roleLabel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Unique Identifier</span>
                    <span className="font-mono font-bold text-gray-800">
                      {selectedUser.userId || selectedUser.identifier}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Email Address</span>
                    <span className="font-mono text-gray-700">{selectedUser.email || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Last Telemetry Timestamp</span>
                    <span className="font-mono text-gray-700">
                      {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : "Never"}
                    </span>
                  </div>
                </div>

                {/* Action Shortcuts */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      if (selectedUser.userType === "admin") {
                        navigate("/dashboard/settings/staff");
                      } else {
                        navigate(`/dashboard/orders?search=${encodeURIComponent(selectedUser.userId)}`);
                      }
                    }}
                    className="px-4 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] transition cursor-pointer shadow-sm"
                  >
                    {selectedUser.userType === "admin" ? "Manage Staff Account" : "View Student Records"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── Failed Login Inspector Modal (Mounted via Portal) ─────────── */}
      {selectedFailed &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
            onClick={() => setSelectedFailed(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-scaleUp my-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-rose-700 text-white px-6 py-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/40 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-xs">
                    <IoWarningOutline />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-tight text-white truncate">
                      Failed Login Security Incident
                    </h3>
                    <p className="text-[11px] text-white/80 font-mono mt-0.5 truncate">
                      Attempted: {selectedFailed.identifier}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-rose-700 shadow-2xs">
                      {selectedFailed.roleLabel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFailed(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex-shrink-0"
                  title="Close modal"
                >
                  <IoCloseOutline className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Security Reason Banner */}
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
                  <IoLockClosedOutline className="text-2xl text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Failure Reason</span>
                    <span className="text-rose-700 mt-0.5 block">{selectedFailed.reason}</span>
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <IoGlobeOutline className="text-base text-rose-600" /> Origin Telemetry & Network
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Client IP Address</span>
                      <div className="flex items-center justify-between mt-1">
                        <code className="font-mono font-bold text-gray-800">{selectedFailed.ipAddress}</code>
                        <button
                          onClick={() => copyIp(selectedFailed.ipAddress)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition cursor-pointer"
                          title="Copy IP"
                        >
                          {copiedIp === selectedFailed.ipAddress ? (
                            <IoCheckmarkOutline className="text-emerald-600 text-xs" />
                          ) : (
                            <IoCopyOutline className="text-xs" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Region & Country</span>
                      <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                        <IoLocationOutline className="text-red-500 text-xs" />
                        Philippines
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block mt-0.5">Designated Telemetry Zone</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Device Form Factor</span>
                      <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                        {selectedFailed.deviceType?.toLowerCase().includes("phone") ||
                          selectedFailed.deviceType?.toLowerCase().includes("mobile") ? (
                          <IoPhonePortraitOutline className="text-emerald-600 text-xs" />
                        ) : (
                          <IoDesktopOutline className="text-purple-600 text-xs" />
                        )}
                        <span className="truncate">{selectedFailed.deviceType}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-semibold block">Attempt Timestamp</span>
                      <div className="font-bold text-gray-800 mt-1">
                        {new Date(selectedFailed.attemptedAt || selectedFailed.createdAt).toLocaleTimeString()}
                      </div>
                      <span className="text-[10px] text-gray-400 block truncate">
                        {new Date(selectedFailed.attemptedAt || selectedFailed.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">
                    Attempt Information
                  </span>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Attempted Identifier</span>
                    <span className="font-mono font-bold text-gray-800">{selectedFailed.identifier}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Matched Account Name</span>
                    <span className="font-bold text-gray-800">{selectedFailed.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Email Address</span>
                    <span className="font-mono text-gray-700">{selectedFailed.email || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Target Account Classification</span>
                    <span className="font-bold text-gray-800">{selectedFailed.roleLabel}</span>
                  </div>
                  {selectedFailed.userAgent && (
                    <div className="pt-2">
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider mb-1">
                        Raw User-Agent
                      </span>
                      <code className="text-[11px] font-mono text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block break-all">
                        {selectedFailed.userAgent}
                      </code>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setDeleteTarget(selectedFailed);
                      setSelectedFailed(null);
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Delete Entry
                  </button>
                  <button
                    onClick={() => setSelectedFailed(null)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-700 transition cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── Single Delete Confirmation Modal (Mounted via Portal) ─────── */}
      {deleteTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-scaleUp text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
                <IoTrashOutline />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Failed Login Record?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete the attempt record for{" "}
                  <strong className="text-gray-800">{deleteTarget.identifier}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFailedEntry}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── Clear All Confirmation Modal (Mounted via Portal) ─────────── */}
      {clearModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setClearModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-scaleUp text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
                <IoWarningOutline />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Clear All Failed Logins?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  This will permanently clear all{" "}
                  <strong className="text-rose-600">{failedData.total}</strong> recorded failed login attempt logs from the database.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setClearModalOpen(false)}
                  disabled={clearing}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllFailed}
                  disabled={clearing}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  {clearing ? "Clearing..." : "Clear All Logs"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

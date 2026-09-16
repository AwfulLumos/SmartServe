import { useState, useEffect, useMemo } from "react";
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
} from "react-icons/io5";
import api from "../../../utils/api";
import { SkeletonTable } from "../../SkeletonLoader";

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

const formatLastActive = (rawDate) => {
  if (!rawDate) return { relative: "No activity recorded", full: "No recorded activity", isRecent: false };
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
  const [data, setData] = useState({ stats: {}, sessions: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [copiedIp, setCopiedIp] = useState(null);

  // Inspector Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  // Ping Testing State
  const [pingingUser, setPingingUser] = useState(null);
  const [pingResults, setPingResults] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lock background scroll when inspector modal is open
  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedUser]);

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

  // Filter & Search Pipeline
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

  // Pagination Slice
  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, accountTypeFilter, deviceFilter, activityFilter, pageSize]);

  const stats = data.stats || {};

  return (
    <div className="space-y-6">
      {/* ── Metric Summary Cards ────────────────────────────────────────── */}
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

      {/* ── Search & Filter Controls ───────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by User Name, School ID, Email, Assigned IP, Region, or Device..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs p-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Account Type Filter */}
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl text-xs px-3 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4a6741] cursor-pointer"
            >
              <option value="all">All Account Types</option>
              <option value="student">Student (BYOD)</option>
              <option value="staff">Campus Staff</option>
              <option value="admin">Administrator</option>
            </select>

            {/* Device Form Factor Filter */}
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl text-xs px-3 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4a6741] cursor-pointer"
            >
              <option value="all">All Devices</option>
              <option value="mobile">Smartphone / Mobile</option>
              <option value="desktop">Desktop / Laptop</option>
              <option value="tablet">Tablet Device</option>
            </select>

            {/* Activity Status Filter */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl text-xs px-3 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4a6741] cursor-pointer"
            >
              <option value="all">All Activity</option>
              <option value="recent">Active Recently</option>
              <option value="inactive">Inactive / Idle</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Refresh User Sessions"
            >
              <IoRefreshOutline className={`text-base ${loading ? "animate-spin text-[#4a6741]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Badges & Count */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-gray-800">{filteredSessions.length}</strong> of{" "}
              <strong className="text-gray-800">{data.sessions?.length || 0}</strong> total users
            </span>
            {(searchQuery || accountTypeFilter !== "all" || deviceFilter !== "all" || activityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setAccountTypeFilter("all");
                  setDeviceFilter("all");
                  setActivityFilter("all");
                }}
                className="text-[#4a6741] hover:underline font-semibold ml-2 cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent border border-gray-200 rounded-md px-1.5 py-0.5 text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Telemetry Table ────────────────────────────────────────────── */}
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
              Try adjusting your search keywords or clearing active filters to see all registered users and their assigned IPs.
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
                  const identifier = session.userId || session.identifier || session.schoolId || "—";

                  const rawAvatar = session.avatar || session.profileImage || session.profileImageUrl || "";
                  const avatarUrl = resolveImageUrl(rawAvatar);
                  const nameWords = (session.name || "").trim().split(" ").filter(Boolean);
                  const initials =
                    nameWords.length >= 2
                      ? (nameWords[0][0] + nameWords[nameWords.length - 1][0]).toUpperCase()
                      : nameWords.length === 1
                        ? nameWords[0].slice(0, 2).toUpperCase()
                        : "U";

                  const pingData = pingResults[session._id];
                  const isPinging = pingingUser === session._id;

                  return (
                    <tr
                      key={session._id || idx}
                      className="hover:bg-gray-50/75 transition cursor-pointer"
                      onClick={() => setSelectedUser(session)}
                    >
                      {/* Column 1: User / Student */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#d7ecc8] text-[#4a6741] flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden border border-[#4a6741]/20 shadow-2xs">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={session.name || "User"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget.nextElementSibling;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <span
                              className={`w-full h-full flex items-center justify-center ${avatarUrl ? "hidden" : "flex"
                                }`}
                            >
                              {initials}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 truncate max-w-[180px]" title={session.name}>
                              {session.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                              <span>{identifier}</span>
                              {session.email && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[130px]" title={session.email}>
                                    {session.email}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Account Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${isStudent
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
                          const timeInfo = formatLastActive(lastActive);
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

        {/* ── Table Pagination Bar ────────────────────────────────────────── */}
        {!loading && filteredSessions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <strong className="text-gray-800">
                {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filteredSessions.length)}
              </strong>{" "}
              of <strong className="text-gray-800">{filteredSessions.length}</strong> users
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
                    </div>
                  </div>
                </div>

                {/* Activity & Ping Status Card */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Last Recorded Activity:</span>
                    <span className="font-semibold text-gray-800 font-mono">
                      {formatLastActive(selectedUser.lastActive).full}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-500 font-medium">Ping Diagnostics:</span>
                    <div className="flex items-center gap-2">
                      {pingResults[selectedUser._id] ? (
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          {pingResults[selectedUser._id].roundTripTimeMs} ms • 0% loss
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Not pinged yet</span>
                      )}
                      <button
                        onClick={() => handlePing(selectedUser)}
                        disabled={pingingUser === selectedUser._id}
                        className="px-2.5 py-1 rounded-lg bg-[#4a6741] text-white hover:bg-[#3d5535] text-[10px] font-bold transition cursor-pointer"
                      >
                        {pingingUser === selectedUser._id ? "Testing..." : "Test Ping"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation link */}
                <div className="pt-2 flex items-center justify-between">
                  {selectedUser.userType !== "admin" ? (
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        navigate(`/dashboard/register-student?search=${encodeURIComponent(selectedUser.identifier)}`);
                      }}
                      className="text-xs font-bold text-[#4a6741] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View in Student Directory →
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        navigate("/dashboard/settings/staff");
                      }}
                      className="text-xs font-bold text-[#4a6741] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View in Staff Accounts →
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../../utils/api";

// Sub-components (MVC Parent-Child Hierarchy)
import TrackerSubNav from "./tracker/TrackerSubNav";
import UsersStatsCards from "./tracker/users/UsersStatsCards";
import UsersFilterBar from "./tracker/users/UsersFilterBar";
import UsersTelemetryTable from "./tracker/users/UsersTelemetryTable";
import UserInspectorModal from "./tracker/users/UserInspectorModal";

import FailedLoginsStatsCards from "./tracker/failed/FailedLoginsStatsCards";
import FailedLoginsFilterBar from "./tracker/failed/FailedLoginsFilterBar";
import FailedLoginsTable from "./tracker/failed/FailedLoginsTable";
import FailedInspectorModal from "./tracker/failed/FailedInspectorModal";
import FailedConfirmModals from "./tracker/failed/FailedConfirmModals";

export default function UsersIpTrackerTab() {
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
      <TrackerSubNav
        activeView={activeView}
        setActiveView={setActiveView}
        usersCount={data.sessions?.length || 0}
        failedCount={failedStats.total ?? 0}
        onOpenClearModal={() => setClearModalOpen(true)}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: REGISTERED USERS & TELEMETRY                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === "users" && (
        <>
          <UsersStatsCards stats={stats} totalSessions={(data.sessions || []).length} />

          <UsersFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            accountTypeFilter={accountTypeFilter}
            setAccountTypeFilter={setAccountTypeFilter}
            deviceFilter={deviceFilter}
            setDeviceFilter={setDeviceFilter}
            activityFilter={activityFilter}
            setActivityFilter={setActivityFilter}
            loading={loading}
            onRefresh={fetchUsers}
          />

          <UsersTelemetryTable
            loading={loading}
            filteredSessions={filteredSessions}
            paginatedSessions={paginatedSessions}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            onResetFilters={() => {
              setSearchQuery("");
              setAccountTypeFilter("all");
              setDeviceFilter("all");
              setActivityFilter("all");
            }}
            onSelectUser={setSelectedUser}
            onPing={handlePing}
            pingingUser={pingingUser}
            pingResults={pingResults}
            copiedIp={copiedIp}
            onCopyIp={copyIp}
          />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: FAILED LOGIN ATTEMPTS TRACKER                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === "failedLogins" && (
        <>
          <FailedLoginsStatsCards stats={failedStats} />

          <FailedLoginsFilterBar
            failedSearch={failedSearch}
            setFailedSearch={setFailedSearch}
            failedAccountType={failedAccountType}
            setFailedAccountType={setFailedAccountType}
            failedDevice={failedDevice}
            setFailedDevice={setFailedDevice}
            failedLoading={failedLoading}
            onRefresh={fetchFailedLogins}
          />

          <FailedLoginsTable
            failedLoading={failedLoading}
            failedData={failedData}
            failedSearch={failedSearch}
            failedAccountType={failedAccountType}
            failedDevice={failedDevice}
            failedPage={failedPage}
            setFailedPage={setFailedPage}
            failedPageSize={failedPageSize}
            setFailedPageSize={setFailedPageSize}
            onResetFilters={() => {
              setFailedSearch("");
              setFailedAccountType("all");
              setFailedDevice("all");
              setFailedPage(1);
            }}
            onSelectFailed={setSelectedFailed}
            onDeleteTarget={setDeleteTarget}
            copiedIp={copiedIp}
            onCopyIp={copyIp}
          />
        </>
      )}

      {/* ── Modals (Mounted via React Portals) ─────────────────────────── */}
      <UserInspectorModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        copiedIp={copiedIp}
        onCopyIp={copyIp}
      />

      <FailedInspectorModal
        attempt={selectedFailed}
        onClose={() => setSelectedFailed(null)}
        onOpenDelete={(attempt) => setDeleteTarget(attempt)}
        copiedIp={copiedIp}
        onCopyIp={copyIp}
      />

      <FailedConfirmModals
        deleteTarget={deleteTarget}
        onCloseDelete={() => setDeleteTarget(null)}
        onConfirmDelete={handleDeleteFailedEntry}
        deleting={deleting}
        clearModalOpen={clearModalOpen}
        onCloseClear={() => setClearModalOpen(false)}
        onConfirmClear={handleClearAllFailed}
        clearing={clearing}
        failedTotal={failedData.total}
      />
    </div>
  );
}

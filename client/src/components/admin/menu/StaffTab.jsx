import { useState, useEffect, useCallback } from "react";
import {
  IoAddOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoSaveOutline,
  IoSearchOutline,
  IoLocationOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { MdPeopleOutline } from "react-icons/md";
import api from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { SkeletonTable } from "../../SkeletonLoader";
import CustomFilterSelect from "./CustomFilterSelect";
import MenuModal from "./MenuModal";
import MenuInput from "./MenuInput";

const fmt = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

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
  if (!rawDate) return { relative: "Never", full: "No recorded activity", isRecent: false };
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

export default function StaffTab() {
  const { user, resetStaffPassword } = useAuth();
  const [staff, setStaff] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [copiedIp, setCopiedIp] = useState(null);

  const copyIp = (ip, e) => {
    e?.stopPropagation();
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [resetTarget, setResetTarget] = useState(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, pendingRes] = await Promise.all([
        api.get("/auth/staff"),
        user?.role === "admin" ? api.get("/auth/pending") : Promise.resolve({ data: [] }),
      ]);
      setStaff(staffRes.data);
      setPending(pendingRes.data);
    } catch { /* */ } finally { setLoading(false); }
  }, [user?.role]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      !search ||
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || !roleFilter || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openModal = () => {
    setForm({ fullName: "", email: "", role: "", password: "" });
    setErrors({}); setApiError(""); setSuccess(false); setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const openDelete = (s) => { setDeleteTarget(s); setDeleteError(""); };
  const closeDelete = () => { setDeleteTarget(null); setDeleteError(""); };

  const handleDelete = async () => {
    setDeleting(true); setDeleteError("");
    try {
      await api.delete(`/auth/staff/${deleteTarget._id}`);
      closeDelete();
      fetchStaff();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete account.");
    } finally { setDeleting(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: "approve" }));
    try {
      await api.put(`/auth/approve/${id}`);
      fetchStaff();
    } catch { /* */ } finally {
      setActionLoading((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  const handleDecline = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: "decline" }));
    try {
      await api.delete(`/auth/staff/${id}`);
      fetchStaff();
    } catch { /* */ } finally {
      setActionLoading((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResettingPassword(true);
    try {
      const result = await resetStaffPassword(resetTarget._id);
      if (result.success) {
        setResetMessage({ type: "success", text: result.message });
        setTimeout(() => {
          setResetTarget(null);
          setResetMessage(null);
        }, 3000);
      } else {
        setResetMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      setResetMessage({ type: "error", text: "Failed to reset password" });
    } finally {
      setResettingPassword(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.role) e.role = "Required";
    if (!form.password) e.password = "Required";
    else if (form.password.length < 6) e.password = "Min. 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.post("/auth/staff", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
      });
      setSuccess(true);
      fetchStaff();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to create account.");
    } finally { setSubmitting(false); }
  };

  const roleBadge = (role) =>
    role === "admin"
      ? "bg-[#d7ecc8] text-[#4a6741] border border-[#4a6741]/20"
      : "bg-gray-100 text-gray-600 border border-gray-200";

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* ── Pending Approvals ── */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold text-gray-800">Pending Approvals</h2>
            {pending.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-5">
                <SkeletonTable rows={4} columns={7} showHeader={false} />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex items-center gap-2 px-5 py-5 text-gray-400 text-sm">
                <IoCheckmarkCircle className="text-emerald-500 text-lg" />
                No pending approvals.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Applicant / Staff</th>
                      <th className="py-3.5 px-4">Requested Role</th>
                      <th className="py-3.5 px-4">Assigned IP Address</th>
                      <th className="py-3.5 px-4">Region</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Applied Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {pending.map((p) => (
                      <tr key={p._id} className="hover:bg-amber-50/30 transition group">
                        {/* Column 1: Applicant / Staff */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0 overflow-hidden">
                              {p.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block truncate group-hover:text-[#4a6741] transition">
                                {p.fullName}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono block truncate">
                                {p.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Requested Role */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-sky-50 text-sky-700 border-sky-200"
                              }`}
                          >
                            {p.role === "admin" ? "System Administrator" : "Campus Staff"}
                          </span>
                        </td>

                        {/* Column 3: Assigned IP Address */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {p.lastLoginIp ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-gray-800">
                                {p.lastLoginIp}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => copyIp(p.lastLoginIp, e)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition cursor-pointer"
                                title="Copy IP"
                              >
                                {copiedIp === p.lastLoginIp ? (
                                  <IoCheckmarkOutline className="text-emerald-600 text-sm" />
                                ) : (
                                  <IoCopyOutline className="text-xs" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic font-mono">No IP recorded</span>
                          )}
                        </td>

                        {/* Column 4: Region */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <IoLocationOutline className="text-red-500 text-sm flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-xs">Philippines</span>
                          </div>
                        </td>

                        {/* Column 5: Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                            Pending Approval
                          </span>
                        </td>

                        {/* Column 6: Applied Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs text-gray-400 font-mono">{fmt(p.createdAt)}</span>
                        </td>

                        {/* Column 7: Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(p._id)}
                              disabled={!!actionLoading[p._id]}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#4a6741] hover:bg-[#3a5333] text-white rounded-lg transition disabled:opacity-60 cursor-pointer shadow-xs"
                            >
                              {actionLoading[p._id] === "approve" ? (
                                <IoRefreshOutline className="animate-spin text-sm" />
                              ) : (
                                <IoCheckmarkCircle className="text-sm" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecline(p._id)}
                              disabled={!!actionLoading[p._id]}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-lg transition disabled:opacity-60 cursor-pointer"
                            >
                              {actionLoading[p._id] === "decline" ? (
                                <IoRefreshOutline className="animate-spin text-sm" />
                              ) : (
                                <IoAlertCircleOutline className="text-sm" />
                              )}
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active Staff ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">Staff & Admin Accounts</h2>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <IoAddOutline className="text-base" />
            Add Account
          </button>
        </div>

        {/* Search & Filters Controls Card Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px] relative">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name or email…"
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                title="Clear search"
              >
                <IoCloseOutline className="text-lg" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CustomFilterSelect
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { value: "all", label: "All Roles" },
                  { value: "admin", label: "Admin" },
                  { value: "staff", label: "Staff" },
                ]}
              />
            </div>

            <button
              onClick={fetchStaff}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0"
              title="Refresh"
            >
              <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5">
              <SkeletonTable rows={6} columns={7} showHeader={false} />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <MdPeopleOutline className="text-4xl text-gray-300" />
              <p className="text-sm font-medium">{search || roleFilter !== "all" ? "No matching accounts found." : "No staff accounts yet."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">User / Staff</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned IP Address</th>
                    <th className="py-3.5 px-4">Region</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredStaff.map((s) => {
                    const lastActive = s.lastActiveAt || s.lastLoginAt || s.updatedAt;
                    const timeInfo = formatTimeAgo(lastActive);

                    return (
                      <tr
                        key={s._id}
                        className="hover:bg-[#d7ecc8]/10 transition group"
                      >
                        {/* Column 1: User / Staff */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#d7ecc8]/40 border border-[#4a6741]/20 flex items-center justify-center text-[#4a6741] font-bold text-xs flex-shrink-0 overflow-hidden">
                              {s.profileImageUrl ? (
                                <img
                                  src={resolveImageUrl(s.profileImageUrl)}
                                  alt={s.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (s.fullName || "U")[0]?.toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block truncate group-hover:text-[#4a6741] transition">
                                {s.fullName}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono block truncate">
                                {s.username ? `@${s.username} • ` : ""}{s.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Role */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-sky-50 text-sky-700 border-sky-200"
                              }`}
                          >
                            {s.role === "admin" ? "System Administrator" : "Campus Staff"}
                          </span>
                        </td>

                        {/* Column 3: Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Approved
                          </span>
                        </td>

                        {/* Column 4: Assigned IP Address */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-gray-800">
                              {s.lastLoginIp || "—"}
                            </span>
                            {s.lastLoginIp && (
                              <button
                                type="button"
                                onClick={(e) => copyIp(s.lastLoginIp, e)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition cursor-pointer"
                                title="Copy IP"
                              >
                                {copiedIp === s.lastLoginIp ? (
                                  <IoCheckmarkOutline className="text-emerald-600 text-sm" />
                                ) : (
                                  <IoCopyOutline className="text-xs" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Column 5: Region */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <IoLocationOutline className="text-red-500 text-sm flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-xs">Philippines</span>
                          </div>
                        </td>

                        {/* Column 6: Last Activity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div
                            className="text-gray-500 font-mono text-[11px] flex items-center gap-1.5"
                            title={timeInfo.full}
                          >
                            {timeInfo.isRecent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            )}
                            <span>{timeInfo.relative}</span>
                          </div>
                        </td>

                        {/* Column 7: Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {s._id !== user?._id && (
                              <button
                                onClick={() => openDelete(s)}
                                title="Delete account"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <IoTrashOutline className="text-base" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {!loading && filteredStaff.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50/50">
              <div className="text-xs text-gray-500">
                Showing <strong className="text-gray-800">{filteredStaff.length}</strong> account{filteredStaff.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {modalOpen && (
        <MenuModal onClose={closeModal}>
          {/* Green header */}
          <div className="bg-[#4a6741] px-6 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Add New Account</h3>
            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition">
              <IoCloseOutline className="text-lg" />
            </button>
          </div>

          {success ? (
            <div className="p-8 flex flex-col items-center gap-3 text-center">
              <IoCheckmarkCircle className="text-[#4a6741] text-5xl" />
              <p className="font-bold text-gray-800">Account created!</p>
              <p className="text-sm text-gray-500">The new member can now sign in with their email and password.</p>
              <div className="flex gap-3 mt-2 w-full">
                <button onClick={() => { setSuccess(false); setForm({ fullName: "", email: "", role: "", password: "" }); }} className="flex-1 border border-[#4a6741] text-[#4a6741] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#4a6741]/5 transition">Add Another</button>
                <button onClick={closeModal} className="flex-1 bg-[#4a6741] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3a5333] transition">Done</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{apiError}</div>
              )}

              <MenuInput label="Full Name" required placeholder="John Doe" value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} error={errors.fullName} />
              <MenuInput label="Email Address" required type="email" placeholder="john@smartserve.com" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} error={errors.email} />

              {/* Role select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
                    ${errors.role ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
              </div>

              <MenuInput label="Password" required type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} error={errors.password} />

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm"
              >
                <IoSaveOutline className="text-base" />
                {submitting ? "Creating…" : "Create Account"}
              </button>
            </form>
          )}
        </MenuModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <MenuModal onClose={closeDelete}>
          <div className="bg-red-500 px-6 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Delete Account</h3>
            <button onClick={closeDelete} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition">
              <IoCloseOutline className="text-lg" />
            </button>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete the account for:
            </p>
            <p className="font-bold text-gray-900 mb-0.5">{deleteTarget.fullName}</p>
            <p className="text-sm text-gray-500 mb-5">{deleteTarget.email} &middot; <span className={`font-semibold ${deleteTarget.role === "admin" ? "text-[#4a6741]" : "text-gray-600"}`}>{deleteTarget.role}</span></p>
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
              This action is permanent and cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-500 mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={closeDelete}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:border-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </MenuModal>
      )}
    </div>
  );
}

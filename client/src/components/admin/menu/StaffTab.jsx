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
              <div className="p-4">
                <SkeletonTable rows={4} columns={5} showHeader={false} />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex items-center gap-2 px-5 py-5 text-gray-400 text-sm">
                <IoCheckmarkCircle className="text-green-500 text-lg" />
                No pending approvals.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {pending.map((p) => (
                  <li key={p._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                      {p.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{p.email}</p>
                      {p.lastLoginIp ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse flex-shrink-0" />
                            <span className="font-semibold text-emerald-700">{p.lastLoginIp}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">Philippines</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyIp(p.lastLoginIp, e)}
                            className="text-gray-400 hover:text-gray-600 transition"
                            title="Copy IP"
                          >
                            {copiedIp === p.lastLoginIp ? (
                              <IoCheckmarkOutline className="text-emerald-600 text-xs" />
                            ) : (
                              <IoCopyOutline className="text-xs" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No IP recorded</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${roleBadge(p.role)}`}>
                      {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Pending</span>
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0">{fmt(p.createdAt)}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(p._id)}
                        disabled={!!actionLoading[p._id]}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#4a6741] hover:bg-[#3a5333] text-white rounded-lg transition disabled:opacity-60"
                      >
                        {actionLoading[p._id] === "approve"
                          ? <IoRefreshOutline className="animate-spin text-sm" />
                          : <IoCheckmarkCircle className="text-sm" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(p._id)}
                        disabled={!!actionLoading[p._id]}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-lg transition disabled:opacity-60"
                      >
                        {actionLoading[p._id] === "decline"
                          ? <IoRefreshOutline className="animate-spin text-sm" />
                          : <IoAlertCircleOutline className="text-sm" />}
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
          <div className="grid grid-cols-[1.3fr_1.6fr_1.4fr_0.8fr_0.7fr_1fr_40px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
            <span>Name</span>
            <span>Email</span>
            <span>IP Address & Region</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last Active</span>
            <span></span>
          </div>

          {loading ? (
            <div className="p-4">
              <SkeletonTable rows={5} columns={7} showHeader={false} />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <MdPeopleOutline className="text-4xl text-gray-300" />
              <p className="text-sm">{search || roleFilter !== "all" ? "No matching accounts found." : "No staff accounts yet."}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filteredStaff.map((s) => (
                <li key={s._id} className="grid grid-cols-[1.3fr_1.6fr_1.4fr_0.8fr_0.7fr_1fr_40px] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                  <span className="text-sm font-medium text-gray-800 truncate">{s.fullName}</span>
                  <span className="text-xs text-gray-500 truncate">{s.email}</span>
                  <div className="flex flex-col min-w-0 pr-2">
                    {s.lastLoginIp ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                            {s.lastLoginIp}
                          </code>
                          <button
                            type="button"
                            onClick={(e) => copyIp(s.lastLoginIp, e)}
                            className="p-1 hover:bg-gray-200/60 rounded text-gray-400 hover:text-gray-700 transition"
                            title="Copy IP"
                          >
                            {copiedIp === s.lastLoginIp ? (
                              <IoCheckmarkOutline className="text-emerald-600 text-xs" />
                            ) : (
                              <IoCopyOutline className="text-xs" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <span className="px-1 rounded bg-blue-50 text-blue-700 font-semibold font-mono border border-blue-200 text-[9px]">
                            VLAN 10
                          </span>
                          <span className="flex items-center gap-0.5 text-gray-500">
                            <IoLocationOutline className="text-emerald-600 text-xs flex-shrink-0" />
                            Philippines
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic font-mono">No IP recorded</span>
                    )}
                  </div>
                  <span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${roleBadge(s.role)}`}>
                      {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                    </span>
                  </span>
                  <span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#d7ecc8] text-[#4a6741]">
                      Approved
                    </span>
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{fmt(s.lastActiveAt || s.lastLoginAt || s.updatedAt)}</span>
                  <span className="flex justify-end">
                    {s._id !== user?._id && (
                      <button
                        onClick={() => openDelete(s)}
                        title="Delete account"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <IoTrashOutline className="text-base" />
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          {!loading && filteredStaff.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-700">{filteredStaff.length}</span> account{filteredStaff.length !== 1 ? "s" : ""}
              </p>
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

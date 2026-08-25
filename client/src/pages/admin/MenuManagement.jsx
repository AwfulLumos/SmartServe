import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoAddOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoRestaurantOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoSaveOutline,
  IoSearchOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFunnelOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoChevronDownOutline,
  IoCheckmarkOutline,
  IoDownloadOutline,
  IoCloudUploadOutline,
  IoImageOutline,
} from "react-icons/io5";
import { MdPeopleOutline, MdMenuBook, MdHistoryEdu } from "react-icons/md";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { SkeletonTable } from "../../components/SkeletonLoader";

// Custom Filter Select component matching RegisterStudent.jsx, Orders.jsx, and portal design standard
function CustomFilterSelect({ value, onChange, options, icon: Icon, placeholder = "Select...", className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`bg-gray-50 hover:bg-white border text-gray-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm transition outline-none ${value && value !== "all" && value !== "" ? "border-[#4a6741] text-[#4a6741] bg-[#d7ecc8]/25" : "border-gray-200"
          }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="text-gray-400 text-sm flex-shrink-0" />}
          <span>{selectedOpt?.label || placeholder}</span>
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${isSelected
                  ? "bg-[#e8f5e2] text-[#4a6741] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <IoCheckmarkOutline className="text-sm text-[#4a6741]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "staff", label: "User Accounts", icon: <MdPeopleOutline className="text-base" /> },
  { key: "menu", label: "Menu Management", icon: <MdMenuBook className="text-base" /> },
  { key: "audit", label: "Audit Log", icon: <MdHistoryEdu className="text-base" /> },
];

const MENU_CATEGORIES = ["Morning", "Lunch", "Snacks", "Beverages", "Others"];

const fmt = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Input component
const Input = ({ label, required, error, type = "text", ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (showPwd ? "text" : "password") : type}
          {...props}
          className={`w-full px-4 ${isPassword ? "pr-10" : ""} py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
            ${error ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showPwd ? <IoEyeOffOutline className="text-base" /> : <IoEyeOutline className="text-base" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ─── Centered Modal wrapper ───────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}

// ─── Tab: Staff Accounts ──────────────────────────────────────────────────────
function StaffTab() {
  const { user, resetStaffPassword } = useAuth();
  const [staff, setStaff] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
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
          <div className="grid grid-cols-[1.5fr_2fr_0.8fr_0.7fr_1fr_40px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last Active</span>
            <span></span>
          </div>

          {loading ? (
            <div className="p-4">
              <SkeletonTable rows={5} columns={6} showHeader={false} />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <MdPeopleOutline className="text-4xl text-gray-300" />
              <p className="text-sm">{search || roleFilter !== "all" ? "No matching accounts found." : "No staff accounts yet."}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filteredStaff.map((s) => (
                <li key={s._id} className="grid grid-cols-[1.5fr_2fr_0.8fr_0.7fr_1fr_40px] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                  <span className="text-sm font-medium text-gray-800 truncate">{s.fullName}</span>
                  <span className="text-xs text-gray-500 truncate">{s.email}</span>
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
                  <span className="text-xs text-gray-400 font-mono">{fmt(s.updatedAt)}</span>
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
        <Modal onClose={closeModal}>
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

              <Input label="Full Name" required placeholder="John Doe" value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} error={errors.fullName} />
              <Input label="Email Address" required type="email" placeholder="john@smartserve.com" value={form.email}
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

              <Input label="Password" required type="password" placeholder="••••••••" value={form.password}
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
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal onClose={closeDelete}>
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
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Menu Management ─────────────────────────────────────────────────────
const emptyMenuForm = { name: "", category: "", price: "", image: "" };

function MenuTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyMenuForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewImageItem, setViewImageItem] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/menu");
      setItems(data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || !categoryFilter || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      !statusFilter ||
      (statusFilter === "active" ? item.isActive : !item.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file size should be 3MB or less");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setForm((p) => ({ ...p, image: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setEditTarget(null); setForm(emptyMenuForm); setErrors({}); setApiError(""); setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditTarget(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), image: item.image || "" });
    setErrors({}); setApiError(""); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category) e.category = "Required";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Valid price required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault(); setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), category: form.category, price: Number(form.price), image: form.image };
      if (editTarget) await api.put(`/menu/${editTarget._id}`, payload);
      else await api.post("/menu", payload);
      closeModal(); fetchItems();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save.");
    } finally { setSubmitting(false); }
  };

  const toggle = async (item) => {
    try { await api.patch(`/menu/${item._id}/toggle`); fetchItems(); } catch { /* */ }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/menu/${deleteTarget._id}`); setDeleteTarget(null); fetchItems(); }
    catch { setDeleteTarget(null); } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <IoAddOutline className="text-base" />
          Add Menu Item
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
            placeholder="Search menu item by name or category…"
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
          <div className="flex items-center gap-2 flex-wrap">
            <CustomFilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: "All Categories" },
                ...MENU_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
            <CustomFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          <button
            onClick={fetchItems}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1.2fr_0.8fr_0.7fr_80px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={5} showHeader={false} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoRestaurantOutline className="text-4xl text-gray-300" />
            <p className="text-sm">{search || categoryFilter !== "all" || statusFilter !== "all" ? "No matching menu items found." : "No menu items yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filteredItems.map((item) => (
              <li key={item._id} className="grid grid-cols-[2.5fr_1.2fr_0.8fr_0.7fr_80px] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    onClick={() => setViewImageItem(item)}
                    className="relative group cursor-pointer flex-shrink-0"
                    title="Click to view full picture"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-xl border border-gray-100 shadow-xs transition transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 transition transform group-hover:scale-105">
                        <IoRestaurantOutline className="text-lg" />
                      </div>
                    )}
                    {item.image && (
                      <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                        <IoSearchOutline />
                      </div>
                    )}
                  </div>
                  <span
                    onClick={() => setViewImageItem(item)}
                    className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-[#4a6741] transition"
                  >
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 truncate">{item.category}</span>
                <span className="text-sm font-bold text-gray-800">₱{Number(item.price).toLocaleString()}</span>
                <button onClick={() => toggle(item)} className="flex items-center justify-start w-fit hover:opacity-80 transition" title="Click to toggle status">
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${item.isActive ? "bg-[#d7ecc8] text-[#4a6741]" : "bg-gray-100 text-gray-500"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-[#4a6741] transition p-1" title="Edit">
                    <IoCreateOutline className="text-lg" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="text-gray-400 hover:text-red-500 transition p-1" title="Delete">
                    <IoTrashOutline className="text-lg" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {!loading && filteredItems.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-700">{filteredItems.length}</span> menu item{filteredItems.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Admin Image Lightbox Modal */}
      {viewImageItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewImageItem(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewImageItem(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition shadow-md"
              title="Close image view"
            >
              <IoCloseOutline className="text-xl" />
            </button>

            <div className="w-full h-72 sm:h-80 bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {viewImageItem.image ? (
                <img
                  src={viewImageItem.image}
                  alt={viewImageItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                  <IoRestaurantOutline className="text-6xl text-[#4a6741]" />
                  <span className="text-xs font-semibold">No image uploaded</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 truncate">{viewImageItem.name}</h3>
                <span className="text-lg font-extrabold text-[#4a6741]">₱{Number(viewImageItem.price).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-[#d7ecc8] text-[#4a6741] px-3 py-1 rounded-full">
                  {viewImageItem.category}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${viewImageItem.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {viewImageItem.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal onClose={closeModal}>
          <div className="bg-[#4a6741] px-6 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">{editTarget ? "Edit Menu Item" : "Add New Menu Item"}</h3>
            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition">
              <IoCloseOutline className="text-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{apiError}</div>
            )}

            {/* Menu Image Upload section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Item Photo <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              {form.image ? (
                <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, image: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
                    title="Remove photo"
                  >
                    <IoTrashOutline className="text-sm" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 hover:border-[#4a6741] rounded-xl cursor-pointer bg-gray-50 hover:bg-[#e8f5e2]/20 transition p-4 text-center">
                  <IoCloudUploadOutline className="text-3xl text-gray-400 mb-1" />
                  <span className="text-xs font-semibold text-gray-600">Click to upload menu image</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 3MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            <Input label="Item Name" required placeholder="e.g., Chicken Sandwich" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} error={errors.name} />

            {/* Category select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
                  ${errors.category ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
              >
                <option value="">Select category</option>
                {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            <Input label="Price (₱)" required type="number" min="0" step="0.01" placeholder="0" value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} error={errors.price} />

            {/* Tip banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              <span className="font-bold">Tip:</span> This item will be immediately available for students to purchase.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm"
            >
              <IoSaveOutline className="text-base" />
              {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Menu Item"}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <IoAlertCircleOutline className="text-red-500 text-2xl" />
            </div>
            <p className="font-bold text-gray-800">Delete Menu Item?</p>
            <p className="text-sm text-gray-500">
              "<span className="font-semibold text-gray-700">{deleteTarget.name}</span>" will be permanently removed.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition hover:border-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}



// ─── Audit Log Tab ─────────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  all: "All Categories",
  auth: "Auth",
  student: "Students",
  inventory: "Inventory",
  menu: "Menu",
  order: "Orders",
  reward: "Rewards",
  byoc: "BYOC",
  config: "Config",
  system: "System",
};

const ACTOR_LABELS = {
  all: "All Actors",
  admin: "Admin",
  staff: "Staff",
  student: "Student",
  system: "System",
};

const CATEGORY_COLORS = {
  auth: "bg-blue-100 text-blue-700",
  student: "bg-purple-100 text-purple-700",
  inventory: "bg-orange-100 text-orange-700",
  menu: "bg-yellow-100 text-yellow-800",
  order: "bg-cyan-100 text-cyan-700",
  reward: "bg-pink-100 text-pink-700",
  byoc: "bg-green-100 text-green-700",
  config: "bg-gray-100 text-gray-700",
  system: "bg-gray-100 text-gray-500",
};

const ACTOR_COLORS = {
  admin: "bg-[#4a6741]/10 text-[#4a6741]",
  staff: "bg-indigo-100 text-indigo-700",
  student: "bg-amber-100 text-amber-700",
  system: "bg-gray-100 text-gray-500",
};

function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [actorType, setActorType] = useState("all");
  const [page, setPage] = useState(1);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const LIMIT = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(actorType !== "all" && { actorType }),
      });
      const res = await api.get(`/audit-logs?${params}`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setLogs([]);
    }
    setLoading(false);
  }, [search, category, actorType, page]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Pass all=true to fetch ALL records matching current filters
      const params = new URLSearchParams({
        all: "true",
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(actorType !== "all" && { actorType }),
      });
      const res = await api.get(`/audit-logs?${params}`);
      const exportLogs = res.data?.logs && res.data.logs.length > 0 ? res.data.logs : logs;

      if (!exportLogs || exportLogs.length === 0) {
        toast.error("No audit logs available to export.");
        setExporting(false);
        return;
      }

      const headers = ["Timestamp", "Action", "Category", "Actor Type", "Actor Name", "Description"];
      const rows = exportLogs.map((log) => [
        `"${new Date(log.createdAt).toLocaleString("en-US")}"`,
        `"${(log.action || "").replace(/"/g, '""')}"`,
        `"${(CATEGORY_LABELS[log.category] || log.category || "").replace(/"/g, '""')}"`,
        `"${(log.actorType || "").replace(/"/g, '""')}"`,
        `"${(log.actorName || "").replace(/"/g, '""')}"`,
        `"${(log.description || "").replace(/"/g, '""')}"`,
      ]);

      const csvString = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `smartserve_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported all ${exportLogs.length} audit log entries to CSV`);
    } catch {
      toast.error("Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/audit-logs/${deleteTarget._id}`);
      toast.success("Audit log entry deleted");
      setDeleteTarget(null);
      fetchLogs();
    } catch {
      toast.error("Failed to delete audit log entry");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const params = new URLSearchParams({
        ...(category !== "all" && { category }),
        ...(actorType !== "all" && { actorType }),
      });
      const res = await api.delete(`/audit-logs/clear-all?${params}`);
      toast.success(res.data?.message || "Audit logs cleared");
      setClearModalOpen(false);
      fetchLogs();
    } catch {
      toast.error("Failed to clear audit logs");
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, category, actorType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#4a6741]">Admin Audit Log</h2>
          <p className="text-xs text-gray-400 mt-0.5">{total} total entries</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={exporting || total === 0}
            className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] active:scale-[0.98] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Export all filtered audit logs as CSV"
          >
            <IoDownloadOutline className="text-base" />
            <span>{exporting ? "Exporting..." : "Export CSV"}</span>
          </button>

          <button
            onClick={() => setClearModalOpen(true)}
            disabled={total === 0}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Clear audit log entries to optimize database storage"
          >
            <IoTrashOutline className="text-base" />
            <span>Clear Logs</span>
          </button>
        </div>
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
            placeholder="Search action, actor, or description…"
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
          <div className="flex items-center gap-2 flex-wrap">
            <CustomFilterSelect
              value={category}
              onChange={setCategory}
              options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
            <CustomFilterSelect
              value={actorType}
              onChange={setActorType}
              options={Object.entries(ACTOR_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
          </div>

          <button
            onClick={fetchLogs}
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
          <div className="p-4">
            <SkeletonTable rows={6} columns={6} showHeader={false} />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <MdHistoryEdu className="text-4xl text-gray-300" />
            <p className="text-sm">No audit log entries found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Timestamp</th>
                <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Action</th>
                <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Category</th>
                <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Actor</th>
                <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Description</th>
                <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap font-mono">
                    {fmt(log.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap text-sm">{log.action}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[log.category] || "bg-gray-100 text-gray-600"
                      }`}>
                      {CATEGORY_LABELS[log.category] || log.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${ACTOR_COLORS[log.actorType] || "bg-gray-100 text-gray-600"
                        }`}>
                        {log.actorType}
                      </span>
                      <span className="text-gray-700 text-xs font-medium">{log.actorName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs max-w-xs truncate">{log.description}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setDeleteTarget(log)}
                      title="Delete log entry"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    >
                      <IoTrashOutline className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            Page {page} of {pages} &middot; {total} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4a6741]/40 transition"
            >
              <IoChevronBackOutline />
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page - 3 + i;
              if (p < 1 || p > pages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition border ${p === page
                    ? "bg-[#4a6741] text-white border-[#4a6741]"
                    : "border-gray-200 text-gray-600 hover:border-[#4a6741]/40"
                    }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-[#4a6741]/40 transition"
            >
              <IoChevronForwardOutline />
            </button>
          </div>
        </div>
      )}

      {/* Delete Single Log Modal */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="bg-red-500 px-6 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Delete Audit Log Entry</h3>
            <button onClick={() => setDeleteTarget(null)} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition">
              <IoCloseOutline className="text-lg" />
            </button>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete this log entry?
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-5 space-y-1 text-xs">
              <p><span className="font-semibold text-gray-700">Action:</span> {deleteTarget.action}</p>
              <p><span className="font-semibold text-gray-700">Actor:</span> {deleteTarget.actorName} ({deleteTarget.actorType})</p>
              <p><span className="font-semibold text-gray-700">Description:</span> {deleteTarget.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteSingle}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer"
              >
                {deleting ? "Deleting…" : "Yes, Delete Entry"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:border-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Clear Logs Modal */}
      {clearModalOpen && (
        <Modal onClose={() => setClearModalOpen(false)}>
          <div className="bg-red-500 px-6 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Clear Audit Log History</h3>
            <button onClick={() => setClearModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition">
              <IoCloseOutline className="text-lg" />
            </button>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm text-gray-600 mb-3">
              {category !== "all" || actorType !== "all"
                ? "You are about to delete all audit logs matching current filter settings."
                : "You are about to delete ALL audit log history to optimize database performance."}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 text-xs text-red-700 font-medium">
              ⚠️ Warning: This will permanently delete audit log records. Make sure you have exported a CSV copy if needed.
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClearLogs}
                disabled={clearing}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer"
              >
                {clearing ? "Clearing Logs…" : "Confirm Clear Logs"}
              </button>
              <button
                onClick={() => setClearModalOpen(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:border-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const TAB_META = {
  staff: {
    label: "User Accounts",
    title: "Staff Accounts",
    icon: <MdPeopleOutline className="text-3xl" />,
    description: "Manage canteen staff and administrator accounts, roles, and pending approvals",
    breadcrumb: "Staff Accounts",
  },
  menu: {
    label: "Menu Management",
    title: "Menu Management",
    icon: <MdMenuBook className="text-3xl" />,
    description: "Configure food menu items, prices, category classifications, and item availability",
    breadcrumb: "Menu Management",
  },
  audit: {
    label: "Audit Log",
    title: "Audit Log",
    icon: <MdHistoryEdu className="text-3xl" />,
    description: "Track administrative actions, system events, and security logs in real time",
    breadcrumb: "Audit Log",
  },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MenuManagement() {
  const { section } = useParams();
  const activeTab = section || "staff";

  if (!TAB_META[activeTab]) {
    return <Navigate to="/dashboard/settings/staff" replace />;
  }

  const currentTab = TAB_META[activeTab];

  return (
    <AdminLayout breadcrumb={currentTab.breadcrumb}>
      {/* Header: Displays dynamic page title, icon, and description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
            {currentTab.icon}
            {currentTab.title}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {currentTab.description}
          </p>
        </div>
      </div>

      {activeTab === "staff" && <StaffTab />}
      {activeTab === "menu" && <MenuTab />}
      {activeTab === "audit" && <AuditLogTab />}
    </AdminLayout>
  );
}

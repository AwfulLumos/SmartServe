import { useState, useEffect, useCallback } from "react";
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
} from "react-icons/io5";
import { MdPeopleOutline, MdMenuBook, MdNotificationsNone, MdHistoryEdu } from "react-icons/md";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// ─── Shared ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "staff",   label: "Staff Accounts",   icon: <MdPeopleOutline className="text-base" /> },
  { key: "menu",    label: "Menu Management",   icon: <MdMenuBook className="text-base" /> },
  { key: "alerts",  label: "Alert Settings",    icon: <MdNotificationsNone className="text-base" /> },
  { key: "audit",   label: "Audit Log",         icon: <MdHistoryEdu className="text-base" /> },
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
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/staff");
      setStaff(data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

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
    <div>
      {/* Sub-header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Staff Accounts</h2>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <IoAddOutline className="text-base" />
          Add Account
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_2fr_0.8fr_0.7fr_1fr_auto] items-center px-5 py-3 bg-[#e8f5e2] text-sm font-semibold text-[#4a6741]">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last Active</span>
          <span></span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-gray-400 text-sm gap-2">
            <IoRefreshOutline className="animate-spin text-lg" /> Loading…
          </div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
            <MdPeopleOutline className="text-4xl" />
            <p className="text-sm">No staff accounts yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {staff.map((s) => (
              <li key={s._id} className="grid grid-cols-[1.5fr_2fr_0.8fr_0.7fr_1fr_auto] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-semibold text-gray-800">{s.fullName}</span>
                <span className="text-sm text-gray-500 truncate">{s.email}</span>
                <span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge(s.role)}`}>
                    {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                  </span>
                </span>
                <span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                    active
                  </span>
                </span>
                <span className="text-xs text-gray-500">{fmt(s.updatedAt)}</span>
                <span>
                  {s._id !== user?._id && (
                    <button
                      onClick={() => openDelete(s)}
                      title="Delete account"
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <IoTrashOutline className="text-base" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
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
const emptyMenuForm = { name: "", category: "", price: "" };

function MenuTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyMenuForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/menu");
      setItems(data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setEditTarget(null); setForm(emptyMenuForm); setErrors({}); setApiError(""); setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditTarget(item);
    setForm({ name: item.name, category: item.category, price: String(item.price) });
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
      const payload = { name: form.name.trim(), category: form.category, price: Number(form.price) };
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_1.2fr_0.8fr_0.7fr_80px] items-center px-5 py-3 bg-[#e8f5e2] text-sm font-semibold text-[#4a6741]">
          <span>Name</span>
          <span>Availability</span>
          <span>Price</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12 text-gray-400 text-sm gap-2">
            <IoRefreshOutline className="animate-spin text-lg" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
            <IoRestaurantOutline className="text-4xl" />
            <p className="text-sm">No menu items yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <li key={item._id} className="grid grid-cols-[2fr_1.2fr_0.8fr_0.7fr_80px] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                <span className="text-sm text-gray-500">{item.category}</span>
                <span className="text-sm font-semibold text-gray-800">₱{Number(item.price).toLocaleString()}</span>
                <button onClick={() => toggle(item)}>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.isActive ? "active" : "inactive"}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-[#4a6741] transition p-1">
                    <IoCreateOutline className="text-lg" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="text-gray-400 hover:text-red-500 transition p-1">
                    <IoTrashOutline className="text-lg" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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

// ─── Placeholder tabs ─────────────────────────────────────────────────────────
function PlaceholderTab({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-3">
      <MdNotificationsNone className="text-5xl" />
      <p className="text-sm text-gray-400">{label} coming soon.</p>
    </div>
  );
}

// ─── Audit Log Tab ─────────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  all:       "All Categories",
  auth:      "Auth",
  student:   "Students",
  inventory: "Inventory",
  menu:      "Menu",
  order:     "Orders",
  reward:    "Rewards",
  byoc:      "BYOC",
  config:    "Config",
  system:    "System",
};

const ACTOR_LABELS = {
  all:     "All Actors",
  admin:   "Admin",
  staff:   "Staff",
  student: "Student",
  system:  "System",
};

const CATEGORY_COLORS = {
  auth:      "bg-blue-100 text-blue-700",
  student:   "bg-purple-100 text-purple-700",
  inventory: "bg-orange-100 text-orange-700",
  menu:      "bg-yellow-100 text-yellow-800",
  order:     "bg-cyan-100 text-cyan-700",
  reward:    "bg-pink-100 text-pink-700",
  byoc:      "bg-green-100 text-green-700",
  config:    "bg-gray-100 text-gray-700",
  system:    "bg-gray-100 text-gray-500",
};

const ACTOR_COLORS = {
  admin:   "bg-[#4a6741]/10 text-[#4a6741]",
  staff:   "bg-indigo-100 text-indigo-700",
  student: "bg-amber-100 text-amber-700",
  system:  "bg-gray-100 text-gray-500",
};

function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [actorType, setActorType] = useState("all");
  const [page, setPage] = useState(1);

  const LIMIT = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(search    && { search }),
        ...(category  !== "all" && { category }),
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

  useEffect(() => {
    setPage(1);
  }, [search, category, actorType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#4a6741]">Admin Audit Log</h2>
          <p className="text-xs text-gray-400 mt-0.5">{total} total entries</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-[#4a6741]/40 hover:text-[#4a6741] transition"
        >
          <IoRefreshOutline className="text-base" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
          <IoSearchOutline className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, description…"
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500">
              <IoCloseOutline />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <IoFunnelOutline className="text-gray-400 text-sm" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={actorType}
            onChange={(e) => setActorType(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
          >
            {Object.entries(ACTOR_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No audit log entries found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Timestamp</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Action</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actor</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap font-mono">
                    {fmt(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      CATEGORY_COLORS[log.category] || "bg-gray-100 text-gray-600"
                    }`}>
                      {CATEGORY_LABELS[log.category] || log.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        ACTOR_COLORS[log.actorType] || "bg-gray-100 text-gray-600"
                      }`}>
                        {log.actorType}
                      </span>
                      <span className="text-gray-700 text-xs">{log.actorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{log.description}</td>
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
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition border ${
                    p === page
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
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState("staff");

  return (
    <AdminLayout breadcrumb="Settings">
      <h1 className="text-2xl font-bold text-[#4a6741] mb-5">Settings</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200 -mx-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition
              ${activeTab === t.key
                ? "bg-[#4a6741] text-white border-[#4a6741]"
                : "bg-white text-gray-500 border-transparent hover:text-[#4a6741] hover:border-[#4a6741]/30"
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "staff" && <StaffTab />}
      {activeTab === "menu"  && <MenuTab />}
      {activeTab === "alerts" && <PlaceholderTab label="Alert Settings" />}
      {activeTab === "audit"  && <AuditLogTab />}
    </AdminLayout>
  );
}

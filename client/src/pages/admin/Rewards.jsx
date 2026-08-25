// ─────────────────────────────
// Imports
// Purpose: Bring in necessary tools and components from libraries and other files.
// React hooks are special functions that help manage component behavior.
// ─────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IoGiftOutline,
  IoStarOutline,
  IoLeafOutline,
  IoAddOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoCameraOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoSettingsOutline,
  IoSaveOutline,
  IoCheckmarkOutline,
  IoCloudUploadOutline,
  IoChevronDownOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { SkeletonTable, SkeletonCardGrid } from "../../components/SkeletonLoader";

// ─────────────────────────────
// Shared Helpers
// Purpose: Define constants and helper functions used across multiple components in this file.
// These are like reusable pieces of code that make the app consistent.
// ─────────────────────────────

// ICON_MAP: A dictionary that maps icon names to React icon components.
// Used to display different icons for rewards based on their type.
// Example: ICON_MAP['gift'] returns the IoGiftOutline icon component.
const ICON_MAP = {
  gift: <IoGiftOutline />,
  star: <IoStarOutline />,
  leaf: <IoLeafOutline />,
};

// TYPE_LABEL: A dictionary that maps reward types to human-readable labels.
// Used to show user-friendly names for different reward categories.
// Example: TYPE_LABEL['free_item'] returns "Free Item".
const TYPE_LABEL = {
  free_item: "Free Item",
  discount: "Discount",
  eco_badge: "Eco Badge",
};

// TYPE_BADGE: A dictionary that maps reward types to Tailwind CSS classes for styling badges.
// Used to apply consistent colors and styles to reward type badges.
// Example: TYPE_BADGE['free_item'] returns "bg-[#d7ecc8] text-[#4a6741]".
const TYPE_BADGE = {
  free_item: "bg-[#d7ecc8] text-[#4a6741]",
  discount: "bg-yellow-100 text-yellow-700",
  eco_badge: "bg-teal-100 text-teal-700",
};

// fmt: A helper function to format dates into a readable string.
// Used to display timestamps in a user-friendly format.
// Example: fmt(new Date()) might return "2023-05-10 14:30".
const fmt = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Custom Filter Select component matching RegisterStudent.jsx, Orders.jsx, and MenuManagement.jsx
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
                {isSelected && <IoCheckmarkOutline className="text-[#4a6741] text-sm flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// TABS: An array of objects defining the tabs in the rewards page.
// Used to render the tab navigation and switch between different sections.
// Each tab has a key (for identification), label (display text), and icon (React component).
const TABS = [
  { key: "redeem", label: "Redeem Rewards", icon: <IoGiftOutline /> },
  { key: "configure", label: "Configure Rewards", icon: <IoStarOutline /> },
  { key: "history", label: "Redemption History", icon: <IoCalendarOutline /> },
  { key: "byoc", label: "BYOC Records", icon: <IoLeafOutline /> },
];

// ─── Points Config Section ────────────────────────────────────────────────────

// CONFIG_FIELDS: An array of objects defining the configuration fields for points.
// Used to dynamically render input fields for points configuration.
// Each field has a key (for state), label (display text), hint (helper text), step (input step), and min (minimum value).
const CONFIG_FIELDS = [
  {
    key: "pointsPerPeso",
    label: "Points Per Peso Spent",
    hint: (v) => `Current: ${v} points per ₱1`,
    step: "0.01",
    min: "0",
  },
  {
    key: "ecoPointsPerByoc",
    label: "Eco Points Per BYOC",
    hint: () => "Eco points awarded when students bring their own containers",
    step: "1",
    min: "0",
  },
  {
    key: "minRedemptionPoints",
    label: "Minimum Redemption Points",
    hint: (v) => `Students need at least ${v} points to redeem a reward`,
    step: "1",
    min: "0",
  },
];

// PointsConfigSection: A React component for configuring points settings.
// Purpose: Allows admins to set how points are earned and redeemed.
// Used in the Configure tab to manage global points configuration.
// Runs when the Configure tab is active.
function PointsConfigSection() {
  // useState: A React hook to store and update component state.
  // form: Stores the current values of the configuration fields.
  // Used to track user input before saving.
  const [form, setForm] = useState({ pointsPerPeso: "0.1", ecoPointsPerByoc: "5", minRedemptionPoints: "30" });

  // loading: Tracks if the component is loading data from the server.
  // Used to show a loading spinner while fetching initial data.
  const [loading, setLoading] = useState(true);

  // saving: Tracks if the component is saving data to the server.
  // Used to disable the save button and show saving text during save.
  const [saving, setSaving] = useState(false);

  // saved: Tracks if the save was successful.
  // Used to show a "Saved!" message temporarily after saving.
  const [saved, setSaved] = useState(false);

  // error: Stores any error message from saving.
  // Used to display error alerts to the user.
  const [error, setError] = useState("");

  // useEffect: A React hook that runs side effects after rendering.
  // Purpose: Fetch initial points configuration from the server when the component mounts.
  // Runs once when the component first loads.
  useEffect(() => {
    api.get("/points-config")
      .then((res) => {
        const d = res.data;
        setForm({
          pointsPerPeso: String(d.pointsPerPeso),
          ecoPointsPerByoc: String(d.ecoPointsPerByoc),
          minRedemptionPoints: String(d.minRedemptionPoints),
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // handleChange: A function to update the form state when user types in inputs.
  // Purpose: Keeps the form state in sync with user input.
  // Runs when the user changes any input field.
  const handleChange = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
    setError("");
  };

  // handleSave: An async function to save the configuration to the server.
  // Purpose: Sends the updated configuration to the backend and updates the UI.
  // Runs when the user clicks the Save button.
  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      const payload = {
        pointsPerPeso: Number(form.pointsPerPeso),
        ecoPointsPerByoc: Number(form.ecoPointsPerByoc),
        minRedemptionPoints: Number(form.minRedemptionPoints),
      };
      const res = await api.put("/points-config", payload);
      const d = res.data;
      setForm({
        pointsPerPeso: String(d.pointsPerPeso),
        ecoPointsPerByoc: String(d.ecoPointsPerByoc),
        minRedemptionPoints: String(d.minRedemptionPoints),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  // return: The JSX that defines what the component renders on the screen.
  // Purpose: Displays the points configuration form with inputs, buttons, and messages.
  // Runs every time the component re-renders (when state changes).
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-[#4a6741]">Points Configuration</h3>
          <p className="text-sm text-gray-400 mt-0.5">Control how students earn points across the platform</p>
        </div>
        <IoSettingsOutline className="text-2xl text-gray-300" />
      </div>

      {/* Conditional rendering: Shows loading spinner if data is being fetched. */}
      {/* Checks if loading is true, and if so, displays the loading message. */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <IoRefreshOutline className="animate-spin" /> Loading configuration…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Map over CONFIG_FIELDS to render input fields dynamically. */}
          {/* For each field, create a label, input, and hint. */}
          {CONFIG_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
              <input
                type="number"
                step={f.step}
                min={f.min}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white"
              />
              <p className="text-xs text-gray-400 mt-1.5">{f.hint(form[f.key])}</p>
            </div>
          ))}
        </div>
      )}

      {/* Conditional rendering: Shows error message if there's an error. */}
      {/* Checks if error is not empty, and if so, displays the error alert. */}
      {error && (
        <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <IoAlertCircleOutline className="text-base flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Conditional rendering: Shows the save section only if not loading. */}
      {!loading && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Changes apply to all new orders and BYOC logs immediately.</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-60
              ${saved
                ? "bg-[#d7ecc8] text-[#4a6741] border border-[#b5d99c]"
                : "bg-[#4a6741] hover:bg-[#3a5333] text-white"
              }`}
          >
            {saved ? <IoCheckmarkOutline className="text-base" /> : <IoSaveOutline className="text-base" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Configuration"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Configure ───────────────────────────────────────────────────────────

// emptyRewardForm: An object with default empty values for a new reward form.
// Used to reset the form when adding a new reward or clearing it.
// Example: Used in openAdd to initialize the form state.
const emptyRewardForm = { name: "", description: "", type: "free_item", pointsCost: "", icon: "gift" };

// ConfigureTab: A React component for the Configure Rewards tab.
// Purpose: Allows admins to view, add, edit, and manage rewards.
// Used in the main Rewards component when the "configure" tab is active.
// Runs when the user switches to the Configure tab.
function ConfigureTab() {
  const [rewards, setRewards] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // modalOpen: Tracks if the add/edit modal is open.
  // Used to show or hide the modal overlay.
  const [modalOpen, setModalOpen] = useState(false);

  // editTarget: Stores the reward being edited, or null for adding new.
  // Used to determine if we're adding or editing.
  const [editTarget, setEditTarget] = useState(null);

  // form: Stores the current form values for the reward being added/edited.
  // Used to track user input in the modal.
  const [form, setForm] = useState(emptyRewardForm);

  // formErrors: Stores validation errors for the form.
  // Used to display error messages under inputs.
  const [formErrors, setFormErrors] = useState({});

  // submitting: Tracks if the form is being submitted.
  // Used to disable the submit button and show loading text.
  const [submitting, setSubmitting] = useState(false);

  // apiError: Stores any error from API calls.
  // Used to display error messages in the modal.
  const [apiError, setApiError] = useState("");

  // deleteTarget: Stores the reward to be deleted, or null.
  // Used to show the delete confirmation modal.
  const [deleteTarget, setDeleteTarget] = useState(null);

  // deleting: Tracks if a deletion is in progress.
  // Used to disable the delete button and show loading.
  const [deleting, setDeleting] = useState(false);

  // fetchRewards: A memoized function to fetch rewards from the server.
  // useCallback: Ensures the function is not recreated on every render, optimizing performance.
  // Purpose: Gets the latest rewards data and updates state.
  // Runs when called, e.g., after adding/editing/deleting a reward.
  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rewards");
      setRewards(data.rewards);
      setTotal(data.total);
      setActive(data.active);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  // useEffect: Runs fetchRewards when the component mounts.
  // Purpose: Load initial rewards data.
  // Runs once when the component first loads.
  useEffect(() => { fetchRewards(); }, [fetchRewards]);

  // openAdd: Function to open the modal for adding a new reward.
  // Purpose: Resets form and opens the modal.
  // Runs when the "Add New Reward" button is clicked.
  const openAdd = () => {
    setEditTarget(null); setForm(emptyRewardForm); setFormErrors({}); setApiError(""); setModalOpen(true);
  };

  // openEdit: Function to open the modal for editing an existing reward.
  // Purpose: Populates form with existing reward data and opens the modal.
  // Runs when the edit button on a reward card is clicked.
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ name: r.name, description: r.description, type: r.type, pointsCost: String(r.pointsCost), icon: r.icon });
    setFormErrors({}); setApiError(""); setModalOpen(true);
  };

  // closeModal: Function to close the add/edit modal.
  // Purpose: Resets modal state.
  // Runs when the close button or cancel is clicked.
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setForm(emptyRewardForm); setFormErrors({}); setApiError(""); };

  // validate: Function to check if the form is valid.
  // Purpose: Returns an object with error messages for invalid fields.
  // Runs before submitting the form.
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.type) e.type = "Required";
    if (!form.pointsCost || isNaN(Number(form.pointsCost)) || Number(form.pointsCost) < 1) e.pointsCost = "Must be ≥ 1";
    return e;
  };

  // handleSubmit: Async function to submit the form (add or edit reward).
  // Purpose: Validates, sends data to server, and refreshes the list.
  // Runs when the form is submitted.
  const handleSubmit = async (ev) => {
    ev.preventDefault(); setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim(), type: form.type, pointsCost: Number(form.pointsCost), icon: form.icon };
      if (editTarget) await api.put(`/rewards/${editTarget._id}`, payload);
      else await api.post("/rewards", payload);
      closeModal(); fetchRewards();
    } catch (err) { setApiError(err.response?.data?.message || "Failed to save."); }
    finally { setSubmitting(false); }
  };

  // toggle: Function to activate/deactivate a reward.
  // Purpose: Toggles the isActive status of a reward via API.
  // Runs when the activate/deactivate button is clicked.
  const toggle = async (r) => {
    try { await api.patch(`/rewards/${r._id}/toggle`); fetchRewards(); } catch { /* */ }
  };

  // confirmDelete: Async function to delete a reward.
  // Purpose: Sends delete request to server and refreshes the list.
  // Runs when the delete confirmation is accepted.
  const confirmDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/rewards/${deleteTarget._id}`); setDeleteTarget(null); fetchRewards(); }
    catch { setDeleteTarget(null); } finally { setDeleting(false); }
  };

  const filteredRewards = rewards.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter === "active" && !r.isActive) return false;
    if (statusFilter === "inactive" && r.isActive) return false;
    return true;
  });

  return (
    <div>
      {/* Points Configuration: Includes the PointsConfigSection component. */}
      <PointsConfigSection />

      {/* Controls Card: Filters & Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Stat counter */}
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredRewards.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{total}</span> reward{total !== 1 ? "s" : ""} •{" "}
          <span className="font-semibold text-[#4a6741]">{active}</span> active
        </p>

        {/* Filters & Add Action */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <CustomFilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "All Types" },
              { value: "free_item", label: "Free Item" },
              { value: "discount", label: "Discount" },
              { value: "eco_badge", label: "Eco Badge" },
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
          <button
            onClick={fetchRewards}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <IoAddOutline className="text-base" />
            Add Reward
          </button>
        </div>
      </div>

      {/* Conditional rendering: Shows loading, empty state, or rewards grid. */}
      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : filteredRewards.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
          <IoGiftOutline className="text-4xl" />
          <p className="text-sm">{typeFilter !== "all" || statusFilter !== "all" ? "No rewards match the selected filters." : "No rewards configured yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Map over rewards to render each reward card. */}
          {filteredRewards.map((r) => (
            <div key={r._id} className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-3 ${!r.isActive ? "opacity-60" : ""}`}>
              {/* Icon + Name: Displays the reward's icon and name. */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] text-xl flex-shrink-0">
                  {ICON_MAP[r.icon] || <IoGiftOutline />}
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-snug">{r.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{r.description || "—"}</p>
                </div>
              </div>
              {/* Divider: Visual separator. */}
              <div className="border-t border-gray-100" />
              {/* Badge + points: Shows type badge and points cost. */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${TYPE_BADGE[r.type]}`}>
                  {TYPE_LABEL[r.type]}
                </span>
                <span className="text-xl font-bold text-[#4a6741]">{r.pointsCost} pts</span>
              </div>
              {/* Actions: Buttons for toggle, edit, delete. */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(r)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition
                    ${r.isActive
                      ? "border-gray-200 text-gray-600 hover:border-[#4a6741]/40 hover:text-[#4a6741]"
                      : "bg-[#d7ecc8] border-[#4a6741]/20 text-[#4a6741]"
                    }`}
                >
                  {r.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => openEdit(r)} className="p-2 text-gray-400 hover:text-[#4a6741] transition border border-gray-200 rounded-xl">
                  <IoCreateOutline className="text-base" />
                </button>
                <button onClick={() => setDeleteTarget(r)} className="p-2 text-gray-400 hover:text-red-500 transition border border-gray-200 rounded-xl">
                  <IoTrashOutline className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal: Overlay for adding or editing a reward. */}
      {/* Conditional rendering: Shows only if modalOpen is true. */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeModal} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="font-bold text-[#4a6741]">{editTarget ? "Edit Reward" : "Add New Reward"}</p>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Conditional rendering: Shows API error if present. */}
              {apiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{apiError}</div>}
              <form id="reward-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Name input field. */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Free Drink"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${formErrors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`} />
                  {/* Conditional rendering: Shows error if validation failed. */}
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                {/* Description input field. */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Any regular-sized beverage"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white" />
                </div>
                {/* Type and Icon selects. */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type <span className="text-red-500">*</span></label>
                    <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white">
                      <option value="free_item">Free Item</option>
                      <option value="discount">Discount</option>
                      <option value="eco_badge">Eco Badge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Icon</label>
                    <select value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white">
                      <option value="gift">Gift</option>
                      <option value="star">Star</option>
                      <option value="leaf">Leaf</option>
                    </select>
                  </div>
                </div>
                {/* Points Cost input. */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Points Cost <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={form.pointsCost} onChange={(e) => setForm((p) => ({ ...p, pointsCost: e.target.value }))}
                    placeholder="e.g. 50"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${formErrors.pointsCost ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`} />
                  {/* Conditional rendering: Shows error if validation failed. */}
                  {formErrors.pointsCost && <p className="text-xs text-red-500 mt-1">{formErrors.pointsCost}</p>}
                </div>
              </form>
            </div>
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="submit" form="reward-form" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
                <IoCheckmarkCircle className="text-base" />
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Reward"}
              </button>
              <button type="button" onClick={closeModal} className="px-5 border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition hover:border-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm modal: Overlay for confirming reward deletion. */}
      {/* Conditional rendering: Shows only if deleteTarget is set. */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <IoAlertCircleOutline className="text-red-500 text-2xl" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Delete Reward?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    "<span className="font-semibold text-gray-700">{deleteTarget.name}</span>" will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
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
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab: Redeem Rewards ──────────────────────────────────────────────────────

// RedeemTab: A React component for the Redeem Rewards tab.
// Purpose: Allows admins to scan student QR codes and redeem rewards for them.
// Used in the main Rewards component when the "redeem" tab is active.
// Runs when the user switches to the Redeem tab.
function RedeemTab() {
  // useRef: A React hook to create a reference to a DOM element.
  // scannerRef: Reference to the QR scanner container div.
  // Used to attach the QR scanner to this element.
  const scannerRef = useRef(null);

  // html5QrRef: Reference to the Html5Qrcode scanner instance.
  // Used to control the scanner (start, stop).
  const html5QrRef = useRef(null);

  // useState hooks for various states.

  // scanning: Tracks if the QR scanner is active.
  // Used to show/hide the scanner UI.
  const [scanning, setScanning] = useState(false);

  // scanError: Stores error messages from scanning.
  // Used to display scan errors to the user.
  const [scanError, setScanError] = useState("");

  // student: Stores the student data after successful QR scan.
  // Used to display student info and allow redemption.
  const [student, setStudent] = useState(null);

  // rewards: Stores the list of active rewards.
  // Used to display available rewards for redemption.
  const [rewards, setRewards] = useState([]);

  // selectedReward: Stores the reward selected for redemption.
  // Used to highlight the selected reward and enable redeem button.
  const [selectedReward, setSelectedReward] = useState(null);

  // redeeming: Tracks if a redemption is in progress.
  // Used to disable the redeem button and show loading.
  const [redeeming, setRedeeming] = useState(false);

  // redeemError: Stores error messages from redemption.
  // Used to display redemption errors.
  const [redeemError, setRedeemError] = useState("");

  // success: Stores success info after redemption.
  // Used to show a success banner with updated points.
  const [success, setSuccess] = useState(null);

  // loadingStudent: Tracks if student lookup is in progress.
  // Used to show loading spinner during QR scan processing.
  const [loadingStudent, setLoadingStudent] = useState(false);

  // useEffect: Fetches active rewards when the component mounts.
  // Purpose: Load rewards that can be redeemed.
  // Runs once when the component first loads.
  useEffect(() => {
    api.get("/rewards", { params: { activeOnly: "true" } })
      .then(({ data }) => setRewards(data.rewards))
      .catch(() => { });
    return () => stopScanner();
  }, []);

  // stopScanner: Function to stop the QR scanner.
  // Purpose: Cleans up the scanner when not needed.
  // Runs when scanning is cancelled or after successful scan.
  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => { });
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  // startScanner: Async function to start the QR scanner.
  // Purpose: Initializes and starts the camera for QR code scanning.
  // Runs when the scan button is clicked.
  const startScanner = async () => {
    setScanError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          stopScanner();
          await lookupStudent(decodedText.trim());
        },
        () => { }
      );
    } catch (err) {
      setScanning(false);
      setScanError("Camera access denied or not available. Please allow camera permissions.");
    }
  };

  // handleFileUpload: Async function to process uploaded QR code image files.
  // Purpose: Reads student QR code directly from an uploaded image file.
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError("");
    setLoadingStudent(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader-file-temp");
      const decodedText = await html5QrCode.scanFile(file, false);
      await lookupStudent(decodedText.trim());
    } catch (err) {
      setScanError("Could not read QR code from the uploaded image. Please ensure the QR code image is clear.");
    } finally {
      setLoadingStudent(false);
      e.target.value = "";
    }
  };

  // lookupStudent: Async function to fetch student data by QR token.
  // Purpose: Looks up the student using the scanned QR code.
  // Runs after a QR code is successfully scanned.
  const lookupStudent = async (token) => {
    setLoadingStudent(true); setScanError("");
    try {
      const { data } = await api.get(`/students/by-qr/${encodeURIComponent(token)}`);
      setStudent(data);
      setSelectedReward(null);
      setRedeemError("");
      setSuccess(null);
    } catch (err) {
      setScanError(err.response?.data?.message || "QR code not recognised.");
    } finally {
      setLoadingStudent(false);
    }
  };

  // handleRedeem: Async function to redeem the selected reward.
  // Purpose: Sends redemption request to server and updates UI.
  // Runs when the redeem button is clicked.
  const handleRedeem = async () => {
    if (!student || !selectedReward) return;
    setRedeeming(true); setRedeemError("");
    try {
      const { data } = await api.post("/redemptions", { studentId: student._id, rewardId: selectedReward._id });
      setSuccess({ reward: selectedReward.name, pointsLeft: data.studentPoints });
      setStudent((s) => ({ ...s, points: data.studentPoints }));
      setSelectedReward(null);
    } catch (err) {
      setRedeemError(err.response?.data?.message || "Redemption failed.");
    } finally {
      setRedeeming(false);
    }
  };

  // reset: Function to reset the redemption flow.
  // Purpose: Clears student and reward selection to start over.
  // Runs when the reset button is clicked.
  const reset = () => { setStudent(null); setSelectedReward(null); setRedeemError(""); setSuccess(null); setScanError(""); };

  // return: The JSX for the RedeemTab component.
  // Purpose: Renders the QR scanner and redemption interface.
  // Runs every time the component re-renders.
  return (
    <div className="max-w-2xl">
      {/* Conditional rendering: If no student is selected, show scan step. */}
      {!student ? (
        /* Step 1 — Scan */
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="font-bold text-[#4a6741] text-base mb-4">Step 1: Scan Student QR Code</p>

          {/* Scanner area: Clickable div that starts scanning. */}
          <div
            id="qr-reader-wrapper"
            onClick={!scanning ? startScanner : undefined}
            className={`border-2 border-dashed rounded-2xl overflow-hidden transition
              ${scanning ? "border-[#4a6741]" : "border-gray-200 cursor-pointer hover:border-[#4a6741]/60"}`}
          >
            <div id="qr-reader" ref={scannerRef} className={scanning ? "block" : "hidden"} />
            <div id="qr-reader-file-temp" className="hidden" />
            {!scanning && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                {loadingStudent ? (
                  <IoRefreshOutline className="text-5xl animate-spin text-[#4a6741]" />
                ) : (
                  <>
                    <IoCameraOutline className="text-5xl text-gray-300" />
                    <p className="font-semibold text-gray-600">Scan or Upload Student QR Code</p>
                    <p className="text-sm text-gray-400 mb-1">Use camera or select an image file</p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={startScanner}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3a5333] transition shadow-sm"
                      >
                        <IoCameraOutline className="text-base" />
                        Use Camera Scanner
                      </button>

                      <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer shadow-sm">
                        <IoCloudUploadOutline className="text-base text-[#4a6741]" />
                        Upload QR Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cancel button: Shows only when scanning. */}
          {scanning && (
            <button onClick={stopScanner} className="mt-3 text-xs text-gray-500 hover:text-[#4a6741] underline">
              Cancel scanning
            </button>
          )}

          {/* Scan error: Shows if there's an error. */}
          {scanError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {scanError}
            </div>
          )}
        </div>
      ) : (
        /* Step 2 — Student found, pick reward */
        <div className="space-y-4">
          {/* Student card: Displays student info. */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] font-bold text-lg">
              {student.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{student.fullName}</p>
              <p className="text-xs text-gray-400 font-mono">{student.schoolId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Points</p>
              <p className="text-2xl font-bold text-[#4a6741]">{student.points}</p>
            </div>
            <button onClick={reset} className="ml-2 text-gray-400 hover:text-gray-600 transition">
              <IoCloseOutline className="text-xl" />
            </button>
          </div>

          {/* Success banner: Shows after successful redemption. */}
          {success && (
            <div className="bg-[#d7ecc8] border border-[#4a6741]/20 rounded-2xl px-5 py-4 flex items-center gap-3">
              <IoCheckmarkCircle className="text-[#4a6741] text-2xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#4a6741]">Redeemed: {success.reward}</p>
                <p className="text-xs text-[#4a6741]/70">Points remaining: {success.pointsLeft}</p>
              </div>
            </div>
          )}

          {/* Step 2: Pick reward */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-bold text-[#4a6741] mb-3">Step 2: Select a Reward</p>
            {/* Conditional rendering: If no rewards, show message. */}
            {rewards.length === 0 ? (
              <p className="text-sm text-gray-400">No active rewards available.</p>
            ) : (
              <div className="space-y-2">
                {/* Map over rewards to render selectable buttons. */}
                {rewards.map((r) => {
                  const canAfford = student.points >= r.pointsCost;
                  const isSelected = selectedReward?._id === r._id;
                  return (
                    <button
                      key={r._id}
                      disabled={!canAfford}
                      onClick={() => setSelectedReward(isSelected ? null : r)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition
                        ${isSelected ? "border-[#4a6741] bg-[#d7ecc8]" : canAfford ? "border-gray-200 hover:border-[#4a6741]/40 hover:bg-gray-50" : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] flex-shrink-0">
                        {ICON_MAP[r.icon]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.description}</p>
                      </div>
                      <span className={`text-sm font-bold ${canAfford ? "text-[#4a6741]" : "text-gray-400"}`}>
                        {r.pointsCost} pts
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Redeem error: Shows if redemption failed. */}
            {redeemError && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{redeemError}</div>
            )}

            {/* Redeem button: Shows only if a reward is selected. */}
            {selectedReward && (
              <button
                onClick={handleRedeem}
                disabled={redeeming}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                <IoCheckmarkCircle />
                {redeeming ? "Processing…" : `Confirm — Redeem "${selectedReward.name}"`}
              </button>
            )}
          </div>

          {/* Back button: Allows scanning a different student. */}
          <button onClick={reset} className="text-sm text-gray-400 hover:text-[#4a6741] underline">
            ← Scan different student
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Redemption History ──────────────────────────────────────────────────

// HistoryTab: A React component for the Redemption History tab.
// Purpose: Displays a searchable list of past redemptions.
// Used in the main Rewards component when the "history" tab is active.
// Runs when the user switches to the History tab.
function HistoryTab() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/redemptions", { params: { search } });
      setRecords(data.redemptions);
    } catch { /* */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchHistory, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchHistory]);

  const filteredRecords = records.filter((r) => {
    if (timeframeFilter !== "all") {
      const recordDate = new Date(r.createdAt);
      const now = new Date();
      if (timeframeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (recordDate < today) return false;
      } else if (timeframeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (recordDate < weekAgo) return false;
      } else if (timeframeFilter === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (recordDate < monthAgo) return false;
      }
    }
    return true;
  });

  return (
    <div>
      {/* Controls Card: Search & Refresh */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input field */}
        <div className="relative flex-1 w-full">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or ID..."
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

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <CustomFilterSelect
            value={timeframeFilter}
            onChange={setTimeframeFilter}
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ]}
          />

          <button
            onClick={fetchHistory}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table: Displays redemption records. */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_0.8fr_1fr] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>Student</span>
          <span>School ID</span>
          <span>Reward</span>
          <span>Points Used</span>
          <span>Timestamp</span>
        </div>
        {/* Conditional rendering: Shows loading, empty state, or records. */}
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={5} showHeader={false} />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoCalendarOutline className="text-4xl text-gray-300" />
            <p className="text-sm">{search || timeframeFilter !== "all" ? "No records match." : "No redemption history yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {/* Map over records to render table rows. */}
            {filteredRecords.map((r) => (
              <li key={r._id} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_0.8fr_1fr] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-medium text-gray-800 truncate">{r.studentName}</span>
                <span className="font-mono text-xs font-semibold text-[#4a6741]">{r.schoolId}</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                  <IoGiftOutline className="text-[#4a6741]" />
                  {r.rewardName}
                </span>
                <span className="text-xs font-bold text-red-500">-{r.pointsUsed} pts</span>
                <span className="text-xs text-gray-400 font-mono">{fmt(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Footer */}
        {!loading && filteredRecords.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-700">{filteredRecords.length}</span> record{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: BYOC Records ────────────────────────────────────────────────────────

// ByocTab: A React component for the BYOC Records tab.
// Purpose: Allows logging Bring Your Own Container (BYOC) actions and viewing records.
// Used in the main Rewards component when the "byoc" tab is active.
// Runs when the user switches to the BYOC tab.
function ByocTab() {
  // useRef hooks for scanner.

  // scannerRef: Reference to the QR scanner container.
  // Used to attach the QR scanner to this element.
  const scannerRef = useRef(null);

  // html5QrRef: Reference to the scanner instance.
  // Used to control the scanner (start, stop).
  const html5QrRef = useRef(null);

  // Scanner state.

  // scanning: Tracks if scanner is active.
  // Used to show/hide the scanner UI.
  const [scanning, setScanning] = useState(false);

  // scanError: Stores scan errors.
  // Used to display scan errors to the user.
  const [scanError, setScanError] = useState("");

  // loadingStudent: Tracks student lookup.
  // Used to show loading spinner during QR scan processing.
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Confirm modal state.

  // confirmStudent: Stores student data for confirmation.
  // Used to show student info in the confirmation modal.
  const [confirmStudent, setConfirmStudent] = useState(null);

  // ecoPoints: Stores the eco points per BYOC.
  // Used to display how many points will be awarded.
  const [ecoPoints, setEcoPoints] = useState(5);

  // confirming: Tracks confirmation in progress.
  // Used to disable the confirm button and show loading.
  const [confirming, setConfirming] = useState(false);

  // confirmError: Stores confirmation errors.
  // Used to display errors in the confirmation modal.
  const [confirmError, setConfirmError] = useState("");

  // Post-confirm state.

  // awardedStudent: Stores student after points awarded.
  // Used to display updated student info and allow optional redemption.
  const [awardedStudent, setAwardedStudent] = useState(null);

  // rewards: Stores active rewards for optional redemption.
  // Used to display rewards that can be redeemed immediately after BYOC.
  const [rewards, setRewards] = useState([]);

  // selectedReward: Stores selected reward for redemption.
  // Used to highlight the selected reward and enable redeem button.
  const [selectedReward, setSelectedReward] = useState(null);

  // redeeming: Tracks redemption in progress.
  // Used to disable the redeem button and show loading.
  const [redeeming, setRedeeming] = useState(false);

  // redeemError: Stores redemption errors.
  // Used to display redemption errors.
  const [redeemError, setRedeemError] = useState("");

  // redeemSuccess: Stores redemption success info.
  // Used to show success message after redemption.
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  // Records list state.

  // records: Stores BYOC records.
  // Used to display the list of BYOC logs.
  const [records, setRecords] = useState([]);

  // stats: Stores stats like eco points today and containers saved.
  // Used to display summary statistics.
  const [stats, setStats] = useState({ ecoPointsToday: 0, containersSavedMonth: 0 });

  // search: Stores search query for filtering records.
  // Used to filter BYOC records by student name or ID.
  const [search, setSearch] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [confirmedByFilter, setConfirmedByFilter] = useState("all");

  // loading: Tracks if records are loading.
  // Used to show loading spinner for the records list.
  const [loading, setLoading] = useState(true);

  // fetchByoc: Memoized function to fetch BYOC records.
  // useCallback: Prevents unnecessary re-creations.
  // Purpose: Gets filtered BYOC records from the server.
  // Runs when search changes or component mounts.
  const fetchByoc = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/byoc", { params: { search } });
      setRecords(data.records);
      setStats(data.stats);
    } catch { /* */ } finally { setLoading(false); }
  }, [search]);

  // useEffect for search debouncing.
  // Purpose: Updates records when search changes, with a delay to avoid too many requests.
  // Runs when fetchByoc changes (i.e., when search changes).
  useEffect(() => {
    const t = setTimeout(fetchByoc, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchByoc]);

  // useEffect to load config and rewards on mount.
  // Purpose: Fetches eco points config and active rewards when the component loads.
  // Runs once when the component first loads.
  useEffect(() => {
    api.get("/points-config").then(({ data }) => setEcoPoints(data.ecoPointsPerByoc ?? 5)).catch(() => { });
    api.get("/rewards", { params: { activeOnly: "true" } }).then(({ data }) => setRewards(data.rewards)).catch(() => { });
    return () => stopScanner();
  }, []);

  const filteredRecords = records.filter((r) => {
    if (timeframeFilter !== "all") {
      const recordDate = new Date(r.createdAt);
      const now = new Date();
      if (timeframeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (recordDate < today) return false;
      } else if (timeframeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (recordDate < weekAgo) return false;
      } else if (timeframeFilter === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (recordDate < monthAgo) return false;
      }
    }
    if (confirmedByFilter !== "all") {
      if ((r.confirmedByRole || "").toLowerCase() !== confirmedByFilter) return false;
    }
    return true;
  });

  // stopScanner: Function to stop the QR scanner.
  // Purpose: Cleans up the scanner when not needed.
  // Runs when scanning is cancelled or after successful scan.
  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => { });
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  // startScanner: Async function to start the QR scanner for BYOC.
  // Purpose: Initializes and starts the camera for QR code scanning.
  // Runs when the scan button is clicked.
  const startScanner = async () => {
    setScanError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-byoc-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          stopScanner();
          setLoadingStudent(true); setScanError("");
          try {
            const { data } = await api.get(`/students/by-qr/${encodeURIComponent(decodedText.trim())}`);
            setConfirmStudent(data);
          } catch (err) {
            setScanError(err.response?.data?.message || "QR code not recognised.");
          } finally {
            setLoadingStudent(false);
          }
        },
        () => { }
      );
    } catch {
      setScanning(false);
      setScanError("Camera access denied or not available.");
    }
  };

  // handleFileUpload: Async function to process uploaded BYOC QR code image files.
  // Purpose: Reads student QR code directly from an uploaded image file for BYOC.
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError("");
    setLoadingStudent(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-byoc-file-temp");
      const decodedText = await html5QrCode.scanFile(file, false);
      try {
        const { data } = await api.get(`/students/by-qr/${encodeURIComponent(decodedText.trim())}`);
        setConfirmStudent(data);
      } catch (err) {
        setScanError(err.response?.data?.message || "QR code not recognised.");
      }
    } catch (err) {
      setScanError("Could not read QR code from the uploaded image. Please ensure the QR code image is clear.");
    } finally {
      setLoadingStudent(false);
      e.target.value = "";
    }
  };

  // handleConfirm: Async function to confirm BYOC and award points.
  // Purpose: Sends BYOC log request to server and updates UI.
  // Runs when the confirm button is clicked in the modal.
  const handleConfirm = async () => {
    if (!confirmStudent) return;
    setConfirming(true); setConfirmError("");
    try {
      const { data } = await api.post("/byoc", { studentId: confirmStudent._id });
      setAwardedStudent({ ...confirmStudent, points: data.studentPoints });
      setConfirmStudent(null);
      fetchByoc();
    } catch (err) {
      setConfirmError(err.response?.data?.message || "Failed to log BYOC.");
    } finally {
      setConfirming(false);
    }
  };

  // handleRedeem: Async function to redeem a reward after BYOC.
  // Purpose: Sends redemption request to server and updates UI.
  // Runs when the redeem button is clicked.
  const handleRedeem = async () => {
    if (!awardedStudent || !selectedReward) return;
    setRedeeming(true); setRedeemError("");
    try {
      const { data } = await api.post("/redemptions", { studentId: awardedStudent._id, rewardId: selectedReward._id });
      setRedeemSuccess({ reward: selectedReward.name, pointsLeft: data.studentPoints });
      setAwardedStudent((s) => ({ ...s, points: data.studentPoints }));
      setSelectedReward(null);
    } catch (err) {
      setRedeemError(err.response?.data?.message || "Redemption failed.");
    } finally {
      setRedeeming(false);
    }
  };

  // resetFlow: Function to reset the entire BYOC flow.
  // Purpose: Clears all state to start over.
  // Runs when the reset button is clicked.
  const resetFlow = () => {
    setConfirmStudent(null); setConfirmError("");
    setAwardedStudent(null); setSelectedReward(null);
    setRedeemError(""); setRedeemSuccess(null); setScanError("");
  };

  // roleBadge: Helper function to get badge styles for roles.
  // Purpose: Returns Tailwind classes for role badges.
  // Example: roleBadge("admin") returns "bg-[#d7ecc8] text-[#4a6741]".
  const roleBadge = (role) =>
    role === "admin" ? "bg-[#d7ecc8] text-[#4a6741]" : "bg-gray-100 text-gray-600";

  return (
    <div>
      {/* ── Scan Section ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <p className="font-extrabold text-[#4a6741] text-base mb-4">Log BYOC — Scan Student QR</p>

        {!awardedStudent ? (
          <div
            id="qr-byoc-wrapper"
            onClick={!scanning && !confirmStudent && !loadingStudent ? startScanner : undefined}
            className={`border-2 border-dashed rounded-2xl overflow-hidden transition mb-3
              ${scanning || confirmStudent ? "border-[#4a6741]" : "border-gray-200 cursor-pointer hover:border-[#4a6741]/60"}`}
          >
            <div id="qr-byoc-reader" ref={scannerRef} className={scanning ? "block" : "hidden"} />
            <div id="qr-byoc-file-temp" className="hidden" />
            {!scanning && !loadingStudent && !confirmStudent && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <IoCameraOutline className="text-5xl text-gray-300" />
                <p className="font-semibold text-gray-600">Scan or Upload Student QR Code</p>
                <p className="text-xs text-gray-400 mb-1">Awards +{ecoPoints} eco points to the student</p>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={startScanner}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3a5333] transition shadow-sm"
                  >
                    <IoCameraOutline className="text-base" />
                    Use Camera Scanner
                  </button>

                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer shadow-sm">
                    <IoCloudUploadOutline className="text-base text-[#4a6741]" />
                    Upload QR Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            )}
            {loadingStudent && (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <IoRefreshOutline className="text-4xl text-[#4a6741] animate-spin" />
                <p className="text-sm text-gray-500">Looking up student…</p>
              </div>
            )}
          </div>
        ) : (
          /* Post-award success */
          <div className="bg-[#d7ecc8] border border-[#b5d99c] rounded-2xl px-5 py-4 flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#4a6741] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {awardedStudent.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[#4a6741]">{awardedStudent.fullName}</p>
              <p className="text-xs text-[#4a6741]/70 font-mono">{awardedStudent.schoolId}</p>
              <p className="text-sm font-semibold text-[#4a6741] mt-0.5">+{ecoPoints} eco points credited ✓</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#4a6741]/60">Balance</p>
              <p className="text-2xl font-extrabold text-[#4a6741]">{awardedStudent.points}</p>
            </div>
          </div>
        )}

        {scanning && (
          <button onClick={stopScanner} className="text-xs text-gray-400 hover:text-[#4a6741] underline">
            Cancel scanning
          </button>
        )}
        {scanError && (
          <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{scanError}</div>
        )}

        {/* Optional rewards after award */}
        {awardedStudent && (
          <div className="mt-4">
            <p className="text-sm font-bold text-[#4a6741] mb-2">Redeem a Reward? <span className="text-gray-400 font-normal">(optional)</span></p>
            {redeemSuccess && (
              <div className="mb-3 bg-[#d7ecc8] border border-[#4a6741]/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <IoCheckmarkCircle className="text-[#4a6741] text-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#4a6741]">Redeemed: {redeemSuccess.reward}</p>
                  <p className="text-xs text-[#4a6741]/70">Points remaining: {redeemSuccess.pointsLeft}</p>
                </div>
              </div>
            )}
            {rewards.length === 0 ? (
              <p className="text-sm text-gray-400">No active rewards available.</p>
            ) : (
              <div className="space-y-2">
                {rewards.map((r) => {
                  const canAfford = awardedStudent.points >= r.pointsCost;
                  const isSelected = selectedReward?._id === r._id;
                  return (
                    <button
                      key={r._id}
                      disabled={!canAfford}
                      onClick={() => setSelectedReward(isSelected ? null : r)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition
                        ${isSelected ? "border-[#4a6741] bg-[#d7ecc8]" : canAfford ? "border-gray-200 hover:border-[#4a6741]/40 hover:bg-gray-50" : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] flex-shrink-0">
                        {ICON_MAP[r.icon]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.description}</p>
                      </div>
                      <span className={`text-sm font-bold ${canAfford ? "text-[#4a6741]" : "text-gray-400"}`}>{r.pointsCost} pts</span>
                    </button>
                  );
                })}
              </div>
            )}
            {redeemError && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{redeemError}</div>
            )}
            {selectedReward && (
              <button
                onClick={handleRedeem}
                disabled={redeeming}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                <IoCheckmarkCircle />
                {redeeming ? "Processing…" : `Confirm — Redeem "${selectedReward.name}"`}
              </button>
            )}
            <button onClick={resetFlow} className="mt-3 text-sm text-gray-400 hover:text-[#4a6741] underline">
              Skip / Scan next student
            </button>
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {/* Conditional rendering: Shows only if confirmStudent is set. */}
      {confirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#4a6741] px-6 py-4">
              <p className="text-white font-extrabold text-base">Confirm BYOC Points</p>
              <p className="text-white/70 text-xs mt-0.5">Award eco points for bringing own container</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 bg-[#f0f7ec] rounded-2xl px-4 py-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#4a6741] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {confirmStudent.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-gray-800">{confirmStudent.fullName}</p>
                  <p className="text-xs text-gray-400 font-mono">{confirmStudent.schoolId}</p>
                </div>
              </div>
              <div className="bg-[#d7ecc8] rounded-xl px-5 py-4 text-center mb-5">
                <p className="text-sm text-[#4a6741]/70 mb-1">Points to award</p>
                <p className="text-4xl font-extrabold text-[#4a6741]">+{ecoPoints}</p>
                <p className="text-xs text-[#4a6741]/60 mt-1">Eco Points</p>
              </div>
              {/* Conditional rendering: Shows error if present. */}
              {confirmError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{confirmError}</div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmStudent(null); setConfirmError(""); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5333] text-white font-bold text-sm transition disabled:opacity-60"
                >
                  {confirming ? (
                    <IoRefreshOutline className="animate-spin" />
                  ) : (
                    <>
                      <IoCheckmarkCircle />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#4a6741] rounded-2xl px-6 py-5">
          <p className="text-sm text-white/80 mb-1">Eco Points Issued Today</p>
          <p className="text-4xl font-bold text-white">{stats.ecoPointsToday}</p>
        </div>
        <div className="bg-[#d7ecc8] rounded-2xl px-6 py-5">
          <p className="text-sm text-[#4a6741] font-medium mb-1">Containers Saved (Month)</p>
          <p className="text-4xl font-bold text-[#4a6741]">{stats.containersSavedMonth}</p>
        </div>
      </div>

      {/* ── Search & Controls Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input field */}
        <div className="relative flex-1 w-full">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or ID..."
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

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <CustomFilterSelect
            value={timeframeFilter}
            onChange={setTimeframeFilter}
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ]}
          />
          <CustomFilterSelect
            value={confirmedByFilter}
            onChange={setConfirmedByFilter}
            options={[
              { value: "all", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
            ]}
          />

          <button
            onClick={fetchByoc}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>Student</span>
          <span>School ID</span>
          <span>Eco Points</span>
          <span>Confirmed By</span>
          <span>Timestamp</span>
        </div>
        {/* Conditional rendering: Shows loading, empty state, or records. */}
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={5} showHeader={false} />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoLeafOutline className="text-4xl text-gray-300" />
            <p className="text-sm">{search || timeframeFilter !== "all" || confirmedByFilter !== "all" ? "No records match." : "No BYOC records yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {/* Map over records to render table rows. */}
            {filteredRecords.map((r) => (
              <li key={r._id} className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-medium text-gray-800 truncate">{r.studentName}</span>
                <span className="font-mono text-xs font-semibold text-[#4a6741]">{r.schoolId}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#4a6741]">
                  <IoLeafOutline className="text-[#4a6741]" />
                  +{r.ecoPoints} pts
                </span>
                <span>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge(r.confirmedByRole)}`}>
                    {r.confirmedByRole}
                  </span>
                </span>
                <span className="text-xs text-gray-400 font-mono">{fmt(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Footer */}
        {!loading && filteredRecords.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-700">{filteredRecords.length}</span> record{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// Rewards: The main React component for the Rewards page.
// Purpose: Renders the rewards management interface with tabs.
// Used as the main page component in the admin section.
// Runs when the user navigates to the Rewards page.
export default function Rewards() {
  // useState: Stores the currently active tab.
  // Used to switch between different sections (redeem, configure, history, byoc).
  const [activeTab, setActiveTab] = useState("redeem");

  // return: The JSX that defines the main page layout.
  // Purpose: Displays the header, tabs, and the active tab content.
  // Runs every time the component re-renders.
  return (
    <AdminLayout breadcrumb="Rewards">
      {/* Header: Displays the page title and description. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
            <IoGiftOutline className="text-3xl" />
            Rewards Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure reward items, set point rates, and scan QR codes to process redemptions
          </p>
        </div>
        <button className="p-2 text-gray-400 hover:text-[#4a6741] transition self-start sm:self-auto" title="Settings">
          <IoSettingsOutline className="text-xl" />
        </button>
      </div>

      {/* Tabs: Navigation to switch between sections. */}
      <div className="flex items-center gap-0 border-b border-gray-200 mb-6 mt-4">
        {/* Map over TABS to render tab buttons. */}
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px
              ${activeTab === t.key
                ? "border-[#4a6741] text-[#4a6741]"
                : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
          >
            <span className="text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Conditionally renders the active tab component. */}
      {/* Checks activeTab and shows the corresponding component. */}
      {activeTab === "redeem" && <RedeemTab />}
      {activeTab === "configure" && <ConfigureTab />}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "byoc" && <ByocTab />}
    </AdminLayout>
  );
}

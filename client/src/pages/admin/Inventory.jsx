// Hooks: manage state, side effects, memoize functions, store DOM references
import { useState, useEffect, useCallback, useRef } from "react";
import {
  IoCubeOutline,
  IoAddOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoSearchOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { SkeletonTable } from "../../components/SkeletonLoader";

// ─── Status helpers ───────────────────────────────────────────────────────────
// Status lookup with styling. Why: Consistent UI for each stock state
const STATUS = {
  in_stock: {
    label: "In Stock",
    dot: "bg-[#4a6741]",
    badge: "bg-[#d7ecc8] text-[#4a6741]",
  },
  low_stock: {
    label: "Low Stock",
    dot: "bg-red-400",
    badge: "bg-red-100 text-red-500",
  },
  out_of_stock: {
    label: "Out of Stock",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-600",
  },
};

// Determine stock status from quantity. Why: Reusable logic for filter & display
const deriveStatus = (quantity, minThreshold) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= minThreshold) return "low_stock";
  return "in_stock";
};

// Reusable form field wrapper with label & error. Why: Reduce duplication
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Reusable input with error styling. Why: Consistent form styling
const Input = ({ error, className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white
      ${error
        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
        : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
      } ${className}`}
  />
);

// Dropdown options. Why: Single source for allowed values
const CATEGORIES = ["Protein", "Vegetables", "Grains", "Dairy", "Beverages", "Condiments", "Snacks", "Others"];
const UNITS = ["kg", "g", "pcs", "L", "mL", "box", "pack", "dozen"];

// Form reset template. Why: Clear form on close/success
const emptyForm = { name: "", category: "", quantity: "", unit: "kg", minThreshold: "", price: "" };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Inventory() {
  // Main data states. Why: Display items & stats on page
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  // Filter & search states. Why: Control what data to fetch
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Inline quantity edit state. Why: Edit qty in table without modal
  const [editingQtyId, setEditingQtyId] = useState(null);
  const [qtyDraft, setQtyDraft] = useState("");
  const qtyInputRef = useRef(null); // Access input for auto-select

  // Modal & form states. Why: Control add/edit form UI & validation
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode, object = edit mode
  const [form, setForm] = useState(emptyForm); // Form field values
  const [formErrors, setFormErrors] = useState({}); // Validation error map
  const [submitting, setSubmitting] = useState(false); // Disable submit during API call
  const [apiError, setApiError] = useState(""); // API error message

  // Delete confirmation state. Why: Confirm before permanent deletion
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch inventory with filters. Why: Get paginated, filtered data from backend
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search }; // Build query based on filters
      if (activeFilter !== "all") params.status = activeFilter;
      const { data } = await api.get("/inventory", { params });
      setItems(data.items);
      setSummary(data.summary);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  // Auto-fetch with debounce. Why: Prevent API spam on every keystroke
  useEffect(() => {
    const t = setTimeout(fetchItems, search ? 400 : 0); // 400ms delay for search
    return () => clearTimeout(t); // Cleanup timer
  }, [fetchItems]);

  // Start inline edit. Why: Quick edit without modal
  const startEditQty = (item) => {
    setEditingQtyId(item._id);
    setQtyDraft(String(item.quantity));
    setTimeout(() => qtyInputRef.current?.select(), 50); // Auto-select for quick typing
  };

  // Save qty change. Why: Persist to backend & update UI
  const commitQty = async (item) => {
    const val = parseFloat(qtyDraft);
    if (isNaN(val) || val < 0) { setEditingQtyId(null); return; } // Validate input
    if (val === item.quantity) { setEditingQtyId(null); return; } // Skip if unchanged
    try {
      const { data } = await api.patch(`/inventory/${item._id}/quantity`, { quantity: val });
      setItems((prev) => prev.map((i) => (i._id === data._id ? data : i))); // Optimistic update
      // Refresh summary stats
      fetchItems();
    } catch {
      // silently revert
    } finally {
      setEditingQtyId(null);
    }
  };

  // Open add modal. Why: Reset form for clean add state
  const openAdd = () => {
    setEditTarget(null); // null = add mode
    setForm(emptyForm); // Clear fields
    setFormErrors({}); // Clear errors
    setApiError("");
    setModalOpen(true);
  };

  // Open edit modal. Why: Pre-populate form with item data
  const openEdit = (item) => {
    setEditTarget(item);
    // Load item data into form (convert numbers to strings)
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minThreshold: String(item.minThreshold),
      price: String(item.price),
    });
    setFormErrors({});
    setApiError("");
    setModalOpen(true);
  };

  // Close modal & reset. Why: Clean state when user cancels/saves
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyForm); // Reset form
    setFormErrors({});
    setApiError("");
  };

  // Update form & clear error. Why: Live state + error clearing as user types
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" })); // Clear error on change
  };

  // Validate all fields. Why: Prevent invalid data before API
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category.trim()) e.category = "Required";
    if (form.quantity === "" || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = "Valid number ≥ 0";
    if (!form.unit.trim()) e.unit = "Required";
    if (form.minThreshold === "" || isNaN(Number(form.minThreshold)) || Number(form.minThreshold) < 0) e.minThreshold = "Valid number ≥ 0";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Valid number ≥ 0";
    return e; // Empty object = no errors
  };

  // Submit form. Why: Validate then send to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate(); // Check all fields
    if (Object.keys(errs).length) { setFormErrors(errs); return; } // Show errors & exit
    setSubmitting(true); // Lock button
    try {
      // Prepare payload (trim strings, convert to numbers)
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity),
        unit: form.unit.trim(),
        minThreshold: Number(form.minThreshold),
        price: Number(form.price),
      };
      // Choose add or edit endpoint
      if (editTarget) {
        await api.put(`/inventory/${editTarget._id}`, payload);
      } else {
        await api.post("/inventory", payload);
      }
      closeModal();
      fetchItems(); // Refresh list
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save item.");
    } finally {
      setSubmitting(false); // Unlock button
    }
  };

  // Execute deletion. Why: Confirmation shown, now remove permanently
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/inventory/${deleteTarget._id}`); // Send delete request
      setDeleteTarget(null); // Close modal
      fetchItems(); // Refresh list
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Status filter options. Why: Let users view specific stock levels
  const filters = [
    { key: "all", label: "All Items" },
    { key: "in_stock", label: "In Stock" },
    { key: "low_stock", label: "Low Stock" },
    { key: "out_of_stock", label: "Out of Stock" },
  ];

  return (
    <AdminLayout breadcrumb="Inventory">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
            <IoCubeOutline className="text-3xl" />
            Inventory Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track ingredient stock levels, update threshold alerts, and manage item pricing
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto"
        >
          <IoAddOutline className="text-lg" />
          Add Item
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Items */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Items</p>
          <p className="text-3xl font-bold text-gray-800">{summary.total}</p>
        </div>
        {/* In Stock */}
        <div className="bg-[#d7ecc8] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-sm text-[#4a6741] font-medium mb-1">In Stock</p>
          <p className="text-3xl font-bold text-[#4a6741]">{summary.inStock}</p>
        </div>
        {/* Low Stock */}
        <div className="bg-red-50 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-sm text-red-400 font-medium mb-1">Low Stock</p>
          <p className="text-3xl font-bold text-red-500">{summary.lowStock}</p>
        </div>
        {/* Out of Stock */}
        <div className="bg-white border-2 border-red-300 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-sm text-red-400 font-medium mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600">{summary.outOfStock}</p>
        </div>
      </div>

      {/* ── Search & Filter Controls Card Container ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] relative">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or category…"
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

        {/* Filter Pills & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap
                  ${activeFilter === f.key
                    ? "bg-[#4a6741] text-white border-[#4a6741] shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#4a6741]/40 hover:text-[#4a6741]"
                  }`}
              >
                {f.label}
              </button>
            ))}
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

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.1fr_1.1fr_0.9fr_1fr_80px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>Item Name</span>
          <span>Category</span>
          <span>Quantity</span>
          <span>Min Threshold</span>
          <span>Price</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>

        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={6} showHeader={false} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoCubeOutline className="text-4xl text-gray-300" />
            <p className="text-sm">{search ? "No items match your search." : "No inventory items yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => {
              const st = deriveStatus(item.quantity, item.minThreshold);
              const statusInfo = STATUS[st];
              const isEditingQty = editingQtyId === item._id;

              return (
                <li
                  key={item._id}
                  className="grid grid-cols-[2fr_1.2fr_1.1fr_1.1fr_0.9fr_1fr_80px] items-center px-5 py-3.5 hover:bg-gray-50 transition"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <IoCubeOutline className="text-gray-400 text-sm" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate">{item.name}</span>
                  </div>

                  {/* Category */}
                  <span className="text-xs text-gray-500 truncate">{item.category}</span>

                  {/* Quantity — inline editable */}
                  <div className="flex flex-col gap-0.5">
                    {isEditingQty ? (
                      <input
                        ref={qtyInputRef}
                        type="number"
                        min="0"
                        value={qtyDraft}
                        onChange={(e) => setQtyDraft(e.target.value)}
                        onBlur={() => commitQty(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitQty(item);
                          if (e.key === "Escape") setEditingQtyId(null);
                        }}
                        className="w-20 px-2 py-1 border border-[#4a6741] rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#4a6741]/30"
                      />
                    ) : (
                      <button
                        onClick={() => startEditQty(item)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 text-left hover:border-[#4a6741]/50 transition bg-white"
                        title="Click to edit"
                      >
                        {item.quantity}
                      </button>
                    )}
                    <span className="text-[11px] text-gray-400 pl-2">{item.unit}</span>
                  </div>

                  {/* Min Threshold */}
                  <span className="text-xs text-gray-500">
                    {item.minThreshold} {item.unit}
                  </span>

                  {/* Price */}
                  <span className="text-sm font-bold text-gray-800">
                    ₱{Number(item.price).toLocaleString()}
                  </span>

                  {/* Status */}
                  <span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-gray-400 hover:text-[#4a6741] transition p-1"
                      title="Edit"
                    >
                      <IoCreateOutline className="text-lg" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                      title="Delete"
                    >
                      <IoTrashOutline className="text-lg" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-700">{items.length}</span> item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeModal} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-[#4a6741] text-base">
                  {editTarget ? "Edit Item" : "Add New Item"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editTarget ? "Update inventory item details" : "Add an item to inventory"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {apiError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {apiError}
                </div>
              )}
              <form id="inventory-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <Field label="Item Name" required error={formErrors.name}>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Chicken Breast"
                    error={formErrors.name}
                  />
                </Field>

                {/* Category */}
                <Field label="Category" required error={formErrors.category}>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white
                      ${formErrors.category
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
                      }`}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                {/* Quantity + Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quantity" required error={formErrors.quantity}>
                    <Input
                      type="number"
                      min="0"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleFormChange}
                      placeholder="0"
                      error={formErrors.quantity}
                    />
                  </Field>
                  <Field label="Unit" required error={formErrors.unit}>
                    <select
                      name="unit"
                      value={form.unit}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Min Threshold */}
                <Field label="Min Threshold" required error={formErrors.minThreshold}>
                  <Input
                    type="number"
                    min="0"
                    name="minThreshold"
                    value={form.minThreshold}
                    onChange={handleFormChange}
                    placeholder="e.g. 10 — triggers Low Stock warning"
                    error={formErrors.minThreshold}
                  />
                </Field>

                {/* Price */}
                <Field label="Price (₱)" required error={formErrors.price}>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    error={formErrors.price}
                  />
                </Field>
              </form>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                type="submit"
                form="inventory-form"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
              >
                <IoCheckmarkCircle className="text-base" />
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Item"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-5 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirm Modal ── */}
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
                  <p className="font-bold text-gray-800">Delete Item?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span> will be permanently removed from inventory.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
// Hooks: manage state, side effects, memoize callbacks, store DOM references
import { useState, useEffect, useCallback, useRef } from "react";
import {
  IoReceiptOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkDoneCircleOutline,
  IoFlameOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoChevronForwardOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoSwapVerticalOutline,
  IoLayersOutline,
  IoChevronDownOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import SkeletonLoader, { SkeletonTable } from "../../components/SkeletonLoader";

// Custom Filter Select component matching Feedbacks.jsx and portal design standard
function CustomFilterSelect({ value, onChange, options, icon: Icon, className = "" }) {
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

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#4a6741] text-gray-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm transition outline-none"
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="text-gray-400 text-sm flex-shrink-0" />}
          <span>{selectedOpt?.label}</span>
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
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

// Status configuration. Why: Consistent styling & labels across all status states
const STATUS_CFG = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    icon: <IoTimeOutline />,
    ring: "ring-amber-400",
    btn: "border-2 border-amber-400 text-amber-600 hover:bg-amber-50",
    btnActive: "bg-amber-400 text-white border-2 border-amber-400",
  },
  preparing: {
    label: "Preparing",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
    icon: <IoFlameOutline />,
    ring: "ring-blue-400",
    btn: "border-2 border-blue-400 text-blue-600 hover:bg-blue-50",
    btnActive: "bg-blue-400 text-white border-2 border-blue-400",
  },
  ready: {
    label: "Ready",
    badge: "bg-[#d7ecc8] text-[#4a6741] border border-[#b5d99c]",
    dot: "bg-[#4a6741]",
    icon: <IoCheckmarkCircleOutline />,
    ring: "ring-[#4a6741]",
    btn: "border-2 border-[#4a6741] text-[#4a6741] hover:bg-[#f0f7ec]",
    btnActive: "bg-[#4a6741] text-white border-2 border-[#4a6741]",
  },
  completed: {
    label: "Completed",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
    icon: <IoCheckmarkDoneCircleOutline />,
    ring: "ring-gray-400",
    btn: "border-2 border-gray-300 text-gray-500 hover:bg-gray-50",
    btnActive: "bg-gray-400 text-white border-2 border-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-600 border border-red-200",
    dot: "bg-red-400",
    icon: <IoAlertCircleOutline />,
    ring: "ring-red-400",
    btn: "border-2 border-red-300 text-red-500 hover:bg-red-50",
    btnActive: "bg-red-400 text-white border-2 border-red-400",
  },
};

// Filter options. Why: Let users view orders by status
const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

// Order workflow steps. Why: Define allowed status transitions
const STATUS_SEQUENCE = ["pending", "preparing", "ready", "completed"];

// Format time to HH:MM:SS
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

// Modal to show order details & update status
function OrderModal({ order, onClose, onStatusChange, updating }) {
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#4a6741] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-extrabold text-lg">Order Details</p>
            <p className="text-white/70 text-xs font-mono">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <IoCloseOutline className="text-white text-lg" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6 max-h-[80vh] overflow-y-auto">
          {/* Student */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Student</p>
            <p className="font-bold text-gray-800 text-base">{order.studentName}</p>
            <p className="text-sm text-gray-500 font-mono">{order.schoolId}</p>
          </div>

          {/* Items */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Items</p>
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-700">₱{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-[#d7ecc8] rounded-xl px-4 py-3.5 mb-5">
            <div className="flex justify-between items-center">
              <p className="font-extrabold text-[#4a6741] text-base">Total</p>
              <p className="font-extrabold text-[#4a6741] text-xl">₱{order.total}</p>
            </div>
            <p className="text-xs text-[#4a6741]/60 mt-0.5">Payment: cash</p>
          </div>

          {/* Update Status */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
            {(() => {
              const currentIdx = STATUS_SEQUENCE.indexOf(order.status);
              const nextStatus = STATUS_SEQUENCE[currentIdx + 1];
              const nextCfg = nextStatus ? STATUS_CFG[nextStatus] : null;
              const isDone = order.status === "completed" || order.status === "cancelled";
              return (
                <div className="flex flex-col gap-2.5">
                  {/* Progress bar */}
                  <div className="flex items-center gap-1.5 mb-1">
                    {STATUS_SEQUENCE.map((s, i) => (
                      <div key={s} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`h-1.5 w-full rounded-full transition-all ${i <= currentIdx ? "bg-[#4a6741]" : "bg-gray-200"
                          }`} />
                        <span className={`text-[9px] font-semibold uppercase tracking-wide ${i <= currentIdx ? "text-[#4a6741]" : "text-gray-400"
                          }`}>{STATUS_CFG[s].label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Advance button */}
                  {nextCfg && !isDone ? (
                    <button
                      disabled={updating}
                      onClick={() => onStatusChange(order._id, nextStatus)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold bg-[#4a6741] hover:bg-[#3a5333] text-white transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                      {updating ? "Updating…" : (
                        <>
                          <span className="text-base">{nextCfg.icon}</span>
                          Mark as {nextCfg.label}
                          <IoArrowForwardOutline className="text-base" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold ${order.status === "cancelled" ? "bg-red-100 text-red-500" : "bg-[#d7ecc8] text-[#4a6741]"
                      }`}>
                      <span className="text-base">{STATUS_CFG[order.status]?.icon}</span>
                      {order.status === "cancelled" ? "Order Cancelled" : "Order Completed"}
                    </div>
                  )}

                  {/* Cancel button */}
                  {!isDone && (
                    <button
                      disabled={updating}
                      onClick={() => onStatusChange(order._id, "cancelled")}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 border-red-300 text-red-500 hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <IoAlertCircleOutline className="text-base" />
                      Cancel Order
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal for confirming bulk status update operations
function BulkConfirmModal({ config, onClose, onConfirm, updating }) {
  if (!config) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm my-auto p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#d7ecc8] text-[#4a6741] flex items-center justify-center text-2xl font-bold">
            <IoLayersOutline />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-800 text-lg">{config.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{config.description}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            disabled={updating}
            onClick={onConfirm}
            className="flex-1 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-bold py-3 rounded-xl transition shadow-sm disabled:opacity-60"
          >
            {updating ? "Updating..." : "Yes, Confirm"}
          </button>
          <button
            disabled={updating}
            onClick={onClose}
            className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-medium py-3 rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Main orders dashboard component
export default function Orders() {
  // Main data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Selection state for multi-select checkboxes
  const [selectedIds, setSelectedIds] = useState([]);

  // Filter & search & sort states
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'yesterday', 'week'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'total-desc', 'total-asc'
  const searchTimeout = useRef(null);

  // Bulk confirm modal state
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Calculate order counts by status
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  // ── Fetch Orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (searchVal = search, filterVal = activeFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchVal) params.set("search", searchVal);
      if (filterVal !== "all") params.set("status", filterVal);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { fetchOrders("", "all"); }, []);

  // Search with debounce
  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchOrders(val, activeFilter), 350);
  }

  // Update filter & fetch
  function handleFilterChange(key) {
    setActiveFilter(key);
    setSelectedIds([]);
    fetchOrders(search, key);
  }

  // Single order status update
  async function handleStatusChange(orderId, newStatus) {
    setUpdating(true);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      const updated = res.data.order;
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      if (selectedOrder?._id === updated._id) setSelectedOrder(updated);
      showToast(`Order updated to ${newStatus}`);
    } catch {
      showToast("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  // Bulk status update API call
  async function handleBulkStatusChange(targetStatus, fromStatus = null, customIds = null) {
    setUpdating(true);
    try {
      const payload = { targetStatus };
      if (customIds && customIds.length > 0) {
        payload.orderIds = customIds;
      } else if (fromStatus) {
        payload.fromStatus = fromStatus;
      }

      const res = await api.patch("/orders/bulk-status", payload);
      showToast(res.data.message || `Updated ${res.data.updatedCount} order(s)`);
      setSelectedIds([]);
      setBulkConfirm(null);
      fetchOrders(search, activeFilter);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed bulk update");
    } finally {
      setUpdating(false);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  // Filtered & Sorted orders list
  const visible = orders.filter((o) => {
    if (dateFilter === "today") {
      const todayStr = new Date().toDateString();
      return new Date(o.createdAt).toDateString() === todayStr;
    }
    if (dateFilter === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return new Date(o.createdAt).toDateString() === y.toDateString();
    }
    if (dateFilter === "week") {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return new Date(o.createdAt) >= weekAgo;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "total-desc") return b.total - a.total;
    if (sortBy === "total-asc") return a.total - b.total;
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });

  // Checkbox helpers
  const allVisibleSelected = visible.length > 0 && visible.every((o) => selectedIds.includes(o._id));
  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visible.map((o) => o._id));
    }
  }

  function toggleSelectOrder(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <AdminLayout breadcrumb="Orders">
      <div className="space-y-6">

        {/* Toast alert popup */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#4a6741] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
            <IoCheckmarkCircle className="text-xl" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Page header with title & refresh button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
              <IoReceiptOutline className="text-3xl" />
              Order Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Monitor and batch manage all student food orders
            </p>
          </div>
          <button
            onClick={() => fetchOrders(search, activeFilter)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm self-start sm:self-auto"
          >
            <IoRefreshOutline className="text-base" />
            Refresh
          </button>
        </div>

        {/* Summary cards showing order counts by status */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 lg:col-span-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-extrabold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-3xl font-extrabold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Preparing</p>
            <p className="text-3xl font-extrabold text-blue-600">{stats.preparing}</p>
          </div>
          <div className="bg-[#f0f7ec] rounded-2xl border border-[#d7ecc8] shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-[#4a6741] uppercase tracking-wider mb-1">Ready</p>
            <p className="text-3xl font-extrabold text-[#4a6741]">{stats.ready}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-extrabold text-gray-500">{stats.completed}</p>
          </div>
        </div>

        {/* Quick Bulk Stage Action Buttons */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IoLayersOutline className="text-[#4a6741] text-lg" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quick Batch Actions:</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Prepare All Pending */}
            {stats.pending > 0 && (
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: "Prepare All Pending Orders?",
                    description: `This will mark all ${stats.pending} pending order(s) as "Preparing" immediately.`,
                    onConfirm: () => handleBulkStatusChange("preparing", "pending"),
                  })
                }
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <IoFlameOutline className="text-sm" />
                Prepare All Pending ({stats.pending})
              </button>
            )}

            {/* Mark All Ready */}
            {stats.preparing > 0 && (
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: "Mark All Preparing Orders as Ready?",
                    description: `This will mark all ${stats.preparing} preparing order(s) as "Ready" for pickup.`,
                    onConfirm: () => handleBulkStatusChange("ready", "preparing"),
                  })
                }
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <IoCheckmarkCircleOutline className="text-sm" />
                Mark All Ready ({stats.preparing})
              </button>
            )}

            {/* Complete All Ready */}
            {stats.ready > 0 && (
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: "Complete All Ready Orders?",
                    description: `This will complete all ${stats.ready} ready order(s) immediately.`,
                    onConfirm: () => handleBulkStatusChange("completed", "ready"),
                  })
                }
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#d7ecc8] hover:bg-[#c4e3b1] text-[#4a6741] transition flex items-center gap-1.5 shadow-sm"
              >
                <IoCheckmarkDoneCircleOutline className="text-sm" />
                Complete All Ready ({stats.ready})
              </button>
            )}

            {/* Complete All Active (Pending + Preparing + Ready) */}
            {(stats.pending > 0 || stats.preparing > 0 || stats.ready > 0) && (
              <button
                onClick={() => {
                  const activeCount = stats.pending + stats.preparing + stats.ready;
                  const activeIds = orders
                    .filter((o) => ["pending", "preparing", "ready"].includes(o.status))
                    .map((o) => o._id);
                  setBulkConfirm({
                    title: "Complete ALL Active Orders?",
                    description: `This will complete all ${activeCount} active orders across all stages at once.`,
                    onConfirm: () => handleBulkStatusChange("completed", null, activeIds),
                  });
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#4a6741] hover:bg-[#3a5333] text-white transition flex items-center gap-1.5 shadow-sm"
              >
                <IoCheckmarkDoneCircleOutline className="text-sm" />
                Complete All Active ({stats.pending + stats.preparing + stats.ready})
              </button>
            )}

            {stats.pending === 0 && stats.preparing === 0 && stats.ready === 0 && (
              <span className="text-xs text-gray-400 font-medium italic">No active orders pending action</span>
            )}
          </div>
        </div>

        {/* Filter bar: Search, Date Filter, Sort Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search input with debounce */}
          <div className="relative flex-1 max-w-md">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] bg-gray-50 transition"
              placeholder="Search by order ID, student name, or ID..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Filter Dropdown */}
            <CustomFilterSelect
              value={dateFilter}
              onChange={setDateFilter}
              icon={IoCalendarOutline}
              options={[
                { value: "all", label: "All Dates" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "week", label: "Last 7 Days" },
              ]}
            />

            {/* Sort Order Dropdown */}
            <CustomFilterSelect
              value={sortBy}
              onChange={setSortBy}
              icon={IoSwapVerticalOutline}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "total-desc", label: "Total: High to Low" },
                { value: "total-asc", label: "Total: Low to High" },
              ]}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition ${activeFilter === tab.key
                ? "bg-[#4a6741] text-white border-[#4a6741]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#4a6741] hover:text-[#4a6741]"
                }`}
            >
              {tab.label}
              {tab.key !== "all" &&
                orders.filter((o) => o.status === tab.key).length > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold opacity-80">
                    {orders.filter((o) => o.status === tab.key).length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Floating Bulk Selection Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#4a6741] text-white rounded-2xl px-5 py-3.5 shadow-xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">
                {selectedIds.length} Selected
              </span>
              <span className="text-xs text-white/80 hidden sm:inline">Choose action for selected orders:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: `Mark ${selectedIds.length} Order(s) as Preparing?`,
                    description: `Selected orders will be updated to "Preparing".`,
                    onConfirm: () => handleBulkStatusChange("preparing", null, selectedIds),
                  })
                }
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs rounded-xl transition"
              >
                Mark Preparing
              </button>
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: `Mark ${selectedIds.length} Order(s) as Ready?`,
                    description: `Selected orders will be updated to "Ready".`,
                    onConfirm: () => handleBulkStatusChange("ready", null, selectedIds),
                  })
                }
                className="px-3 py-1.5 bg-blue-400 hover:bg-blue-500 text-blue-950 font-bold text-xs rounded-xl transition"
              >
                Mark Ready
              </button>
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: `Complete ${selectedIds.length} Order(s)?`,
                    description: `Selected orders will be completed immediately.`,
                    onConfirm: () => handleBulkStatusChange("completed", null, selectedIds),
                  })
                }
                className="px-3 py-1.5 bg-white text-[#4a6741] hover:bg-gray-100 font-bold text-xs rounded-xl transition"
              >
                Complete Selected
              </button>
              <button
                onClick={() =>
                  setBulkConfirm({
                    title: `Cancel ${selectedIds.length} Order(s)?`,
                    description: `Selected orders will be marked as "Cancelled".`,
                    onConfirm: () => handleBulkStatusChange("cancelled", null, selectedIds),
                  })
                }
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition"
              >
                Cancel Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 text-xs text-white/70 hover:text-white underline ml-1"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_120px_1fr_80px_90px_120px_100px_56px] gap-x-4 px-5 py-3 bg-gray-50 border-b border-gray-100 items-center text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-[#4a6741] focus:ring-[#4a6741] cursor-pointer"
              title="Select / Deselect All Visible"
            />
            {["Order ID", "Student", "Items", "Total", "Status", "Time", ""].map((h) => (
              <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</p>
            ))}
          </div>

          {/* Table rows */}
          {loading ? (
            <div className="p-4">
              <SkeletonTable rows={6} columns={7} showHeader={false} />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <IoReceiptOutline className="text-4xl text-gray-300" />
              <p className="text-sm font-semibold">No orders found</p>
              <p className="text-xs">Try a different search or filter criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {visible.map((order) => {
                const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;
                const isSelected = selectedIds.includes(order._id);
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`grid grid-cols-[40px_120px_1fr_80px_90px_120px_100px_56px] gap-x-4 px-5 py-3.5 cursor-pointer transition items-center group ${isSelected ? "bg-[#f4f9f1]" : "hover:bg-gray-50"
                      }`}
                  >
                    {/* Select Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order._id)}
                        className="w-4 h-4 rounded text-[#4a6741] focus:ring-[#4a6741] cursor-pointer"
                      />
                    </div>

                    {/* Order ID */}
                    <p className="font-mono text-xs font-semibold text-[#4a6741] tracking-wide">{order.orderNumber}</p>

                    {/* Student */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{order.studentName}</p>
                      <p className="text-xs text-gray-400 font-mono">{order.schoolId}</p>
                    </div>

                    {/* Items count */}
                    <p className="text-xs text-gray-500">
                      {order.items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      <span className="text-gray-400 text-xs">item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}</span>
                    </p>

                    {/* Total */}
                    <p className="text-sm font-bold text-gray-800">₱{order.total}</p>

                    {/* Status badge */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Time */}
                    <p className="text-xs text-gray-400 font-mono">{formatTime(order.createdAt)}</p>

                    {/* Arrow */}
                    <div className="flex justify-end">
                      <IoChevronForwardOutline className="text-gray-300 group-hover:text-[#4a6741] transition text-base" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Count footer */}
          {!loading && visible.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-700">{visible.length}</span> of <span className="font-semibold text-gray-700">{orders.length}</span> order{orders.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Render order detail modal when order is selected */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}

      {/* Bulk Confirm Modal */}
      {bulkConfirm && (
        <BulkConfirmModal
          config={bulkConfirm}
          onClose={() => setBulkConfirm(null)}
          onConfirm={bulkConfirm.onConfirm}
          updating={updating}
        />
      )}
    </AdminLayout>
  );
}

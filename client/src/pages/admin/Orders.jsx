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
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";

// ─── Status config ────────────────────────────────────────────────────────────
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

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_SEQUENCE = ["pending", "preparing", "ready", "completed"];

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange, updating }) {
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
                        <div className={`h-1.5 w-full rounded-full transition-all ${
                          i <= currentIdx ? "bg-[#4a6741]" : "bg-gray-200"
                        }`} />
                        <span className={`text-[9px] font-semibold uppercase tracking-wide ${
                          i <= currentIdx ? "text-[#4a6741]" : "text-gray-400"
                        }`}>{STATUS_CFG[s].label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Advance button */}
                  {nextCfg && !isDone ? (
                    <button
                      disabled={updating}
                      onClick={() => onStatusChange(order._id, nextStatus)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold bg-[#4a6741] hover:bg-[#3a5333] text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <div className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold ${
                      order.status === "cancelled" ? "bg-red-100 text-red-500" : "bg-[#d7ecc8] text-[#4a6741]"
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const searchTimeout = useRef(null);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
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

  useEffect(() => { fetchOrders("", "all"); }, []);

  // Debounced search
  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchOrders(val, activeFilter), 350);
  }

  function handleFilterChange(key) {
    setActiveFilter(key);
    fetchOrders(search, key);
  }

  // ── Status update ──────────────────────────────────────────────────────────
  async function handleStatusChange(orderId, newStatus) {
    setUpdating(true);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      const updated = res.data.order;
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      if (selectedOrder?._id === updated._id) setSelectedOrder(updated);
    } catch {
      // silently ignore — could add toast here
    } finally {
      setUpdating(false);
    }
  }

  // ── Filtered view ──────────────────────────────────────────────────────────
  const visible = orders;

  return (
    <AdminLayout breadcrumb="Orders">
      <div className="p-6 space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#4a6741]">Order Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Monitor and manage all student food orders</p>
          </div>
          <button
            onClick={() => fetchOrders(search, activeFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <IoRefreshOutline className="text-base" />
            Refresh
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 lg:col-span-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-extrabold text-gray-800">{stats.total}</p>
          </div>
          {/* Pending */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-3xl font-extrabold text-amber-600">{stats.pending}</p>
          </div>
          {/* Preparing */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Preparing</p>
            <p className="text-3xl font-extrabold text-blue-600">{stats.preparing}</p>
          </div>
          {/* Ready */}
          <div className="bg-[#f0f7ec] rounded-2xl border border-[#d7ecc8] shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-[#4a6741] uppercase tracking-wider mb-1">Ready</p>
            <p className="text-3xl font-extrabold text-[#4a6741]">{stats.ready}</p>
          </div>
          {/* Completed */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-extrabold text-gray-500">{stats.completed}</p>
          </div>
        </div>

        {/* ── Filters + Search ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] bg-gray-50 transition"
              placeholder="Search by order ID, student name, or ID..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          {/* Filter */}
          <IoFilterOutline className="text-gray-400 text-lg hidden sm:block flex-shrink-0" />
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                activeFilter === tab.key
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

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[120px_1fr_80px_90px_120px_100px_56px] gap-x-4 px-6 py-3 bg-[#f8faf8] border-b border-gray-100">
            {["Order ID", "Student", "Items", "Total", "Status", "Time", ""].map((h) => (
              <p key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <IoReceiptOutline className="text-5xl mb-3" />
              <p className="text-sm font-semibold">No orders found</p>
              <p className="text-xs mt-1">Try a different search or filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {visible.map((order) => {
                const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="grid grid-cols-[120px_1fr_80px_90px_120px_100px_56px] gap-x-4 px-6 py-4 hover:bg-[#f8faf8] cursor-pointer transition items-center group"
                  >
                    {/* Order ID */}
                    <p className="text-sm font-extrabold text-[#4a6741] font-mono tracking-wide">{order.orderNumber}</p>

                    {/* Student */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{order.studentName}</p>
                      <p className="text-xs text-gray-400 font-mono">{order.schoolId}</p>
                    </div>

                    {/* Items count */}
                    <p className="text-sm text-gray-600">
                      {order.items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      <span className="text-gray-400 text-xs">item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}</span>
                    </p>

                    {/* Total */}
                    <p className="text-sm font-bold text-gray-800">₱{order.total}</p>

                    {/* Status badge */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
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
        </div>

        {/* Row count */}
        {!loading && visible.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Showing {visible.length} order{visible.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}
    </AdminLayout>
  );
}

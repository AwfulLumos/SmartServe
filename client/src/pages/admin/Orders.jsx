import { useState, useEffect, useCallback, useRef } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";

import OrdersHeader from "../../components/admin/orders/OrdersHeader";
import OrdersStatsSummary from "../../components/admin/orders/OrdersStatsSummary";
import OrdersBatchActions from "../../components/admin/orders/OrdersBatchActions";
import OrdersFilterBar from "../../components/admin/orders/OrdersFilterBar";
import OrdersBulkSelectionBar from "../../components/admin/orders/OrdersBulkSelectionBar";
import OrdersTable from "../../components/admin/orders/OrdersTable";
import OrderModal from "../../components/admin/orders/OrderModal";
import BulkConfirmModal from "../../components/admin/orders/BulkConfirmModal";

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

        <OrdersHeader onRefresh={() => fetchOrders(search, activeFilter)} />

        <OrdersStatsSummary stats={stats} />

        <OrdersBatchActions
          stats={stats}
          orders={orders}
          setBulkConfirm={setBulkConfirm}
          handleBulkStatusChange={handleBulkStatusChange}
        />

        <OrdersFilterBar
          search={search}
          onSearchChange={handleSearchChange}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          orders={orders}
        />

        <OrdersBulkSelectionBar
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          setBulkConfirm={setBulkConfirm}
          handleBulkStatusChange={handleBulkStatusChange}
        />

        <OrdersTable
          visible={visible}
          orders={orders}
          loading={loading}
          selectedIds={selectedIds}
          allVisibleSelected={allVisibleSelected}
          toggleSelectAll={toggleSelectAll}
          toggleSelectOrder={toggleSelectOrder}
          setSelectedOrder={setSelectedOrder}
        />
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

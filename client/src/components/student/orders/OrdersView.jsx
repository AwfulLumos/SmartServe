import { useState, useEffect, useCallback } from "react";
import studentApi from "../../../utils/studentApi";
import { SkeletonList } from "../../SkeletonLoader";
import LiveOrderProgressTracker from "./LiveOrderProgressTracker";
import PastOrderDetail, { ORDER_STATUS_CFG } from "./PastOrderDetail";
import { IoRepeatOutline, IoChevronForwardOutline } from "react-icons/io5";

const ACTIVE_STATUSES = ["pending", "preparing", "ready"];

function formatOrderDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function OrdersView({ onReOrder, onSetUsual, usualOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detailOrder, setDetailOrder] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    studentApi
      .get("/orders/mine")
      .then((res) => {
        const fetchedOrders = Array.isArray(res.data?.orders)
          ? res.data.orders
          : Array.isArray(res.data)
          ? res.data
          : [];
        setOrders(fetchedOrders);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const activeOrders = safeOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = safeOrders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  const filtered =
    filter === "active" ? activeOrders : filter === "completed" ? pastOrders : safeOrders;

  const activeCount = activeOrders.length;

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 font-sans">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-gray-50">
        <h2 className="text-3xl font-extrabold text-[#4a6741]">My Orders</h2>
        <p className="text-sm text-gray-400 mt-1">
          {activeCount > 0
            ? `${activeCount} active order${activeCount !== 1 ? "s" : ""}`
            : "No active orders"}
        </p>
      </div>

      {/* Filter tabs — 3 equal columns */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`py-3 rounded-2xl text-sm font-bold transition ${
                filter === t.key
                  ? "bg-[#4a6741] text-white shadow-sm"
                  : "bg-white text-[#4a6741] border border-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-5">
          <SkeletonList count={4} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No orders found</div>
      ) : (
        <div className="px-5 flex flex-col gap-5">
          {/* ── Current Orders ── */}
          {(filter === "all" || filter === "active") && activeOrders.length > 0 && (
            <div>
              <p className="text-base font-extrabold text-[#4a6741] mb-3">Active Order Live Tracker</p>
              <div className="flex flex-col gap-3">
                {activeOrders.map((order) => (
                  <LiveOrderProgressTracker key={order._id} order={order} />
                ))}
              </div>
            </div>
          )}

          {/* ── Past Orders ── */}
          {(filter === "all" || filter === "completed") && pastOrders.length > 0 && (
            <div>
              <p className="text-base font-extrabold text-[#4a6741] mb-3">Past Orders</p>
              <div className="flex flex-col gap-3">
                {pastOrders.map((order) => {
                  const cfg = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.completed;
                  return (
                    <div
                      key={order._id}
                      onClick={() => setDetailOrder(order)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDetailOrder(order);
                        }
                      }}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 text-left w-full hover:border-[#4a6741]/30 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-gray-900 text-base">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatOrderDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {onReOrder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReOrder(order.items);
                              }}
                              className="px-3 py-1.5 bg-[#f0f7ec] hover:bg-[#d7ecc8] text-[#4a6741] font-bold text-xs rounded-xl flex items-center gap-1 transition"
                              title="Re-order these items"
                            >
                              <IoRepeatOutline className="text-sm" />
                              <span>Re-Order</span>
                            </button>
                          )}
                          <IoChevronForwardOutline className="text-gray-300 text-lg flex-shrink-0 ml-1" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}
                        >
                          <span className="text-sm">{cfg.icon}</span>
                          {cfg.label}
                        </span>
                        <span className="font-extrabold text-[#4a6741] text-base">₱{order.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail bottom sheet */}
      {detailOrder && (
        <PastOrderDetail
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onReOrder={onReOrder}
          onSetUsual={onSetUsual}
        />
      )}
    </div>
  );
}

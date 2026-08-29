import { IoReceiptOutline, IoChevronForwardOutline } from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";
import { STATUS_CFG, formatTime } from "./OrdersConstants";

export default function OrdersTable({
  visible = [],
  orders = [],
  loading,
  selectedIds = [],
  allVisibleSelected,
  toggleSelectAll,
  toggleSelectOrder,
  setSelectedOrder,
}) {
  return (
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
  );
}

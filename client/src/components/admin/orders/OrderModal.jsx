import { IoCloseOutline, IoArrowForwardOutline, IoAlertCircleOutline } from "react-icons/io5";
import { STATUS_CFG, STATUS_SEQUENCE } from "./OrdersConstants";

export default function OrderModal({ order, onClose, onStatusChange, updating }) {
  if (!order) return null;
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

import {
  IoTimeOutline,
  IoFlameOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkDoneCircleOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
  IoBookmarkOutline,
  IoRepeatOutline,
} from "react-icons/io5";

export const ORDER_STATUS_CFG = {
  pending: { label: "Pending", icon: <IoTimeOutline />, badge: "bg-amber-100 text-amber-700", border: "border-amber-300", isActive: true },
  preparing: { label: "Being Prepared", icon: <IoFlameOutline />, badge: "bg-blue-100 text-blue-700", border: "border-blue-300", isActive: true },
  ready: { label: "Ready for Pickup", icon: <IoCheckmarkCircleOutline />, badge: "bg-[#d7ecc8] text-[#4a6741]", border: "border-[#4a6741]", isActive: true },
  completed: { label: "Completed", icon: <IoCheckmarkDoneCircleOutline />, badge: "bg-[#d7ecc8] text-[#4a6741]", border: "border-gray-200", isActive: false },
  cancelled: { label: "Cancelled", icon: <IoAlertCircleOutline />, badge: "bg-red-100 text-red-600", border: "border-gray-200", isActive: false },
};

function formatOrderDateTime(dateStr) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  );
}

export default function PastOrderDetail({ order, onClose, onReOrder, onSetUsual }) {
  const cfg = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.completed;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 font-sans">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] overflow-hidden shadow-2xl">
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
          <div>
            <p className="font-extrabold text-gray-800 text-base">{order.orderNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatOrderDateTime(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <IoCloseOutline className="text-gray-500 text-lg" />
          </button>
        </div>
        <div className="px-5 pt-4 pb-6 overflow-y-auto max-h-[60vh]">
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              <span className="text-sm">{cfg.icon}</span>
              {cfg.label}
            </span>
            {onSetUsual && (
              <button
                onClick={() => onSetUsual(order)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#4a6741] bg-[#f0f7ec] px-3 py-1.5 rounded-full hover:bg-[#d7ecc8] transition"
              >
                <IoBookmarkOutline className="text-sm" />
                <span>Set as My Usual</span>
              </button>
            )}
          </div>
          {/* Items */}
          <div className="flex flex-col gap-2 mb-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-700">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-semibold text-gray-800">₱{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center mb-5">
            <span className="font-extrabold text-[#4a6741] text-sm">Total</span>
            <span className="font-extrabold text-[#4a6741] text-lg">₱{order.total}</span>
          </div>

          {onReOrder && (
            <button
              onClick={() => {
                onClose();
                onReOrder(order.items);
              }}
              className="w-full py-3.5 bg-[#4a6741] hover:bg-[#3a5333] active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition"
            >
              <IoRepeatOutline className="text-lg" />
              <span>Re-Order These Items</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import {
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoFlameOutline,
  IoCheckmarkDoneCircleOutline,
} from "react-icons/io5";

export function getLiveOrderEtaInfo(status) {
  if (status === "pending") {
    return {
      step: 1,
      progress: 33,
      etaText: "~8–10 mins",
      statusTitle: "Order Received",
      statusMessage: "Canteen staff has received your order & is queueing preparation.",
      badgeBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300",
    };
  }
  if (status === "preparing") {
    return {
      step: 2,
      progress: 66,
      etaText: "~3–5 mins",
      statusTitle: "Cooking in Kitchen",
      statusMessage: "Your meal is freshly being prepared by the canteen kitchen staff!",
      badgeBg: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300",
    };
  }
  if (status === "ready") {
    return {
      step: 3,
      progress: 100,
      etaText: "READY NOW!",
      statusTitle: "Ready for Pickup!",
      statusMessage: "Head to the canteen counter & show your QR code to claim your food!",
      badgeBg: "bg-[#d7ecc8] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] border-[#4a6741]",
    };
  }
  return {
    step: 3,
    progress: 100,
    etaText: "Completed",
    statusTitle: "Order Completed",
    statusMessage: "Thank you! Enjoy your meal.",
    badgeBg: "bg-gray-100 text-gray-700 border-gray-200",
  };
}

function itemSummary(items) {
  if (!items || items.length === 0) return "Order";
  const names = items.slice(0, 2).map((i) => i.name);
  return names.join(" + ") + (items.length > 2 ? ` +${items.length - 2} more` : "");
}

export default function LiveOrderProgressTracker({ order, onTrackClick }) {
  const etaInfo = getLiveOrderEtaInfo(order.status);
  const itemsText = itemSummary(order.items);

  return (
    <div
      onClick={onTrackClick}
      className="bg-white dark:bg-[#1a2416] rounded-3xl border-2 border-[#4a6741]/40 dark:border-[#8ebd7e]/40 shadow-md p-5 relative overflow-hidden transition hover:border-[#4a6741] cursor-pointer font-sans"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4a6741] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4a6741]"></span>
          </span>
          <p className="font-extrabold text-gray-900 dark:text-white text-base font-mono">{order.orderNumber}</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-xs bg-[#d7ecc8] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e]">
          <IoTimeOutline className="text-sm animate-pulse" />
          <span>{etaInfo.etaText}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 truncate">
        {itemsText} • <span className="font-bold text-[#4a6741] dark:text-[#8ebd7e]">₱{order.total}</span>
      </p>

      {/* Stepper Progress Box */}
      <div className="bg-gray-50 dark:bg-[#24301f] rounded-2xl p-3.5 border border-gray-100 dark:border-[#2b3924] mb-3">
        <div className="flex justify-between items-center text-xs font-extrabold text-gray-700 dark:text-gray-200 mb-2">
          <span className="flex items-center gap-1">
            {order.status === "ready" ? (
              <IoCheckmarkCircleOutline className="text-lg text-[#4a6741] animate-bounce" />
            ) : order.status === "preparing" ? (
              <IoFlameOutline className="text-lg text-blue-500 animate-pulse" />
            ) : (
              <IoTimeOutline className="text-lg text-amber-500 animate-spin" />
            )}
            {etaInfo.statusTitle}
          </span>
          <span className="text-[#4a6741] dark:text-[#8ebd7e] font-mono">{etaInfo.progress}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="relative w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-blue-500 to-[#4a6741] rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${etaInfo.progress}%` }}
          />
        </div>

        {/* Stepper Icons */}
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-400">
          <div className={`flex flex-col items-center gap-1 ${etaInfo.step >= 1 ? "text-[#4a6741] dark:text-[#8ebd7e]" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${etaInfo.step >= 1 ? "bg-[#d7ecc8] text-[#4a6741]" : "bg-gray-200 text-gray-400"}`}>
              <IoTimeOutline />
            </div>
            <span>Received</span>
          </div>

          <div className={`flex flex-col items-center gap-1 ${etaInfo.step >= 2 ? "text-blue-600 dark:text-blue-400" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${etaInfo.step >= 2 ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"}`}>
              <IoFlameOutline />
            </div>
            <span>Cooking</span>
          </div>

          <div className={`flex flex-col items-center gap-1 ${etaInfo.step >= 3 ? "text-[#4a6741] dark:text-[#8ebd7e]" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${etaInfo.step >= 3 ? "bg-[#d7ecc8] text-[#4a6741] animate-pulse" : "bg-gray-200 text-gray-400"}`}>
              <IoCheckmarkDoneCircleOutline />
            </div>
            <span>Pickup Ready</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 italic text-center">
        {etaInfo.statusMessage}
      </p>
    </div>
  );
}

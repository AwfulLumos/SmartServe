import {
  IoBagOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoFlameOutline,
  IoAlertOutline,
  IoPeopleOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from "react-icons/io5";

const peso = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PctBadge({ pct }) {
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${up
        ? "bg-[#e8f5e2] text-[#4a6741] dark:bg-[#24301f] dark:text-[#8ebd7e]"
        : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
        }`}
    >
      {up ? <IoArrowUpOutline className="text-[10px]" /> : <IoArrowDownOutline className="text-[10px]" />}
      {Math.abs(pct)}%
    </span>
  );
}

// Mini decorative sparkline SVG for visual momentum
function MiniSparkline({ color = "#4a6741", trend = "up" }) {
  const path =
    trend === "up"
      ? "M0,22 Q15,18 30,20 T60,10 T90,6"
      : trend === "alert"
        ? "M0,18 Q15,8 30,22 T60,10 T90,14"
        : "M0,10 Q15,14 30,12 T60,20 T90,22";

  return (
    <div className="w-16 h-7 opacity-70 group-hover:opacity-100 transition-opacity">
      <svg viewBox="0 0 90 28" className="w-full h-full overflow-visible">
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function AdminStatCards({ stats = {}, loading }) {
  const s = stats;

  const statCards = [
    {
      label: "Transactions Today",
      value: loading ? "—" : s.transactionsToday ?? 0,
      icon: <IoBagOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-2xl" />,
      iconBg: "bg-[#e8f5e2] dark:bg-[#24301f]",
      accentBorder: "group-hover:border-[#4a6741]/40",
      pct: s.transactionsPct ?? 0,
      note: "vs yesterday",
      sparkColor: "#4a6741",
      sparkTrend: (s.transactionsPct ?? 0) >= 0 ? "up" : "down",
    },
    {
      label: "Revenue Today",
      value: loading ? "—" : peso(s.revenueToday),
      icon: <IoCashOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-2xl" />,
      iconBg: "bg-[#dff0d6] dark:bg-[#24301f]",
      accentBorder: "group-hover:border-[#4a6741]/40",
      pct: s.revenuePct ?? 0,
      note: "vs yesterday",
      sparkColor: "#4a6741",
      sparkTrend: (s.revenuePct ?? 0) >= 0 ? "up" : "down",
    },
    {
      label: "Items Sold",
      value: loading ? "—" : s.itemsSoldToday ?? 0,
      icon: <IoTrendingUpOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-2xl" />,
      iconBg: "bg-[#e8f5e2] dark:bg-[#24301f]",
      accentBorder: "group-hover:border-[#4a6741]/40",
      pct: s.itemsSoldPct ?? 0,
      note: "vs yesterday",
      sparkColor: "#4a6741",
      sparkTrend: (s.itemsSoldPct ?? 0) >= 0 ? "up" : "down",
    },
    {
      label: "Active Orders",
      value: loading ? "—" : s.activeOrders ?? 0,
      valueColor: (s.activeOrders ?? 0) > 0 ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-white",
      icon: <IoFlameOutline className={`text-2xl ${(s.activeOrders ?? 0) > 0 ? "text-blue-500" : "text-[#4a6741] dark:text-[#8ebd7e]"}`} />,
      iconBg: (s.activeOrders ?? 0) > 0 ? "bg-blue-50 dark:bg-blue-950/40" : "bg-[#e8f5e2] dark:bg-[#24301f]",
      accentBorder: (s.activeOrders ?? 0) > 0 ? "group-hover:border-blue-300" : "group-hover:border-[#4a6741]/40",
      sub: s.pendingOrders > 0 ? `${s.pendingOrders} pending queue` : "All orders fulfilled",
      subBadge: s.pendingOrders > 0 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : "bg-gray-100 text-gray-500 dark:bg-[#24301f] dark:text-gray-400",
      sparkColor: (s.activeOrders ?? 0) > 0 ? "#3b82f6" : "#4a6741",
      sparkTrend: "up",
    },
    {
      label: "Low Stock Items",
      value: loading ? "—" : (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0),
      valueColor: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-white",
      icon: <IoAlertOutline className={`text-2xl ${(s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "text-red-500" : "text-[#4a6741] dark:text-[#8ebd7e]"}`} />,
      iconBg: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "bg-red-50 dark:bg-red-950/40" : "bg-[#e8f5e2] dark:bg-[#24301f]",
      accentBorder: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "group-hover:border-red-300" : "group-hover:border-[#4a6741]/40",
      sub: s.outOfStockCount > 0 ? `${s.outOfStockCount} out of stock` : "Inventory healthy",
      subBadge: s.outOfStockCount > 0 ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      sparkColor: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "#ef4444" : "#4a6741",
      sparkTrend: "alert",
    },
    {
      label: "Active Students",
      value: loading ? "—" : s.totalStudents ?? 0,
      icon: <IoPeopleOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-2xl" />,
      iconBg: "bg-[#e8f5e2] dark:bg-[#24301f]",
      accentBorder: "group-hover:border-[#4a6741]/40",
      sub: "Enrolled patrons",
      subBadge: "bg-gray-100 text-gray-600 dark:bg-[#24301f] dark:text-gray-400",
      sparkColor: "#4a6741",
      sparkTrend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4">
      {statCards.map((card) => (
        <div
          key={card.label}
          className={`group bg-white dark:bg-[#1a2416] rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 dark:border-[#2b3924] flex flex-col justify-between gap-3 sm:gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.accentBorder}`}
        >
          {/* Top row: Label & Icon */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 truncate">
                {card.label}
              </p>
              <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
                <p className={`text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight truncate ${card.valueColor ?? "text-gray-800 dark:text-white"}`}>
                  {card.value}
                </p>
              </div>
            </div>

            <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs text-base sm:text-2xl ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          {/* Bottom row: Momentum Sparkline & Status/Pct Badge */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-[#24301f] gap-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {card.pct !== undefined ? (
                <>
                  <PctBadge pct={card.pct} />
                  <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate hidden min-[420px]:inline">
                    {card.note}
                  </span>
                </>
              ) : (
                <span className={`text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full truncate ${card.subBadge}`}>
                  {card.sub}
                </span>
              )}
            </div>

            <div className="hidden min-[420px]:block flex-shrink-0">
              <MiniSparkline color={card.sparkColor} trend={card.sparkTrend} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

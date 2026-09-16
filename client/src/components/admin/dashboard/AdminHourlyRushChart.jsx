import { useState, useMemo } from "react";
import {
  IoFlameOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoTrendingUpOutline,
  IoCafeOutline,
} from "react-icons/io5";

const peso = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function AdminHourlyRushChart({ hourlyData = [], loading }) {
  const [metric, setMetric] = useState("orders"); // "orders" | "revenue"
  const [hoveredHour, setHoveredHour] = useState(null);

  const currentHour = new Date().getHours();

  // Process and compute stats
  const { maxVal, peakHour, totalOrders, avgPerHour } = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) {
      return { maxVal: 1, peakHour: null, totalOrders: 0, totalRevenue: 0, avgPerHour: 0 };
    }

    let maxO = 0;
    let maxR = 0;
    let tO = 0;
    let tR = 0;
    let peak = null;

    hourlyData.forEach((item) => {
      tO += item.orders || 0;
      tR += item.revenue || 0;
      if (item.orders > maxO) {
        maxO = item.orders;
      }
      if (item.revenue > maxR) {
        maxR = item.revenue;
      }
      if (!peak || item.orders > peak.orders) {
        peak = item;
      }
    });

    const activeHoursCount = hourlyData.filter((h) => h.orders > 0).length || 1;
    const avg = (tO / activeHoursCount).toFixed(1);

    return {
      maxVal: metric === "orders" ? Math.max(maxO, 5) : Math.max(maxR, 500),
      peakHour: peak && peak.orders > 0 ? peak : null,
      totalOrders: tO,
      totalRevenue: tR,
      avgPerHour: avg,
    };
  }, [hourlyData, metric]);

  const getShiftBadge = (hour) => {
    if (hour >= 7 && hour < 10) return { label: "Breakfast Shift", color: "text-amber-600 bg-amber-50" };
    if (hour >= 11 && hour <= 13) return { label: "Lunch Rush", color: "text-red-600 bg-red-50" };
    if (hour >= 14 && hour <= 16) return { label: "Snack Shift", color: "text-emerald-700 bg-emerald-50" };
    return { label: "Service Shift", color: "text-gray-500 bg-gray-50" };
  };

  return (
    <div className="bg-white dark:bg-[#1a2416] rounded-2xl border border-gray-100 dark:border-[#2b3924] shadow-sm p-5 flex flex-col justify-between transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-[#2b3924]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#e8f5e2] dark:bg-[#24301f] flex items-center justify-center text-[#4a6741] dark:text-[#8ebd7e]">
            <IoStatsChartOutline className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Cafeteria Rush & Activity</h3>
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Today
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-400">
              Hourly volume trends across breakfast, lunch, and snack shifts
            </p>
          </div>
        </div>

        {/* Metric Selector Toggle */}
        <div className="inline-flex rounded-xl bg-gray-100 dark:bg-[#24301f] p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric("orders")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${metric === "orders"
              ? "bg-white dark:bg-[#1a2416] text-[#4a6741] dark:text-[#8ebd7e] shadow-xs"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
              }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setMetric("revenue")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${metric === "revenue"
              ? "bg-white dark:bg-[#1a2416] text-[#4a6741] dark:text-[#8ebd7e] shadow-xs"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
              }`}
          >
            Revenue (₱)
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="bg-gray-50 dark:bg-[#24301f]/60 rounded-xl p-3 border border-gray-100/80 dark:border-[#2b3924]">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-400 flex items-center gap-1">
            <IoFlameOutline className="text-orange-500" /> Peak Hour
          </span>
          <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
            {peakHour ? `${peakHour.label} (${peakHour.orders} orders)` : "—"}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-[#24301f]/60 rounded-xl p-3 border border-gray-100/80 dark:border-[#2b3924]">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-400 flex items-center gap-1">
            <IoTrendingUpOutline className="text-[#4a6741]" /> Avg Velocity
          </span>
          <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
            {avgPerHour} orders / hr
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-[#24301f]/60 rounded-xl p-3 border border-gray-100/80 dark:border-[#2b3924]">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-400 flex items-center gap-1">
            <IoTimeOutline className="text-blue-500" /> Current Shift
          </span>
          <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5 truncate">
            {getShiftBadge(currentHour).label}
          </p>
        </div>
      </div>

      {/* Chart Visualizer */}
      <div className="mt-1">
        {loading ? (
          <div className="h-44 flex items-center justify-center text-gray-400 text-xs animate-pulse">
            Loading cafeteria telemetry...
          </div>
        ) : !hourlyData || hourlyData.length === 0 || totalOrders === 0 ? (
          <div className="h-44 rounded-xl border border-dashed border-gray-200 dark:border-[#2b3924] flex flex-col items-center justify-center text-gray-400 text-center px-4">
            <IoCafeOutline className="text-3xl text-gray-300 dark:text-gray-600 mb-1" />
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">No transactions recorded yet today</p>
            <p className="text-[11px] text-gray-400">Activity will automatically track as orders flow through the register.</p>
          </div>
        ) : (
          <div className="relative pt-6">
            {/* Bars container */}
            <div className="h-40 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
              {hourlyData.map((item) => {
                const val = metric === "orders" ? item.orders : item.revenue;
                const heightPct = Math.max(8, Math.min(100, Math.round((val / maxVal) * 100)));
                const isCurrent = item.hour === currentHour;
                const isPeak = peakHour && item.hour === peakHour.hour && item.orders > 0;
                const isHovered = hoveredHour === item.hour;

                return (
                  <div
                    key={item.hour}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredHour(item.hour)}
                    onMouseLeave={() => setHoveredHour(null)}
                    onClick={() => setHoveredHour(hoveredHour === item.hour ? null : item.hour)}
                  >
                    {/* Tooltip on hover/tap */}
                    {isHovered && (
                      <div className="absolute -top-12 z-30 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap transition-transform scale-100 flex flex-col items-center">
                        <span>{item.label}: <b>{item.orders} orders</b></span>
                        <span className="text-[10px] opacity-80">{peso(item.revenue)}</span>
                        <div className="w-2 h-2 bg-gray-900 dark:bg-white rotate-45 -mb-1 mt-0.5" />
                      </div>
                    )}

                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${isPeak
                          ? "bg-gradient-to-t from-emerald-600 to-[#4a6741] dark:from-emerald-500 dark:to-[#5d8152] shadow-xs"
                          : isCurrent
                            ? "bg-[#5d8152] dark:bg-[#8ebd7e]"
                            : val > 0
                              ? "bg-[#e8f5e2] hover:bg-[#d7ecc8] dark:bg-[#24301f] dark:hover:bg-[#2e3e27]"
                              : "bg-gray-100 dark:bg-[#202b1b] opacity-60"
                          } ${isHovered ? "ring-2 ring-[#4a6741]/50 scale-105" : ""}`}
                      />
                    </div>

                    {/* Hour label */}
                    <span
                      className={`text-[8.5px] min-[400px]:text-[10px] mt-2 font-mono font-medium truncate ${isCurrent
                        ? "text-[#4a6741] dark:text-[#8ebd7e] font-bold"
                        : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                      {item.label.replace(" ", "")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Subtle Legend */}
            <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-[#2b3924]/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#4a6741]" /> Peak Rush
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#5d8152]" /> Current Hour
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#e8f5e2] dark:bg-[#24301f]" /> Active Orders
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

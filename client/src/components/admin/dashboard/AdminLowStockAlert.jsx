import {
  IoAlertOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoCubeOutline,
} from "react-icons/io5";

export default function AdminLowStockAlert({
  lowStockItems = [],
  outOfStockItems = [],
  lowStockCount = 0,
  outOfStockCount = 0,
  stockHealthPct = 100,
  totalInventoryCount = 0,
  navigate,
}) {
  const totalIssues = lowStockCount + outOfStockCount;
  const isHealthy = totalIssues === 0;

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-200 ${isHealthy
          ? "bg-gradient-to-r from-emerald-50/70 via-emerald-50/40 to-white dark:from-[#1a2916] dark:to-[#1a2416] border-emerald-200/70 dark:border-emerald-900/40 shadow-xs"
          : "bg-gradient-to-r from-red-50/80 via-amber-50/30 to-white dark:from-[#2e1c1c] dark:to-[#1a2416] border-red-200/80 dark:border-red-900/50 shadow-xs"
        }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Health Status & Bar */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${isHealthy
                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
              }`}
          >
            {isHealthy ? (
              <IoCheckmarkCircleOutline className="text-2xl" />
            ) : (
              <IoAlertOutline className="text-2xl animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-extrabold ${isHealthy
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-red-700 dark:text-red-300"
                  }`}
              >
                {isHealthy ? "Cafeteria Stock Health: 100% Optimal" : "Inventory Attention Required"}
              </h4>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isHealthy
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300"
                  }`}
              >
                {isHealthy ? "All Stocked" : `${totalIssues} Item${totalIssues > 1 ? "s" : ""} Impacted`}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isHealthy
                ? `All cafeteria ingredients and menu items have healthy inventory levels.`
                : `${outOfStockCount} item(s) completely depleted, ${lowStockCount} below minimum operating threshold.`}
            </p>
          </div>
        </div>

        {/* Right Side: Health Meter & Action Button */}
        <div className="flex items-center gap-4 self-end sm:self-auto flex-shrink-0">
          {/* Visual Health Gauge Pill */}
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-[11px] font-semibold text-gray-400">Stock Availability</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  style={{ width: `${stockHealthPct}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${stockHealthPct >= 90
                      ? "bg-emerald-500"
                      : stockHealthPct >= 70
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {stockHealthPct}%
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard/inventory")}
            className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer ${isHealthy
                ? "bg-white dark:bg-[#24301f] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#2e3e27] border border-emerald-200 dark:border-emerald-800"
                : "bg-red-600 hover:bg-red-700 active:scale-95 text-white"
              }`}
          >
            <IoCubeOutline className="text-sm" />
            <span>{isHealthy ? "View Inventory" : "Restock Now"}</span>
            <IoArrowForwardOutline className="text-xs" />
          </button>
        </div>
      </div>

      {/* Critical Items Pills if issues exist */}
      {!isHealthy && (
        <div className="mt-4 pt-3 border-t border-red-200/50 dark:border-red-900/40 flex flex-wrap gap-2">
          {outOfStockItems.map((item) => (
            <span
              key={`out-${item._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/60"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <b>{item.name}</b> — Out of stock (0 {item.unit})
            </span>
          ))}

          {lowStockItems
            .filter((i) => i.quantity > 0)
            .map((item) => (
              <span
                key={`low-${item._id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
              >
                <IoWarningOutline className="text-amber-600 dark:text-amber-400 text-xs" />
                <b>{item.name}</b> — {item.quantity} {item.unit} left
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

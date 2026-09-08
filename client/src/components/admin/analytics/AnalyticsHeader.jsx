import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoHelpCircleOutline,
  IoDownloadOutline,
  IoCalculatorOutline,
} from "react-icons/io5";
import { GRANULARITIES } from "./AnalyticsConstants";

export default function AnalyticsHeader({
  granularity,
  setGranularity,
  method,
  setMethod,
  setReloadKey,
  restockLoading,
  incomeLoading,
  setShowGuide,
  setShowExportModal,
  setShowCogsModal,
  setShowSimulatorModal,
}) {
  return (
    <div className="relative overflow-hidden bg-[#4a6741] rounded-2xl px-6 py-6 text-white">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute right-24 bottom-[-30px] w-28 h-28 rounded-full bg-white/5" />
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-medium px-3 py-1 rounded-full">
              <IoBarChartOutline className="text-sm" />
              Forecasting
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-medium px-3 py-1 rounded-full">
              <IoCalendarOutline className="text-sm" />
              {method === "linear" ? "Linear Regression" : "Holt’s Linear Trend"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Analytics Forecast</h1>
          <p className="text-white/70 text-sm mt-1 max-w-xl">
            Inventory restock urgency and income projection based on historical order trends.
          </p>
        </div>

        <div className="flex flex-col items-start xl:items-end gap-3 flex-shrink-0">
          {/* Row 1 — Forecast Controls & Utilities */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Granularity Segmented Toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-white/10 border border-white/20 p-1">
              {GRANULARITIES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGranularity(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${granularity === option.value
                    ? "bg-white text-[#4a6741] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Model Algorithm Segmented Toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-white/10 border border-white/20 p-1">
              <button
                onClick={() => setMethod("holt")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${method === "holt"
                  ? "bg-white text-[#4a6741] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
              >
                Holt
              </button>
              <button
                onClick={() => setMethod("linear")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${method === "linear"
                  ? "bg-white text-[#4a6741] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
              >
                Linear
              </button>
            </div>

            <button
              onClick={() => setReloadKey((current) => current + 1)}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 text-white/90 border border-white/20 hover:bg-white/20 transition flex items-center gap-1.5 cursor-pointer"
              title="Refresh Data"
            >
              <IoRefreshOutline className={restockLoading || incomeLoading ? "animate-spin text-base" : "text-base"} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowGuide(true)}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 text-white/90 border border-white/20 hover:bg-white/20 transition flex items-center gap-1.5 cursor-pointer"
              title="Forecast Guide"
            >
              <IoHelpCircleOutline className="text-base sm:text-lg" />
              <span>Guide</span>
            </button>
          </div>

          {/* Row 2 — Advanced Analytics Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Export CSV Reports"
            >
              <IoDownloadOutline className="text-base sm:text-lg" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowCogsModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="COGS & Profit Tracking"
            >
              <IoCalculatorOutline className="text-base sm:text-lg" />
              <span>COGS & Profit</span>
            </button>

            <button
              onClick={() => setShowSimulatorModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-400 text-gray-900 hover:bg-amber-300 transition flex items-center gap-1.5 shadow-md font-bold cursor-pointer"
              title="Scenario & Price Elasticity Simulator"
            >
              <span>Simulator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

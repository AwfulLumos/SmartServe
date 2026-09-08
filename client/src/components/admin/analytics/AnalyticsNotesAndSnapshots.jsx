import { IoTrendingUpOutline, IoWarningOutline } from "react-icons/io5";
import { formatCurrency } from "./AnalyticsConstants";

export default function AnalyticsNotesAndSnapshots({
  granularity,
  method,
  income,
  restock,
  urgentCount,
  restockItemsCount,
  incomeSummary,
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">Forecast Notes</h3>
            <p className="text-xs text-gray-400 mt-0.5">Calculated from completed order history and current stock levels</p>
          </div>
          <span className="text-xs font-semibold text-[#4a6741] bg-[#e8f5e2] px-3 py-1 rounded-full">
            α {restock.meta?.alpha ?? 0.3} · β {restock.meta?.beta ?? 0.1}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Granularity</p>
            <p className="mt-1 font-bold text-gray-800 capitalize">{granularity}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Comparison Window</p>
            <p className="mt-1 font-bold text-gray-800">{income.meta?.forecastPeriods || 0} periods</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">History Depth</p>
            <p className="mt-1 font-bold text-gray-800">{income.meta?.historyDays || 0} days</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
          Current model: <span className="font-semibold text-gray-800">{method === "linear" ? "Linear regression" : "Holt smoothing"}</span>
          {method === "linear"
            ? " This is easier to explain to staff, but it can react more sharply to recent spikes."
            : " This keeps the trend smoother and is usually better for short retail sales series."}
        </div>

        {(income.meta?.insufficientHistory || restock.meta?.insufficientHistory) && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
            Not enough data yet for stable forecasting. Results are based on the limited history available.
          </div>
        )}
      </div>

      <div className="space-y-6 h-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Income Snapshot</h3>
              <p className="text-xs text-gray-400 mt-0.5">Forecast total for the next window</p>
            </div>
            <IoTrendingUpOutline className="text-[#4a6741] text-xl" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Forecast total</span>
              <span className="font-semibold text-gray-800">{income.loading ? "—" : formatCurrency(incomeSummary.forecastWindowTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Change amount</span>
              <span className={`font-semibold ${Number(incomeSummary.changeAmount || 0) >= 0 ? "text-[#4a6741]" : "text-red-600"}`}>
                {income.loading ? "—" : formatCurrency(incomeSummary.changeAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Previous actuals</span>
              <span className="font-semibold text-gray-800">{income.loading ? "—" : formatCurrency(incomeSummary.previousPeriodActual)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Restock Summary</h3>
              <p className="text-xs text-gray-400 mt-0.5">Focus on the most urgent items first</p>
            </div>
            <IoWarningOutline className="text-red-500 text-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs uppercase tracking-wider text-red-500 font-semibold">Urgent</p>
              <p className="mt-1 font-bold text-red-600 text-lg">{restock.loading ? "—" : urgentCount}</p>
            </div>
            <div className="rounded-xl bg-[#f0f7ec] p-4">
              <p className="text-xs uppercase tracking-wider text-[#4a6741] font-semibold">Total</p>
              <p className="mt-1 font-bold text-[#4a6741] text-lg">{restock.loading ? "—" : restockItemsCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

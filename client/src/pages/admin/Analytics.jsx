import { useEffect, useMemo, useState } from "react";
import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoWarningOutline,
  IoTrendingUpOutline,
  IoStorefrontOutline,
  IoRefreshOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";

const GRANULARITIES = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
});

function formatCurrency(value) {
  return currency.format(Number(value || 0));
}

function formatDays(value) {
  if (value == null) return "N/A";
  return `${value} days`;
}

function MetricCard({ label, value, note, icon, tone = "green" }) {
  const toneClasses = {
    green: "bg-[#e8f5e2] text-[#4a6741]",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-800">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneClasses[tone] || toneClasses.green}`}>
          {icon}
        </div>
      </div>
      {note && <p className="mt-3 text-xs text-gray-400">{note}</p>}
    </div>
  );
}

function buildLinePath(points, width, height, padding = 16, maxValue = 1, totalSlots = null) {
  if (!points.length) return "";
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const max = Math.max(maxValue, 1);
  const slots = totalSlots ?? points.length;
  const stepX = slots <= 1 ? 0 : innerWidth / (slots - 1);

  return points
    .map((point, index) => {
      const x = padding + stepX * index;
      const y = padding + innerHeight - (point.value / max) * innerHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function Chart({ historical = [], forecast = [], loading = false, title = "Sales Trend", method = "holt" }) {
  const width = 900;
  const height = 280;
  const actualPoints = historical.length ? historical : [];
  const forecastPoints = forecast.length ? [{ label: "Start", value: historical.at(-1)?.value || 0 }, ...forecast] : [];
  const totalSlots = Math.max(actualPoints.length + Math.max(forecastPoints.length - 1, 0), 1);
  const scaleMax = Math.max(...actualPoints.map((point) => point.value), ...forecastPoints.map((point) => point.value), 1);
  const actualPath = buildLinePath(actualPoints, width, height, 16, scaleMax, totalSlots);
  const forecastPath = buildLinePath(forecastPoints, width, height, 16, scaleMax, totalSlots);
  const labels = [...actualPoints, ...forecastPoints.slice(1)].map((point) => point.label);

  // Show only every nth label to prevent overlap
  const labelSkip = Math.ceil(labels.length / 8);
  const displayedLabels = labels.map((label, index) => (index % labelSkip === 0 ? label : null));

  const methodLabel = method === "linear" ? "Linear Regression" : "Holt's Linear Trend";
  const subtitleText = `Historical actuals vs ${methodLabel} forecast`;

  if (loading) {
    return <div className="h-[320px] rounded-2xl bg-gray-50 animate-pulse" />;
  }

  if (!actualPoints.length && !forecastPoints.length) {
    return (
      <div className="h-[320px] rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
        Not enough data yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{subtitleText}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 text-gray-500">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#4a6741] to-[#5a7751]" />
            Actual
          </span>
          <span className="inline-flex items-center gap-2 text-gray-500">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
            Forecast
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[300px] overflow-visible">
        <defs>
          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a6741" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4a6741" stopOpacity="0" />
          </linearGradient>
          <filter id="chartShadow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = 16 + (height - 32) * (1 - ratio);
          return (
            <line key={`grid-${ratio}`} x1="16" y1={y} x2={width - 16} y2={y} stroke="#f0f0f0" strokeWidth="1" />
          );
        })}

        {/* Axis line */}
        <line x1="16" y1={height - 16} x2={width - 16} y2={height - 16} stroke="#e5e7eb" strokeWidth="2" />

        {/* Filled area under actual */}
        {actualPath && <path d={`${actualPath} L ${width - 16} ${height - 16} L 16 ${height - 16} Z`} fill="url(#actualFill)" />}

        {/* Actual line */}
        {actualPath && (
          <path
            d={actualPath}
            fill="none"
            stroke="#4a6741"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#chartShadow)"
          />
        )}

        {/* Forecast line */}
        {forecastPath && (
          <path
            d={forecastPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="8 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#chartShadow)"
          />
        )}

        {/* Actual data points */}
        {actualPoints.map((point, index) => {
          const stepX = totalSlots <= 1 ? 0 : (width - 32) / (totalSlots - 1);
          const x = 16 + stepX * index;
          const y = 16 + (height - 32) - (point.value / scaleMax) * (height - 32);
          return (
            <g key={`actual-${index}`}>
              <circle cx={x} cy={y} r="5" fill="white" stroke="#4a6741" strokeWidth="3" />
            </g>
          );
        })}

        {/* Forecast data points */}
        {forecastPoints.slice(1).map((point, index) => {
          const stepX = totalSlots <= 1 ? 0 : (width - 32) / (totalSlots - 1);
          const x = 16 + stepX * (actualPoints.length + index);
          const y = 16 + (height - 32) - (point.value / scaleMax) * (height - 32);
          return (
            <g key={`forecast-${index}`}>
              <circle cx={x} cy={y} r="5" fill="white" stroke="#f59e0b" strokeWidth="3" />
            </g>
          );
        })}

        {/* Date labels - show only every nth to prevent overlap */}
        {displayedLabels.map((label, index) => {
          if (!label) return null;
          const total = labels.length;
          const x = total === 1 ? width / 2 : 16 + ((width - 32) / Math.max(total - 1, 1)) * index;
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={height - 2}
              textAnchor="middle"
              className="fill-gray-500"
              fontSize="11"
              fontWeight="500"
              dy="0.7em"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function RestockTable({ items }) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
        Not enough data yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Restock Predictions</h3>
          <p className="text-xs text-gray-400 mt-0.5">Sorted by urgency</p>
        </div>
        <span className="text-xs font-semibold text-[#4a6741] bg-[#e8f5e2] px-3 py-1 rounded-full">
          {items.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Current Stock</th>
              <th className="px-5 py-3 font-semibold">Forecast Daily Demand</th>
              <th className="px-5 py-3 font-semibold">Days Until Stockout</th>
              <th className="px-5 py-3 font-semibold">Recommended Reorder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const urgent = item.daysUntilStockout != null && item.daysUntilStockout <= 7;
              return (
                <tr key={item._id} className={urgent ? "bg-red-50/60" : "bg-white"}>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.category}</span>
                      {item.insufficientHistory && <span className="text-[11px] font-semibold text-amber-700">Limited history</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">{item.currentStock} {item.unit}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">{item.forecastDailyDemand.toFixed(2)} / day</td>
                  <td className="px-5 py-4 text-sm font-semibold">
                    <span className={urgent ? "text-red-600" : "text-gray-700"}>{formatDays(item.daysUntilStockout)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#4a6741]">{item.recommendedReorderQty} {item.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function compareChange(pct) {
  if (pct == null) return "N/A";
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${up ? "bg-[#e8f5e2] text-[#4a6741]" : "bg-red-100 text-red-600"}`}>
      {up ? <IoArrowUpOutline /> : <IoArrowDownOutline />}
      {Math.abs(pct)}%
    </span>
  );
}

export default function Analytics() {
  const [granularity, setGranularity] = useState("day");
  const [method, setMethod] = useState("holt");
  const [reloadKey, setReloadKey] = useState(0);
  const [restock, setRestock] = useState({ items: [], meta: {}, loading: true });
  const [income, setIncome] = useState({ historicalSeries: [], forecastSeries: [], summary: {}, meta: {}, loading: true });
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const base = { granularity, method };
    if (granularity === "day") {
      return {
        restock: { ...base, lookaheadDays: 7, safetyStockDays: 3, historyDays: 90 },
        income: { ...base, forecastPeriods: 14, historyDays: 90 },
      };
    }
    if (granularity === "week") {
      return {
        restock: { ...base, lookaheadDays: 7, safetyStockDays: 3, historyDays: 180 },
        income: { ...base, forecastPeriods: 4, historyDays: 180 },
      };
    }
    return {
      restock: { ...base, lookaheadDays: 30, safetyStockDays: 7, historyDays: 365 },
      income: { ...base, forecastPeriods: 3, historyDays: 365 },
    };
  }, [granularity, method]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      setRestock((prev) => ({ ...prev, loading: true }));
      setIncome((prev) => ({ ...prev, loading: true }));
      try {
        const [restockRes, incomeRes] = await Promise.all([
          api.get("/forecast/restock", { params: params.restock }),
          api.get("/forecast/income", { params: params.income }),
        ]);

        if (cancelled) return;
        setRestock({ ...restockRes.data, loading: false });
        setIncome({ ...incomeRes.data, loading: false });
      } catch {
        if (cancelled) return;
        setError("Forecast data is unavailable right now.");
        setRestock((prev) => ({ ...prev, loading: false }));
        setIncome((prev) => ({ ...prev, loading: false }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [params, reloadKey]);

  const incomeSummary = income.summary || {};
  const restockItems = restock.items || [];
  const urgentCount = restockItems.filter((item) => item.daysUntilStockout == null || item.daysUntilStockout <= 7).length;

  return (
    <AdminLayout breadcrumb="Analytics">
      <div className="space-y-6 max-w-[1280px]">
        <div className="relative overflow-hidden bg-[#4a6741] rounded-2xl px-6 py-6 text-white">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-24 bottom-[-30px] w-28 h-28 rounded-full bg-white/5" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
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
              <p className="text-white/70 text-sm mt-1 max-w-2xl">
                Inventory restock urgency and income projection based on historical order trends.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {GRANULARITIES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGranularity(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    granularity === option.value
                      ? "bg-white text-[#4a6741] border-white"
                      : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <div className="flex items-center gap-1 rounded-xl bg-white/10 border border-white/20 p-1">
                <button
                  onClick={() => setMethod("holt")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${method === "holt" ? "bg-white text-[#4a6741]" : "text-white/80 hover:text-white"}`}
                >
                  Holt
                </button>
                <button
                  onClick={() => setMethod("linear")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${method === "linear" ? "bg-white text-[#4a6741]" : "text-white/80 hover:text-white"}`}
                >
                  Linear
                </button>
              </div>
              <button
                onClick={() => setReloadKey((current) => current + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 flex items-center gap-2"
              >
                <IoRefreshOutline className={restock.loading || income.loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Projected Income"
            value={income.loading ? "—" : formatCurrency(incomeSummary.nextPeriodForecast)}
            note="Next forecast window"
            icon={<IoTrendingUpOutline className="text-[#4a6741] text-2xl" />}
            tone="green"
          />
          <MetricCard
            label="Previous Period"
            value={income.loading ? "—" : formatCurrency(incomeSummary.previousPeriodActual)}
            note="Actual revenue from the prior window"
            icon={<IoStorefrontOutline className="text-[#4a6741] text-2xl" />}
            tone="blue"
          />
          <MetricCard
            label="Expected Change"
            value={income.loading ? "—" : compareChange(incomeSummary.changePct)}
            note="Forecast vs previous actuals"
            icon={<IoArrowUpOutline className="text-[#4a6741] text-2xl" />}
            tone="amber"
          />
          <MetricCard
            label="Urgent Restocks"
            value={restock.loading ? "—" : urgentCount}
            note="Items at or below 7 days of demand"
            icon={<IoWarningOutline className="text-red-600 text-2xl" />}
            tone="red"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Chart
            title="Projected Income Trend"
            loading={income.loading}
            historical={income.historicalSeries || []}
            forecast={income.forecastSeries || []}
          />

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
                    <p className="mt-1 font-bold text-[#4a6741] text-lg">{restock.loading ? "—" : restockItems.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RestockTable items={restockItems} />
        </div>
      </div>
    </AdminLayout>
  );
}
import { useEffect, useMemo, useState, useRef } from "react";
import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoWarningOutline,
  IoTrendingUpOutline,
  IoStorefrontOutline,
  IoRefreshOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoSearchOutline,
  IoDownloadOutline,
  IoHelpCircleOutline,
  IoCloseOutline,
  IoCalculatorOutline,
  IoPencilOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { SkeletonTable, SkeletonCardGrid } from "../../components/SkeletonLoader";

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

function CustomFilterSelect({ value, onChange, options, icon: Icon, placeholder = "Select...", className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`bg-white hover:bg-gray-50 border text-gray-700 text-xs font-semibold rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 shadow-sm transition outline-none ${value && value !== "all" && value !== "" ? "border-[#4a6741] text-[#4a6741] bg-[#d7ecc8]/25" : "border-gray-200"
          }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="text-gray-400 text-sm flex-shrink-0" />}
          <span>{selectedOpt?.label || placeholder}</span>
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${isSelected
                  ? "bg-[#e8f5e2] text-[#4a6741] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <IoCheckmarkOutline className="text-[#4a6741] text-sm flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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

function formatShortCurrency(value) {
  const n = Number(value || 0);
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₱${(n / 1000).toFixed(1)}K`;
  return `₱${n.toFixed(0)}`;
}

function Chart({ historical = [], forecast = [], loading = false, title = "Sales Trend", method = "holt" }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const svgRef = useRef(null);

  const width = 900;
  const height = 300;
  const padding = 16;
  const actualPoints = historical.length ? historical : [];
  const forecastPoints = forecast.length ? [{ label: "Start", value: historical.at(-1)?.value || 0 }, ...forecast] : [];
  const totalSlots = Math.max(actualPoints.length + Math.max(forecastPoints.length - 1, 0), 1);
  const scaleMax = Math.max(...actualPoints.map((p) => p.value), ...forecastPoints.map((p) => p.value), 1);
  const actualPath = buildLinePath(actualPoints, width, height, padding, scaleMax, totalSlots);
  const forecastPath = buildLinePath(forecastPoints, width, height, padding, scaleMax, totalSlots);
  const labels = [...actualPoints, ...forecastPoints.slice(1)].map((p) => p.label);

  const labelSkip = Math.ceil(labels.length / 8);
  const displayedLabels = labels.map((label, i) => (i % labelSkip === 0 ? label : null));

  const methodLabel = method === "linear" ? "Linear Regression" : "Holt's Linear Trend";
  const subtitleText = `Historical actuals vs ${methodLabel} forecast`;

  // Compute x position of the forecast start (junction between actual & forecast)
  const stepX = totalSlots <= 1 ? 0 : (width - padding * 2) / (totalSlots - 1);
  const forecastStartX = padding + stepX * (actualPoints.length - 1);
  const hasForecast = forecastPoints.length > 1;

  const allPoints = useMemo(() => {
    const list = [];
    actualPoints.forEach((p, idx) => {
      const x = padding + stepX * idx;
      const y = padding + (height - padding * 2) - (p.value / scaleMax) * (height - padding * 2);
      list.push({ label: p.label, value: p.value, x, y, isForecast: false, idx });
    });
    forecastPoints.slice(1).forEach((p, idx) => {
      const globalIdx = actualPoints.length + idx;
      const x = padding + stepX * globalIdx;
      const y = padding + (height - padding * 2) - (p.value / scaleMax) * (height - padding * 2);
      list.push({ label: p.label, value: p.value, x, y, isForecast: true, idx: globalIdx });
    });
    return list;
  }, [actualPoints, forecastPoints, padding, stepX, height, scaleMax]);

  const activePoint = hoveredIndex !== null ? allPoints[hoveredIndex] : null;

  const handleMouseMove = (e) => {
    if (!svgRef.current || !allPoints.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let minDistance = Math.abs(allPoints[0].x - mouseX);

    for (let i = 1; i < allPoints.length; i++) {
      const dist = Math.abs(allPoints[i].x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = i;
      }
    }
    setHoveredIndex(closest);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-[360px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex-1 my-4 bg-gray-50 rounded-xl animate-pulse flex items-end p-4 gap-4">
          {[40, 65, 30, 80, 55, 90, 70, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-200 rounded-t-md animate-pulse" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!actualPoints.length && !forecastPoints.length) {
    return (
      <div className="h-[360px] rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
        Not enough data yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-1">
        <div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{subtitleText}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 text-gray-500">
            <span className="w-8 h-[3px] rounded-full bg-[#4a6741]" />
            Actual
          </span>
          <span className="inline-flex items-center gap-2 text-gray-500">
            <span className="w-8 h-[3px] rounded-full bg-amber-400" style={{ backgroundImage: "repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 6px,transparent 6px,transparent 11px)" }} />
            Forecast
          </span>
        </div>
      </div>

      {/* Forecast summary badges */}
      {hasForecast && (
        <div className="flex flex-wrap gap-2 mb-4 mt-3">
          {forecastPoints.slice(1).map((point, i) => (
            <span
              key={`badge-${i}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {point.label}: <span className="text-amber-900">{formatShortCurrency(point.value)}</span>
            </span>
          ))}
        </div>
      )}

      <svg
        ref={svgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        viewBox={`0 0 ${width} ${height + 30}`}
        className="w-full overflow-visible cursor-crosshair"
        style={{ height: "320px" }}
      >
        <defs>
          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a6741" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4a6741" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
          </linearGradient>
          <filter id="chartShadow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
          <filter id="labelShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#00000020" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + (height - padding * 2) * (1 - ratio);
          return (
            <line key={`grid-${ratio}`} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f0f0f0" strokeWidth="1" />
          );
        })}

        {/* Y-axis value labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + (height - padding * 2) * (1 - ratio);
          const val = scaleMax * ratio;
          return (
            <text key={`ylabel-${ratio}`} x={padding - 4} y={y} textAnchor="end" fontSize="9" fill="#a0aec0" dominantBaseline="middle">
              {formatShortCurrency(val)}
            </text>
          );
        })}

        {/* Forecast background zone */}
        {hasForecast && (
          <>
            <rect
              x={forecastStartX}
              y={padding}
              width={width - padding - forecastStartX}
              height={height - padding * 2}
              fill="url(#forecastFill)"
              rx="4"
            />
            {/* Forecast zone label banner */}
            <rect
              x={forecastStartX + 6}
              y={padding + 4}
              width={84}
              height={18}
              rx="5"
              fill="#f59e0b"
              opacity="0.9"
              filter="url(#labelShadow)"
            />
            <text
              x={forecastStartX + 48}
              y={padding + 13}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="white"
              letterSpacing="1"
            >
              FORECAST
            </text>
          </>
        )}

        {/* Axis line */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="2" />

        {/* Filled area under actual */}
        {actualPath && (
          <path
            d={`${actualPath} L ${hasForecast ? forecastStartX : width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#actualFill)"
          />
        )}

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

        {/* Forecast filled area */}
        {hasForecast && forecastPath && (() => {
          const lastForecastX = padding + stepX * (totalSlots - 1);
          return (
            <path
              d={`${forecastPath} L ${lastForecastX} ${height - padding} L ${forecastStartX} ${height - padding} Z`}
              fill="url(#forecastFill)"
            />
          );
        })()}

        {/* Forecast line */}
        {forecastPath && (
          <path
            d={forecastPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeDasharray="9 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Vertical separator at forecast start */}
        {hasForecast && (
          <line
            x1={forecastStartX}
            y1={padding}
            x2={forecastStartX}
            y2={height - padding}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            opacity="0.6"
          />
        )}

        {/* Actual data points */}
        {actualPoints.map((point, index) => {
          const x = padding + stepX * index;
          const y = padding + (height - padding * 2) - (point.value / scaleMax) * (height - padding * 2);
          return (
            <g key={`actual-${index}`}>
              <circle cx={x} cy={y} r="5" fill="white" stroke="#4a6741" strokeWidth="2.5" />
            </g>
          );
        })}

        {/* Forecast data points with value labels */}
        {forecastPoints.slice(1).map((point, index) => {
          const x = padding + stepX * (actualPoints.length + index);
          const y = padding + (height - padding * 2) - (point.value / scaleMax) * (height - padding * 2);
          const labelY = Math.max(y - 28, padding + 10);
          const labelText = formatShortCurrency(point.value);
          const labelWidth = Math.max(labelText.length * 6.5 + 12, 52);
          return (
            <g key={`forecast-${index}`}>
              {/* Value label callout bubble */}
              <rect
                x={x - labelWidth / 2}
                y={labelY - 10}
                width={labelWidth}
                height={17}
                rx="5"
                fill="#f59e0b"
                filter="url(#labelShadow)"
              />
              {/* Callout tail */}
              <polygon
                points={`${x - 4},${labelY + 7} ${x + 4},${labelY + 7} ${x},${labelY + 13}`}
                fill="#f59e0b"
              />
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill="white"
                dominantBaseline="middle"
              >
                {labelText}
              </text>
              {/* Outer ring for emphasis */}
              <circle cx={x} cy={y} r="8" fill="#f59e0b" opacity="0.15" />
              <circle cx={x} cy={y} r="5.5" fill="white" stroke="#f59e0b" strokeWidth="2.5" />
              <circle cx={x} cy={y} r="2" fill="#f59e0b" />
            </g>
          );
        })}

        {/* Date labels */}
        {displayedLabels.map((label, index) => {
          if (!label) return null;
          const total = labels.length;
          const x = total === 1 ? width / 2 : padding + ((width - padding * 2) / Math.max(total - 1, 1)) * index;
          const isForecastLabel = index >= actualPoints.length;
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={height - padding + 14}
              textAnchor="middle"
              fontSize="10"
              fontWeight={isForecastLabel ? "700" : "500"}
              fill={isForecastLabel ? "#d97706" : "#9ca3af"}
            >
              {label}
            </text>
          );
        })}

        {/* Interactive Hover Tooltip Crosshair & Indicator */}
        {activePoint && (
          <g className="pointer-events-none transition-all duration-75">
            {/* Vertical crosshair line */}
            <line
              x1={activePoint.x}
              y1={padding}
              x2={activePoint.x}
              y2={height - padding}
              stroke={activePoint.isForecast ? "#f59e0b" : "#4a6741"}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Glowing active point ring */}
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="9"
              fill={activePoint.isForecast ? "#f59e0b" : "#4a6741"}
              opacity="0.25"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="5.5"
              fill="white"
              stroke={activePoint.isForecast ? "#f59e0b" : "#4a6741"}
              strokeWidth="3"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="2.5"
              fill={activePoint.isForecast ? "#f59e0b" : "#4a6741"}
            />

            {/* Floating Tooltip Callout Box */}
            {(() => {
              const tooltipWidth = 140;
              const tooltipHeight = 44;
              let tooltipX = activePoint.x - tooltipWidth / 2;
              if (tooltipX < padding + 5) tooltipX = padding + 5;
              if (tooltipX + tooltipWidth > width - padding - 5) tooltipX = width - padding - 5 - tooltipWidth;

              let tooltipY = activePoint.y - tooltipHeight - 12;
              if (tooltipY < padding + 5) tooltipY = activePoint.y + 12;

              return (
                <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                  <rect
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="8"
                    fill="#1e293b"
                    opacity="0.95"
                    filter="url(#labelShadow)"
                  />
                  <text x="10" y="16" fontSize="9.5" fontWeight="700" fill="#94a3b8">
                    {activePoint.label}
                  </text>
                  <text
                    x={tooltipWidth - 10}
                    y="16"
                    textAnchor="end"
                    fontSize="8.5"
                    fontWeight="700"
                    fill={activePoint.isForecast ? "#fbbf24" : "#4ade80"}
                  >
                    {activePoint.isForecast ? "Forecast" : "Actual"}
                  </text>
                  <text x="10" y="32" fontSize="12" fontWeight="800" fill="#ffffff">
                    {formatCurrency(activePoint.value)}
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}

function RestockTable({ items, loading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const name = item.name || "";
      const category = item.category || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  const exportToCSV = () => {
    const headers = [
      "Item Name",
      "Category",
      "Current Stock",
      "Unit",
      "Forecast Daily Demand",
      "Days Until Stockout",
      "Min Threshold",
      "Recommended Reorder Qty",
    ];
    const rows = items.map((item) => [
      item.name,
      item.category,
      item.currentStock,
      item.unit,
      item.forecastDailyDemand,
      item.daysUntilStockout ?? "N/A",
      item.minThreshold,
      item.recommendedReorderQty,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Restock_Predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-4">
          <div className="h-5 w-44 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonTable rows={6} columns={5} showHeader={true} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
        Not enough data yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Restock Predictions</h3>
          <p className="text-xs text-gray-400 mt-0.5">Sorted by urgency and safety threshold</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#e8f5e2] text-[#4a6741] hover:bg-[#d8e8d0] transition flex items-center gap-1.5"
          >
            <IoDownloadOutline className="text-sm" />
            Export CSV
          </button>
          <span className="text-xs font-semibold text-[#4a6741] bg-[#e8f5e2] px-3 py-1.5 rounded-full">
            {filteredItems.length} of {items.length} items
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-grow">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#4a6741] focus:ring-1 focus:ring-[#4a6741] placeholder-gray-400 text-gray-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <CustomFilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((cat) => ({
              value: cat,
              label: cat === "all" ? "All Categories" : cat,
            }))}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Current Stock</th>
              <th className="px-5 py-3 font-semibold">Forecast Daily Demand</th>
              <th className="px-5 py-3 font-semibold">Urgency / Stockout</th>
              <th className="px-5 py-3 font-semibold">Recommended Reorder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map((item) => {
              const isBelowThreshold = item.currentStock <= item.minThreshold;
              const isOutOfStock = item.currentStock === 0;
              const isCritical = item.daysUntilStockout != null && item.daysUntilStockout <= 3;
              const isWarning =
                (item.daysUntilStockout != null && item.daysUntilStockout <= 7) || isBelowThreshold;

              let rowClass = "bg-white";
              let badgeClass = "bg-gray-100 text-gray-600";
              let badgeText = formatDays(item.daysUntilStockout);

              if (isOutOfStock) {
                rowClass = "bg-red-50/60";
                badgeClass = "bg-red-100 text-red-700 font-semibold";
                badgeText = "Out of Stock";
              } else if (isCritical) {
                rowClass = "bg-red-50/40";
                badgeClass = "bg-red-100 text-red-700 font-semibold";
                badgeText = `Critical (${item.daysUntilStockout} days)`;
              } else if (isBelowThreshold) {
                rowClass = "bg-amber-50/30";
                badgeClass = "bg-amber-100 text-amber-800 font-semibold";
                badgeText = `Low Stock (${item.daysUntilStockout != null ? item.daysUntilStockout + " days" : "No Active Demand"})`;
              } else if (isWarning) {
                rowClass = "bg-amber-50/20";
                badgeClass = "bg-amber-100 text-amber-800 font-semibold";
                badgeText = `Warning (${item.daysUntilStockout} days)`;
              } else {
                badgeClass = "bg-green-100 text-green-800";
                badgeText = `Stable (${item.daysUntilStockout != null ? item.daysUntilStockout + " days" : "N/A"})`;
              }

              return (
                <tr key={item._id} className={rowClass}>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.category}</span>
                      {item.insufficientHistory && (
                        <span className="text-[11px] font-semibold text-amber-700">Limited history</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">
                    <div className="flex flex-col">
                      <span>
                        {item.currentStock} {item.unit}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">
                        Threshold: {item.minThreshold} {item.unit}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">
                    {item.forecastDailyDemand.toFixed(2)} / day
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#4a6741]">
                    {item.recommendedReorderQty} {item.unit}
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-sm text-gray-400">
                  No inventory items match your search/filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopDishesAndCategories({ topDishes = [], categoryBreakdown = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-100 rounded-xl animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxDishRevenue = topDishes.length ? Math.max(...topDishes.map((d) => d.totalRevenue), 1) : 1;

  const categoryColors = [
    "bg-[#4a6741]",
    "bg-amber-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-rose-500",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Best Selling Dishes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                Top 5 Best-Selling Dishes
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Highest revenue-generating items in this period</p>
            </div>
            <span className="text-xs font-semibold text-[#4a6741] bg-[#e8f5e2] px-3 py-1 rounded-full">
              {topDishes.length} Items
            </span>
          </div>

          {!topDishes.length ? (
            <p className="text-sm text-gray-400 py-8 text-center">No dish sales data available for this range.</p>
          ) : (
            <div className="space-y-3.5">
              {topDishes.map((dish, rank) => {
                const pct = Math.round((dish.totalRevenue / maxDishRevenue) * 100);
                return (
                  <div key={dish.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 ${rank === 0 ? "bg-amber-500" : rank === 1 ? "bg-gray-400" : rank === 2 ? "bg-amber-700" : "bg-gray-300 text-gray-700"
                          }`}>
                          #{rank + 1}
                        </span>
                        <span className="font-bold text-gray-800 truncate">{dish.name}</span>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
                          {dish.category}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-[#4a6741]">{formatCurrency(dish.totalRevenue)}</span>
                        <span className="text-[11px] text-gray-400 font-normal ml-2">({dish.totalQty} sold)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#4a6741] to-[#8ebd7e] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                Revenue by Category
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Share of total menu sales by category</p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          {!categoryBreakdown.length ? (
            <p className="text-sm text-gray-400 py-8 text-center">No category breakdown data available.</p>
          ) : (
            <div className="space-y-4">
              {/* Stacked Progress Bar */}
              <div className="w-full bg-gray-100 h-4 rounded-xl overflow-hidden flex shadow-inner">
                {categoryBreakdown.map((cat, idx) => (
                  <div
                    key={cat.category}
                    className={`h-full ${categoryColors[idx % categoryColors.length]} transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                    title={`${cat.category}: ${cat.percentage}% (${formatCurrency(cat.revenue)})`}
                  />
                ))}
              </div>

              {/* Category Legend list */}
              <div className="space-y-2.5 pt-1">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${categoryColors[idx % categoryColors.length]}`} />
                      <span className="font-semibold text-gray-700">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{cat.percentage}%</span>
                      <span className="text-gray-400 font-mono text-[11px] w-20 text-right">{formatCurrency(cat.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExportReportModal({ isOpen, onClose, income, restockItems, granularity, method }) {
  if (!isOpen) return null;

  const downloadRestockCSV = () => {
    const headers = [
      "Item Name",
      "Category",
      "Current Stock",
      "Unit",
      "Price (PHP)",
      "Unit Cost (PHP)",
      "Margin (%)",
      "Forecast Daily Demand",
      "Days Until Stockout",
      "Min Threshold",
      "Recommended Reorder Qty",
    ];
    const rows = restockItems.map((item) => [
      item.name,
      item.category,
      item.currentStock,
      item.unit,
      item.price,
      item.unitCost,
      item.profitMarginPct,
      item.forecastDailyDemand,
      item.daysUntilStockout ?? "N/A",
      item.minThreshold,
      item.recommendedReorderQty,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Restock_Predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadIncomeCSV = () => {
    const summary = income.summary || {};
    const historical = income.historicalSeries || [];
    const forecast = income.forecastSeries || [];

    let csvText = "Period,Type,Revenue (PHP)\n";
    historical.forEach((h) => {
      csvText += `"${h.label}",Actual,${h.value}\n`;
    });
    forecast.forEach((f) => {
      csvText += `"${f.label}",Forecast,${f.value}\n`;
    });
    csvText += `\nSUMMARY METRICS\n`;
    csvText += `Next Forecast Window Total,${summary.forecastWindowTotal || 0}\n`;
    csvText += `Previous Period Actual,${summary.previousPeriodActual || 0}\n`;
    csvText += `Change Amount,${summary.changeAmount || 0}\n`;
    csvText += `Change Percentage,${summary.changePct ?? "N/A"}%\n`;

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvText);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Income_Forecast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-student-page-fade-in">
        <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IoDownloadOutline className="text-2xl" />
            <div>
              <h3 className="text-lg font-bold">Export Analytics Reports</h3>
              <p className="text-xs text-white/80">Download CSV Datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-800">Restock & COGS Predictions CSV</p>
              <p className="text-xs text-gray-500 mt-0.5">Includes stock, forecast demand, reorder levels, and profit margins.</p>
            </div>
            <button
              onClick={downloadRestockCSV}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <IoDownloadOutline className="text-base" />
              Restock CSV
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-800">Income & Revenue Forecast CSV</p>
              <p className="text-xs text-gray-500 mt-0.5">Includes historical sales series, model predictions, and breakdown.</p>
            </div>
            <button
              onClick={downloadIncomeCSV}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <IoDownloadOutline className="text-base" />
              Income CSV
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CogsProfitModal({ isOpen, onClose, items, onSaveItemCost }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editCost, setEditCost] = useState("");

  if (!isOpen) return null;

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const hasDemandHistory = items.some((item) => (item.forecastDailyDemand || 0) > 0);

  const totals = items.reduce(
    (acc, item) => {
      const stock = item.currentStock || 0;
      const unitCost = item.price || item.unitCost || 0;
      const dailyDemand = item.forecastDailyDemand > 0 ? item.forecastDailyDemand : (hasDemandHistory ? 0 : 1);

      acc.totalStockValue += stock * unitCost;
      acc.total30DayCogs += dailyDemand * unitCost * 30;
      acc.sumUnitCost += unitCost;
      return acc;
    },
    { totalStockValue: 0, total30DayCogs: 0, sumUnitCost: 0 }
  );

  const avgUnitCost = items.length > 0 ? totals.sumUnitCost / items.length : 0;

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditCost(item.price ?? item.unitCost ?? 0);
  };

  const saveEdit = (item) => {
    const val = Number(editCost);
    if (!Number.isNaN(val) && val >= 0) {
      onSaveItemCost(item, val);
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-100 animate-student-page-fade-in">
        <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IoCalculatorOutline className="text-2xl" />
            <div>
              <h3 className="text-lg font-bold">COGS & Ingredient Cost Tracking</h3>
              <p className="text-xs text-white/80">Raw ingredient purchase costs, current inventory value & monthly COGS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#f5faf3] p-4 rounded-2xl border border-[#d4e8cc]">
              <p className="text-xs text-gray-500 font-medium">Total Inventory Value</p>
              <p className="text-xl font-bold text-[#4a6741] mt-1">{formatCurrency(totals.totalStockValue)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Current on-hand stock value</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-xs text-amber-700 font-medium">Est. 30-Day COGS</p>
              <p className="text-xl font-bold text-amber-900 mt-1">{formatCurrency(totals.total30DayCogs)}</p>
              <p className="text-[10px] text-amber-600/70 mt-0.5">{hasDemandHistory ? "Based on usage forecast" : "Baseline (1 unit/day sample)"}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Avg Ingredient Unit Cost</p>
              <p className="text-xl font-bold text-emerald-900 mt-1">{formatCurrency(avgUnitCost)}</p>
              <p className="text-[10px] text-emerald-600/70 mt-0.5">Average raw ingredient cost</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">Total Tracked Items</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{items.length} items</p>
              <p className="text-[10px] text-blue-600/70 mt-0.5">Raw ingredients in database</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="relative flex-grow">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#4a6741]"
              />
            </div>
            <div className="flex items-center gap-2">
              <CustomFilterSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categories.map((c) => ({
                  value: c,
                  label: c === "all" ? "All Categories" : c,
                }))}
              />
            </div>
          </div>

          <div className="border border-gray-100 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full min-w-[720px] table-fixed divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-100">
                <tr>
                  <th className="w-[20%] px-3 py-3.5 text-left">Ingredient Item</th>
                  <th className="w-[17%] px-3 py-3.5 text-left">Unit Cost (Price)</th>
                  <th className="w-[15%] px-3 py-3.5 text-left">Current Stock</th>
                  <th className="w-[17%] px-3 py-3.5 text-left">Total Stock Value</th>
                  <th className="w-[16%] px-3 py-3.5 text-left">Est. 30-Day COGS</th>
                  <th className="w-[15%] px-3 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredItems.map((item) => {
                  const unitCost = item.price || item.unitCost || 0;
                  const stock = item.currentStock || 0;
                  const stockValue = stock * unitCost;
                  const dailyDemand = item.forecastDailyDemand > 0 ? item.forecastDailyDemand : (hasDemandHistory ? 0 : 1);
                  const cogs30Days = dailyDemand * unitCost * 30;

                  const isEditing = editingId === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition">
                      <td className="px-3 py-3 align-middle text-left">
                        <p className="font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{item.category}</p>
                      </td>
                      <td className="px-3 py-3 text-left font-medium text-amber-900 align-middle">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editCost}
                            onChange={(e) => setEditCost(e.target.value)}
                            className="w-20 px-2 py-1 text-left border border-[#4a6741] rounded-lg text-xs font-semibold focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          formatCurrency(unitCost)
                        )}
                      </td>
                      <td className="px-3 py-3 text-left font-medium text-gray-800 align-middle">
                        {stock} <span className="text-gray-400 text-[11px]">{item.unit || "pcs"}</span>
                      </td>
                      <td className="px-3 py-3 text-left font-semibold text-[#4a6741] align-middle">
                        {formatCurrency(stockValue)}
                      </td>
                      <td className="px-3 py-3 text-left font-semibold text-gray-700 align-middle">
                        {formatCurrency(cogs30Days)}
                      </td>
                      <td className="px-3 py-3 text-right align-middle">
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(item)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-[#4a6741] text-white font-semibold hover:bg-[#3d5535] transition shadow-sm whitespace-nowrap"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition inline-flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <IoPencilOutline className="text-sm" />
                            <span>Edit Cost</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Unit costs update directly in your inventory database.</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function PriceElasticitySimulatorModal({ isOpen, onClose, items }) {
  const [selectedItemId, setSelectedItemId] = useState(items[0]?._id || "");
  const [priceChangePct, setPriceChangePct] = useState(0);
  const [costChangePct, setCostChangePct] = useState(0);
  const [elasticity, setElasticity] = useState(-1.0);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i._id === selectedItemId) || items[0] || {
    name: "Sample Dish",
    price: 85,
    unitCost: 45,
    forecastDailyDemand: 25,
  };

  const basePrice = Number(currentItem.price) || 85;
  const baseCost = Number(currentItem.unitCost) > 0 ? Number(currentItem.unitCost) : Number((basePrice * 0.55).toFixed(2));
  const baseDemand = currentItem.forecastDailyDemand > 0 ? currentItem.forecastDailyDemand : 20;

  const baseDailyRevenue = basePrice * baseDemand;
  const baseDailyProfit = (basePrice - baseCost) * baseDemand;

  const simPrice = Math.max(1, basePrice * (1 + priceChangePct / 100));
  const simCost = Math.max(0, baseCost * (1 + costChangePct / 100));
  const demandChangePct = elasticity * priceChangePct;
  const simDemand = Math.max(0, baseDemand * (1 + demandChangePct / 100));

  const simDailyRevenue = simPrice * simDemand;
  const simDailyProfit = (simPrice - simCost) * simDemand;

  const profitDiff = simDailyProfit - baseDailyProfit;
  const profitDiffPct = baseDailyProfit > 0 ? (profitDiff / baseDailyProfit) * 100 : 0;
  const isProfitable = profitDiff >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-100 animate-student-page-fade-in">
        <div className="bg-gradient-to-r from-[#4a6741] to-[#3b5433] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IoSparklesOutline className="text-2xl text-amber-300" />
            <div>
              <h3 className="text-lg font-bold">Price Elasticity & Scenario Simulator</h3>
              <p className="text-xs text-white/80">Simulate price tweaks, cost changes, and forecasted profit shifts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Select Menu Item to Simulate
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#4a6741]"
            >
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.category}) — {formatCurrency(item.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700">Price Adjustment</span>
                <span className={`font-bold ${priceChangePct >= 0 ? "text-[#4a6741]" : "text-red-600"}`}>
                  {priceChangePct > 0 ? `+${priceChangePct}` : priceChangePct}%
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={priceChangePct}
                onChange={(e) => setPriceChangePct(Number(e.target.value))}
                className="w-full accent-[#4a6741] cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Simulated Price: <strong>{formatCurrency(simPrice)}</strong></p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700">Ingredient Cost Shift</span>
                <span className={`font-bold ${costChangePct <= 0 ? "text-[#4a6741]" : "text-red-600"}`}>
                  {costChangePct > 0 ? `+${costChangePct}` : costChangePct}%
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                step="5"
                value={costChangePct}
                onChange={(e) => setCostChangePct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Simulated Cost: <strong>{formatCurrency(simCost)}</strong></p>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-gray-700">Price Elasticity (Ed)</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setElasticity(-0.5)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${elasticity === -0.5 ? "bg-[#4a6741] text-white" : "text-gray-600"}`}
                  title="Inelastic (Demand changes less than price)"
                >
                  Inelastic
                </button>
                <button
                  onClick={() => setElasticity(-1.0)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${elasticity === -1.0 ? "bg-[#4a6741] text-white" : "text-gray-600"}`}
                  title="Unitary (1:1 responsiveness)"
                >
                  Unitary
                </button>
                <button
                  onClick={() => setElasticity(-1.5)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${elasticity === -1.5 ? "bg-[#4a6741] text-white" : "text-gray-600"}`}
                  title="Elastic (High price sensitivity)"
                >
                  Elastic
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Est. Volume Change: <strong className={demandChangePct >= 0 ? "text-[#4a6741]" : "text-red-600"}>{demandChangePct.toFixed(1)}%</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Baseline</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Unit Price</span>
                <span className="font-semibold text-gray-800">{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Daily Demand</span>
                <span className="font-semibold text-gray-800">{baseDemand.toFixed(1)} units/day</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Daily Revenue</span>
                <span className="font-semibold text-gray-800">{formatCurrency(baseDailyRevenue)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold">
                <span className="text-gray-700">Daily Net Profit</span>
                <span className="text-gray-900">{formatCurrency(baseDailyProfit)}</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${isProfitable ? "bg-[#f5faf3] border-[#d4e8cc]" : "bg-red-50 border-red-100"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isProfitable ? "text-[#4a6741]" : "text-red-700"}`}>
                Simulated Projection
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Simulated Price</span>
                <span className="font-semibold text-gray-800">{formatCurrency(simPrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Projected Demand</span>
                <span className="font-semibold text-gray-800">{simDemand.toFixed(1)} units/day</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Projected Revenue</span>
                <span className="font-semibold text-gray-800">{formatCurrency(simDailyRevenue)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200/60 flex justify-between text-sm font-bold">
                <span className="text-gray-800">Projected Daily Profit</span>
                <span className={isProfitable ? "text-[#4a6741]" : "text-red-700"}>{formatCurrency(simDailyProfit)}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${isProfitable ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
            <IoCheckmarkCircleOutline className={`text-xl flex-shrink-0 mt-0.5 ${isProfitable ? "text-emerald-600" : "text-amber-600"}`} />
            <div>
              <p className="font-bold text-sm">
                {isProfitable ? `Profitable Scenario (+${profitDiffPct.toFixed(1)}% Profit Shift)` : `Caution: Profit Risk (${profitDiffPct.toFixed(1)}% Drop)`}
              </p>
              <p className="mt-1 leading-relaxed opacity-90">
                {isProfitable
                  ? `Adjusting price to ${formatCurrency(simPrice)} generates an estimated additional ${formatCurrency(profitDiff * 30)} in net monthly profit.`
                  : `Increasing cost or price elasticity reduces daily demand to ${simDemand.toFixed(1)} units, resulting in a net monthly loss of ${formatCurrency(Math.abs(profitDiff * 30))}.`}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition"
          >
            Close Simulator
          </button>
        </div>
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
  const [showGuide, setShowGuide] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCogsModal, setShowCogsModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);

  const handleSaveItemCost = async (item, newCost) => {
    try {
      await api.put(`/inventory/${item._id}`, {
        name: item.name,
        category: item.category,
        quantity: item.currentStock,
        unit: item.unit,
        minThreshold: item.minThreshold,
        price: newCost,
        unitCost: newCost,
      });
      setReloadKey((k) => k + 1);
    } catch {
      setRestock((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i._id === item._id ? { ...i, price: newCost, unitCost: newCost } : i)),
      }));
    }
  };

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
  const urgentCount = restockItems.filter(
    (item) => (item.daysUntilStockout != null && item.daysUntilStockout <= 7) || item.currentStock <= item.minThreshold
  ).length;

  return (
    <AdminLayout breadcrumb="Analytics">
      <div className="space-y-6 max-w-[1280px]">
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
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${granularity === option.value
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
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${method === "holt"
                      ? "bg-white text-[#4a6741] shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    Holt
                  </button>
                  <button
                    onClick={() => setMethod("linear")}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${method === "linear"
                      ? "bg-white text-[#4a6741] shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    Linear
                  </button>
                </div>

                <button
                  onClick={() => setReloadKey((current) => current + 1)}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 text-white/90 border border-white/20 hover:bg-white/20 transition flex items-center gap-1.5"
                  title="Refresh Data"
                >
                  <IoRefreshOutline className={restock.loading || income.loading ? "animate-spin text-base" : "text-base"} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setShowGuide(true)}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 text-white/90 border border-white/20 hover:bg-white/20 transition flex items-center gap-1.5"
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
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition flex items-center gap-1.5 shadow-sm"
                  title="Export CSV Reports"
                >
                  <IoDownloadOutline className="text-base sm:text-lg" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setShowCogsModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition flex items-center gap-1.5 shadow-sm"
                  title="COGS & Profit Tracking"
                >
                  <IoCalculatorOutline className="text-base sm:text-lg" />
                  <span>COGS & Profit</span>
                </button>

                <button
                  onClick={() => setShowSimulatorModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-400 text-gray-900 hover:bg-amber-300 transition flex items-center gap-1.5 shadow-md font-bold"
                  title="Scenario & Price Elasticity Simulator"
                >
                  <span>Simulator</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {
          error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
              {error}
            </div>
          )
        }

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
            method={method}
          />

          <TopDishesAndCategories
            topDishes={income.topDishes || []}
            categoryBreakdown={income.categoryBreakdown || []}
            loading={income.loading}
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

          <RestockTable items={restockItems} loading={restock.loading} />
        </div>
      </div >

      {/* Analytics Forecast Guide Modal */}
      {
        showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-100">
              {/* Modal Header */}
              <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <IoHelpCircleOutline className="text-2xl" />
                  <div>
                    <h3 className="text-lg font-bold">Analytics & Forecasting Guide</h3>
                    <p className="text-xs text-white/80">How the canteen predicts sales and restock recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white"
                >
                  <IoCloseOutline className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-gray-600">
                {/* Section 1 — Reading the Chart */}
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                    Reading the Chart
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <span className="w-8 h-[3px] bg-[#4a6741] rounded-full mt-2 flex-shrink-0" />
                      <span><strong className="text-gray-700">Green line</strong> — Past sales. This is what actually happened.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
                      <span className="w-8 h-[3px] bg-amber-400 rounded-full mt-2 flex-shrink-0" style={{ backgroundImage: "repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 5px,transparent 5px,transparent 9px)" }} />
                      <span><strong className="text-gray-700">Amber dashed line + shaded area</strong> — The prediction for future sales.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <span className="flex-shrink-0 mt-0.5 w-4 flex justify-center">
                        <span className="w-[2px] h-4 border-l-2 border-dashed border-amber-400 inline-block" />
                      </span>
                      <span><strong className="text-gray-700">Vertical dashed line</strong> — Where history ends. Left = real. Right = forecast.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
                      <span className="flex-shrink-0 mt-0.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-white" style={{ fontSize: "8px", fontWeight: 800 }}>₱</span>
                      </span>
                      <span><strong className="text-gray-700">Yellow bubbles on the chart</strong> — The predicted income for each future date (e.g. ₱12.5K).</span>
                    </div>
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <span className="flex-shrink-0 mt-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-200" style={{ fontSize: "7px", fontWeight: 700, color: "#92400e", letterSpacing: "0.04em" }}>PILL</span>
                      </span>
                      <span><strong className="text-gray-700">Amber pill badges</strong> below the chart title — A quick list of all forecast periods and amounts.</span>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 2 — Forecast Methods */}
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                    Holt vs Linear — Which should I use?
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">Switch between them using the buttons at the top of the page.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#f5faf3] rounded-2xl p-4 border border-[#d4e8cc]">
                      <p className="font-bold text-[#4a6741] text-xs mb-1.5 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4a6741] inline-block flex-shrink-0" />Holt (Recommended)</p>
                      <p className="text-xs leading-relaxed text-gray-600">
                        Looks at both <strong>recent sales</strong> and whether sales are going <strong>up or down</strong>. Smooths out random busy days so predictions stay steady.
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <p className="font-bold text-amber-700 text-xs mb-1.5 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block flex-shrink-0" />Linear</p>
                      <p className="text-xs leading-relaxed text-gray-600">
                        Draws a simple straight line based on past sales. Easy to understand, but one unusually busy day can throw it off.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 3 — Restock Table */}
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                    Restock Table — What do the columns mean?
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">Sorted from most urgent to least. Act on red items first.</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <IoStorefrontOutline className="text-gray-400 text-base flex-shrink-0 mt-0.5" />
                      <span><strong className="text-gray-700">Current Stock</strong> — How many units are left, and the minimum safe level (threshold).</span>
                    </div>
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <IoBarChartOutline className="text-gray-400 text-base flex-shrink-0 mt-0.5" />
                      <span><strong className="text-gray-700">Forecast Daily Demand</strong> — Estimated units sold per day, based on past orders.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <IoWarningOutline className="text-gray-400 text-base flex-shrink-0 mt-0.5" />
                      <span><strong className="text-gray-700">Urgency / Stockout</strong> — How many days of stock remain at the current demand rate.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-[#f5faf3] rounded-xl px-3 py-2.5 border border-[#d4e8cc]">
                      <IoTrendingUpOutline className="text-[#4a6741] text-base flex-shrink-0 mt-0.5" />
                      <span><strong className="text-[#4a6741]">Recommended Reorder</strong> — How much to buy to cover upcoming demand plus a safety buffer.</span>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 4 — Stock Badges */}
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                    Stock Status Badges
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 mb-1" />
                      <p className="font-bold text-xs">Out of Stock</p>
                      <p className="text-[10px] text-red-500 mt-0.5">Zero left</p>
                    </div>
                    <div className="bg-red-50/60 text-red-700 border border-red-100/60 rounded-xl p-3 text-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-400 mb-1" />
                      <p className="font-bold text-xs">Critical</p>
                      <p className="text-[10px] text-red-500 mt-0.5">3 days or less</p>
                    </div>
                    <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-xl p-3 text-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mb-1" />
                      <p className="font-bold text-xs">Low Stock</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">Below threshold</p>
                    </div>
                    <div className="bg-amber-50/50 text-amber-800 border border-amber-100/50 rounded-xl p-3 text-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-amber-300 mb-1" />
                      <p className="font-bold text-xs">Warning</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">7 days or less</p>
                    </div>
                    <div className="bg-green-50 text-green-800 border border-green-100 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mb-1" />
                      <p className="font-bold text-xs">Stable</p>
                      <p className="text-[10px] text-green-700 mt-0.5">No action needed</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 5 — Advanced Analytics Header Tools */}
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                    Advanced Analytics Tools
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">Access these tools from the upper-right header action buttons.</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <IoDownloadOutline className="text-[#4a6741] text-base flex-shrink-0 mt-0.5" />
                      <span><strong className="text-gray-700">Export CSV</strong> — Instantly download raw spreadsheets for restock predictions (stock levels, reorder quantities, unit costs) or revenue forecasts.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <IoCalculatorOutline className="text-[#4a6741] text-base flex-shrink-0 mt-0.5" />
                      <span><strong className="text-gray-700">COGS & Profit Tracking</strong> — View overall Cost of Goods Sold (COGS), net profit, and profit margin %. You can inline-edit unit costs for dishes to save precise financial records.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
                      <IoSparklesOutline className="text-amber-600 text-base flex-shrink-0 mt-0.5" />
                      <span><strong className="text-gray-700">Price Elasticity Simulator</strong> — Perform "what-if" scenario planning. Test how dish price changes or raw ingredient cost increases impact daily order volume and net daily profit before making menu changes.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">Predictions use real order history — the more orders, the more accurate.</p>
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )
      }

      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        income={income}
        restockItems={restockItems}
        granularity={granularity}
        method={method}
      />

      <CogsProfitModal
        isOpen={showCogsModal}
        onClose={() => setShowCogsModal(false)}
        items={restockItems}
        onSaveItemCost={handleSaveItemCost}
      />

      <PriceElasticitySimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        items={restockItems}
      />
    </AdminLayout >
  );
}
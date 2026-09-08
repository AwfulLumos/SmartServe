import { useState, useMemo, useRef } from "react";
import { formatCurrency, formatShortCurrency } from "./AnalyticsConstants";

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

export default function AnalyticsChart({ historical = [], forecast = [], loading = false, title = "Sales Trend", method = "holt" }) {
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
              <rect
                x={x - labelWidth / 2}
                y={labelY - 10}
                width={labelWidth}
                height={17}
                rx="5"
                fill="#f59e0b"
                filter="url(#labelShadow)"
              />
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
            <line
              x1={activePoint.x}
              y1={padding}
              x2={activePoint.x}
              y2={height - padding}
              stroke={activePoint.isForecast ? "#f59e0b" : "#4a6741"}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
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

const DEFAULTS = {
  method: "holt",
  alpha: 0.3,
  beta: 0.1,
  historyDays: 90,
  lookaheadDays: 7,
  safetyStockDays: 3,
  minDataPoints: 4,
};

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function startOfDay(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date) {
  const d = startOfDay(date);
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function getPeriodInfo(date, granularity) {
  const d = startOfDay(date);
  if (!d) return null;

  if (granularity === "week") {
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    return {
      key: formatDateKey(d),
      label: `Wk of ${d.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`,
      start: d,
      days: 7,
    };
  }

  if (granularity === "month") {
    d.setDate(1);
    const nextMonth = new Date(d);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const days = Math.round((nextMonth - d) / (1000 * 60 * 60 * 24));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-PH", { month: "short", year: "numeric" }),
      start: d,
      days,
    };
  }

  return {
    key: formatDateKey(d),
    label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
    start: d,
    days: 1,
  };
}

function groupSeries(points, granularity, valueField = "value") {
  const buckets = new Map();

  points.forEach((point) => {
    if (!point?.date) return;
    const info = getPeriodInfo(point.date, granularity);
    if (!info) return;
    const existing = buckets.get(info.key) || {
      key: info.key,
      label: info.label,
      start: info.start,
      days: info.days,
      value: 0,
    };
    existing.value += Number(point[valueField] || 0);
    buckets.set(info.key, existing);
  });

  return Array.from(buckets.values()).sort((a, b) => a.start - b.start);
}

function fillMissingPeriods(series, granularity) {
  if (!series.length) return series;

  const filled = [];
  let cursor = new Date(series[0].start);
  let index = 0;

  while (index < series.length) {
    const current = series[index];
    const cursorInfo = getPeriodInfo(cursor, granularity);
    if (!cursorInfo) break;
    if (cursorInfo.key === current.key) {
      filled.push(current);
      index += 1;
    } else {
      filled.push({
        key: cursorInfo.key,
        label: cursorInfo.label,
        start: cursorInfo.start,
        days: cursorInfo.days,
        value: 0,
      });
    }

    cursor = new Date(cursor);
    if (granularity === "month") {
      cursor.setMonth(cursor.getMonth() + 1);
      cursor.setDate(1);
    } else {
      cursor.setDate(cursor.getDate() + (granularity === "week" ? 7 : 1));
    }
  }

  return filled;
}

function holtLinearTrend(values, options = {}) {
  const alpha = clampNumber(options.alpha, 0, 1, DEFAULTS.alpha);
  const beta = clampNumber(options.beta, 0, 1, DEFAULTS.beta);
  const cleanValues = values.map((value) => Math.max(0, Number(value) || 0));

  if (cleanValues.length === 0) {
    return { fitted: [], forecast: [], level: 0, trend: 0, insufficientHistory: true };
  }

  if (cleanValues.length === 1) {
    const single = cleanValues[0];
    return {
      fitted: [single],
      forecast: [single],
      level: single,
      trend: 0,
      insufficientHistory: true,
    };
  }

  let level = cleanValues[0];
  let trend = cleanValues[1] - cleanValues[0];

  for (let i = 1; i < cleanValues.length; i += 1) {
    const actual = cleanValues[i];
    const previousLevel = level;
    level = alpha * actual + (1 - alpha) * (level + trend);
    trend = beta * (level - previousLevel) + (1 - beta) * trend;
  }

  return { fitted: cleanValues, forecast: [], level, trend, insufficientHistory: cleanValues.length < (options.minDataPoints || DEFAULTS.minDataPoints) };
}

function linearRegressionForecast(values, periods) {
  const cleanValues = values.map((value) => Math.max(0, Number(value) || 0));

  if (cleanValues.length === 0) {
    return { forecast: [], slope: 0, intercept: 0, insufficientHistory: true };
  }

  if (cleanValues.length === 1) {
    return {
      forecast: [cleanValues[0]],
      slope: 0,
      intercept: cleanValues[0],
      insufficientHistory: true,
    };
  }

  const n = cleanValues.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = cleanValues.reduce((sum, value) => sum + value, 0);
  const sumXY = cleanValues.reduce((sum, value, index) => sum + (index + 1) * value, 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const horizon = Math.max(1, Math.floor(Number(periods) || 1));
  const forecast = [];

  for (let i = 1; i <= horizon; i += 1) {
    forecast.push(Math.max(0, intercept + slope * (n + i)));
  }

  return {
    forecast,
    slope,
    intercept,
    insufficientHistory: cleanValues.length < DEFAULTS.minDataPoints,
  };
}

function forecastSeries(values, periods, options = {}) {
  const method = options.method === "linear" ? "linear" : DEFAULTS.method;

  if (method === "linear") {
    return {
      method,
      ...linearRegressionForecast(values, periods),
    };
  }

  const model = holtLinearTrend(values, options);
  return {
    method,
    forecast: forecastPeriodsFromModel(model, periods),
    insufficientHistory: model.insufficientHistory,
    level: model.level,
    trend: model.trend,
  };
}

function forecastPeriodsFromModel(model, periods) {
  const horizon = Math.max(1, Math.floor(Number(periods) || 1));
  const series = [];

  for (let i = 1; i <= horizon; i += 1) {
    series.push(Math.max(0, model.level + model.trend * i));
  }

  return series;
}

function daysForGranularity(granularity) {
  if (granularity === "month") return 30;
  if (granularity === "week") return 7;
  return 1;
}

function sortByUrgency(a, b) {
  const aDays = a.daysUntilStockout;
  const bDays = b.daysUntilStockout;
  if (aDays == null && bDays == null) return (b.recommendedReorderQty || 0) - (a.recommendedReorderQty || 0);
  if (aDays == null) return 1;
  if (bDays == null) return -1;
  if (aDays !== bDays) return aDays - bDays;
  if ((a.currentStock || 0) !== (b.currentStock || 0)) return (a.currentStock || 0) - (b.currentStock || 0);
  return (b.forecastNextDaysDemand || 0) - (a.forecastNextDaysDemand || 0);
}

function buildRestockForecast({ inventory = [], orders = [], options = {} }) {
  const granularity = ["day", "week", "month"].includes(options.granularity) ? options.granularity : "day";
  const method = options.method === "linear" ? "linear" : DEFAULTS.method;
  const alpha = clampNumber(options.alpha, 0, 1, DEFAULTS.alpha);
  const beta = clampNumber(options.beta, 0, 1, DEFAULTS.beta);
  const lookaheadDays = Math.max(1, Math.floor(Number(options.lookaheadDays) || DEFAULTS.lookaheadDays));
  const safetyStockDays = Math.max(0, Math.floor(Number(options.safetyStockDays) || DEFAULTS.safetyStockDays));
  const minDataPoints = Math.max(2, Math.floor(Number(options.minDataPoints) || DEFAULTS.minDataPoints));
  const daysPerBucket = daysForGranularity(granularity);
  const forecastPeriods = Math.max(1, Math.ceil(lookaheadDays / daysPerBucket));

  const orderItemPoints = orders
    .filter((order) => order.status !== "cancelled")
    .flatMap((order) =>
      (order.items || []).map((item) => ({
        date: order.createdAt,
        name: normalizeKey(item.name),
        value: Number(item.quantity) || 0,
      }))
    );

  const pointsByName = new Map();
  orderItemPoints.forEach((point) => {
    if (!point.name) return;
    const arr = pointsByName.get(point.name) || [];
    arr.push(point);
    pointsByName.set(point.name, arr);
  });

  const items = inventory.map((item) => {
    const matchedPoints = pointsByName.get(normalizeKey(item.name)) || [];
    const grouped = fillMissingPeriods(groupSeries(matchedPoints, granularity, "value"), granularity);
    const values = grouped.map((entry) => entry.value);
    const model = forecastSeries(values, forecastPeriods, { method, alpha, beta, minDataPoints });
    const forecast = model.forecast;
    const forecastNextDaysDemand = forecast.reduce((sum, value) => sum + value, 0) * (lookaheadDays / (forecastPeriods * daysPerBucket));
    const dailyDemand = forecastNextDaysDemand / lookaheadDays;
    const currentStock = Number(item.quantity) || 0;
    const daysUntilStockout = dailyDemand > 0 ? Number((currentStock / dailyDemand).toFixed(1)) : null;
    const safetyStock = Math.max(Number(item.minThreshold) || 0, Math.ceil(dailyDemand * safetyStockDays));
    const recommendedReorderQty = Math.max(0, Math.ceil(forecastNextDaysDemand + safetyStock - currentStock));

    const price = Number(item.price) || 0;
    const unitCost = Number(item.unitCost) > 0 ? Number(item.unitCost) : Number((price * 0.55).toFixed(2));
    const grossProfitPerUnit = Number(Math.max(0, price - unitCost).toFixed(2));
    const profitMarginPct = price > 0 ? Number(((grossProfitPerUnit / price) * 100).toFixed(1)) : 0;

    return {
      _id: item._id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      price,
      unitCost,
      grossProfitPerUnit,
      profitMarginPct,
      currentStock,
      minThreshold: Number(item.minThreshold) || 0,
      forecastDailyDemand: Number(dailyDemand.toFixed(2)),
      forecastNextDaysDemand: Number(forecastNextDaysDemand.toFixed(2)),
      daysUntilStockout,
      recommendedReorderQty,
      insufficientHistory: model.insufficientHistory || values.filter((value) => value > 0).length < 2,
      historyPoints: values.length,
      recentSeries: grouped.map((entry) => ({ label: entry.label, value: entry.value })),
      method,
    };
  });

  return {
    items: items.sort(sortByUrgency),
    meta: {
      granularity,
      method,
      lookaheadDays,
      alpha,
      beta,
      minDataPoints,
    },
  };
}

function buildIncomeForecast({ orders = [], options = {} }) {
  const granularity = ["day", "week", "month"].includes(options.granularity) ? options.granularity : "day";
  const method = options.method === "linear" ? "linear" : DEFAULTS.method;
  const alpha = clampNumber(options.alpha, 0, 1, DEFAULTS.alpha);
  const beta = clampNumber(options.beta, 0, 1, DEFAULTS.beta);
  const historyDays = Math.max(14, Math.floor(Number(options.historyDays) || DEFAULTS.historyDays));
  const forecastPeriods = Math.max(1, Math.floor(Number(options.forecastPeriods) || (granularity === "day" ? 14 : granularity === "week" ? 4 : 3)));
  const minDataPoints = Math.max(2, Math.floor(Number(options.minDataPoints) || DEFAULTS.minDataPoints));

  const actualPoints = orders
    .filter((order) => order.status !== "cancelled")
    .map((order) => ({ date: order.createdAt, value: Number(order.total) || 0 }));

  const grouped = fillMissingPeriods(groupSeries(actualPoints, granularity, "value"), granularity).slice(-historyDays);
  const values = grouped.map((entry) => entry.value);
  const model = forecastSeries(values, forecastPeriods, { method, alpha, beta, minDataPoints });
  const forecast = model.forecast;
  const forecastPoints = forecast.map((value, index) => ({
    label: `Forecast ${index + 1}`,
    value: Number(value.toFixed(2)),
  }));

  const comparisonWindow = values.slice(-forecastPeriods);
  const previousActual = comparisonWindow.reduce((sum, value) => sum + value, 0);
  const nextForecastTotal = forecast.reduce((sum, value) => sum + value, 0);
  const changeAmount = nextForecastTotal - previousActual;
  const changePct = previousActual > 0 ? (changeAmount / previousActual) * 100 : null;

  // Calculate top selling dishes and category breakdown
  const dishMap = new Map();
  const categoryMap = new Map();
  let totalItemRevenue = 0;

  orders
    .filter((order) => order.status !== "cancelled")
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = String(item.name || "Unknown").trim();
        const category = String(item.category || "General").trim();
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const revenue = qty * price || 0;

        totalItemRevenue += revenue;

        const existingDish = dishMap.get(name) || { name, category, totalQty: 0, totalRevenue: 0 };
        existingDish.totalQty += qty;
        existingDish.totalRevenue += revenue;
        dishMap.set(name, existingDish);

        const existingCat = categoryMap.get(category) || { category, revenue: 0 };
        existingCat.revenue += revenue;
        categoryMap.set(category, existingCat);
      });
    });

  const topDishes = Array.from(dishMap.values())
    .map((d) => ({
      name: d.name,
      category: d.category,
      totalQty: d.totalQty,
      totalRevenue: Number(d.totalRevenue.toFixed(2)),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const categoryBreakdown = Array.from(categoryMap.values())
    .map((c) => ({
      category: c.category,
      revenue: Number(c.revenue.toFixed(2)),
      percentage: totalItemRevenue > 0 ? Number(((c.revenue / totalItemRevenue) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    granularity,
    method,
    historicalSeries: grouped.map((entry) => ({
      label: entry.label,
      value: Number(entry.value.toFixed(2)),
    })),
    forecastSeries: forecastPoints,
    topDishes,
    categoryBreakdown,
    summary: {
      nextPeriodForecast: Number((forecast[0] || 0).toFixed(2)),
      forecastWindowTotal: Number(nextForecastTotal.toFixed(2)),
      previousPeriodActual: Number(previousActual.toFixed(2)),
      changeAmount: Number(changeAmount.toFixed(2)),
      changePct: changePct == null ? null : Number(changePct.toFixed(1)),
    },
    meta: {
      alpha,
      beta,
      historyDays,
      forecastPeriods,
      minDataPoints,
      insufficientHistory: model.insufficientHistory || values.filter((value) => value > 0).length < 2,
    },
  };
}

module.exports = {
  DEFAULTS,
  buildIncomeForecast,
  buildRestockForecast,
  clampNumber,
  daysForGranularity,
  forecastPeriodsFromModel,
  getPeriodInfo,
  groupSeries,
  holtLinearTrend,
  linearRegressionForecast,
  forecastSeries,
  normalizeKey,
  sortByUrgency,
};
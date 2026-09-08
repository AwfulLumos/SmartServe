const Order = require("../models/Order");
const InventoryItem = require("../models/InventoryItem");
const { buildIncomeForecast, buildRestockForecast, clampNumber, DEFAULTS } = require("../utils/forecastDemand");

function parseForecastOptions(query = {}) {
  return {
    method: query.method === "linear" ? "linear" : "holt",
    alpha: clampNumber(query.alpha, 0, 1, DEFAULTS.alpha),
    beta: clampNumber(query.beta, 0, 1, DEFAULTS.beta),
    granularity: ["day", "week", "month"].includes(query.granularity) ? query.granularity : "day",
    lookaheadDays: Math.max(1, Math.floor(Number(query.lookaheadDays) || DEFAULTS.lookaheadDays)),
    safetyStockDays: Math.max(0, Math.floor(Number(query.safetyStockDays) || DEFAULTS.safetyStockDays)),
    minDataPoints: Math.max(2, Math.floor(Number(query.minDataPoints) || DEFAULTS.minDataPoints)),
    historyDays: Math.max(14, Math.floor(Number(query.historyDays) || DEFAULTS.historyDays)),
    forecastPeriods: Math.max(1, Math.floor(Number(query.forecastPeriods) || 0)),
  };
}

function buildDateFilter(query = {}, fallbackDays = 90) {
  const now = new Date();
  const endDate = query.endDate ? new Date(query.endDate) : now;
  const startDate = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - fallbackDays * 24 * 60 * 60 * 1000);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  return { startDate, endDate };
}

exports.getRestockForecast = async (req, res) => {
  try {
    const options = parseForecastOptions(req.query);
    const range = buildDateFilter(req.query, options.historyDays);
    const inventory = await InventoryItem.find({}).sort({ category: 1, name: 1 });
    const orderFilter = {};
    if (range) {
      orderFilter.createdAt = { $gte: range.startDate, $lte: range.endDate };
    }
    const orders = await Order.find(orderFilter).select("items total status createdAt");

    const result = buildRestockForecast({ inventory, orders, options });
    res.json({
      ...result,
      range: range
        ? { startDate: range.startDate, endDate: range.endDate }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncomeForecast = async (req, res) => {
  try {
    const options = parseForecastOptions(req.query);
    const range = buildDateFilter(req.query, options.historyDays);
    const orderFilter = {};
    if (range) {
      orderFilter.createdAt = { $gte: range.startDate, $lte: range.endDate };
    }
    const orders = await Order.find(orderFilter).select("items total status createdAt");

    const result = buildIncomeForecast({ orders, options });
    res.json({
      ...result,
      range: range
        ? { startDate: range.startDate, endDate: range.endDate }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Order = require("../models/Order");
const Student = require("../models/Student");
const InventoryItem = require("../models/InventoryItem");
const Redemption = require("../models/Redemption");

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Today boundaries
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Yesterday boundaries
    const yestStart = new Date(todayStart);
    yestStart.setDate(yestStart.getDate() - 1);
    const yestEnd = new Date(todayEnd);
    yestEnd.setDate(yestEnd.getDate() - 1);

    // ── Orders today ──
    const [ordersToday, ordersYesterday] = await Promise.all([
      Order.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Order.find({ createdAt: { $gte: yestStart, $lte: yestEnd } }),
    ]);

    const revenueToday = ordersToday
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);

    const revenueYesterday = ordersYesterday
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);

    const transactionsToday = ordersToday.filter((o) => o.status !== "cancelled").length;
    const transactionsYesterday = ordersYesterday.filter((o) => o.status !== "cancelled").length;

    const itemsSoldToday = ordersToday
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.items.reduce((is, i) => is + i.quantity, 0), 0);

    const itemsSoldYesterday = ordersYesterday
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.items.reduce((is, i) => is + i.quantity, 0), 0);

    // ── Active orders (pending + preparing + ready) ──
    const activeOrders = await Order.countDocuments({
      status: { $in: ["pending", "preparing", "ready"] },
    });

    const pendingOrders = await Order.countDocuments({ status: "pending" });

    // ── Inventory low/out stock ──
    const allInventory = await InventoryItem.find({});
    const lowStock = allInventory.filter((i) => i.quantity > 0 && i.quantity <= i.minThreshold);
    const outOfStock = allInventory.filter((i) => i.quantity === 0);

    // ── Students ──
    const totalStudents = await Student.countDocuments({ isActive: true });

    // ── Recent orders (last 8) ──
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("orderNumber studentName schoolId total status createdAt items");

    // ── Recent redemptions (last 5) ──
    const recentRedemptions = await Redemption.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("studentName schoolId rewardName pointsUsed createdAt");

    const pctChange = (today, yesterday) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return Math.round(((today - yesterday) / yesterday) * 100);
    };

    res.json({
      stats: {
        transactionsToday,
        transactionsPct: pctChange(transactionsToday, transactionsYesterday),
        revenueToday,
        revenuePct: pctChange(revenueToday, revenueYesterday),
        itemsSoldToday,
        itemsSoldPct: pctChange(itemsSoldToday, itemsSoldYesterday),
        activeOrders,
        pendingOrders,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        totalStudents,
      },
      lowStockItems: lowStock.slice(0, 5).map((i) => ({ _id: i._id, name: i.name, quantity: i.quantity, unit: i.unit, minThreshold: i.minThreshold })),
      recentOrders,
      recentRedemptions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

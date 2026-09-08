const AuditLog = require("../models/AuditLog");

// GET /api/audit-logs
exports.getLogs = async (req, res) => {
  try {
    const { search = "", category = "", actorType = "", page = 1, limit = 50 } = req.query;

    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (actorType && actorType !== "all") filter.actorType = actorType;
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: "i" } },
        { actorName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

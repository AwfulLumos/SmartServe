const AuditLog = require("../models/AuditLog");

// GET /api/audit-logs
exports.getLogs = async (req, res) => {
  try {
    const { search = "", category = "", actorType = "", page = 1, limit = 50, all = "false" } = req.query;

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

    if (all === "true") {
      const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }),
        AuditLog.countDocuments(filter),
      ]);
      return res.json({ logs, total, page: 1, pages: 1 });
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(1000, Math.max(1, Number(limit)));
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

// DELETE /api/audit-logs/:id
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findByIdAndDelete(id);
    if (!log) {
      return res.status(404).json({ message: "Audit log entry not found." });
    }
    res.json({ message: "Audit log entry deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/audit-logs - Delete all or filtered audit logs
exports.clearLogs = async (req, res) => {
  try {
    const { category, actorType } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (actorType && actorType !== "all") filter.actorType = actorType;

    const result = await AuditLog.deleteMany(filter);
    res.json({
      message: `Successfully deleted ${result.deletedCount} audit log entries.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const PointsConfig = require("../models/PointsConfig");
const logAudit = require("../utils/auditLogger");

// Helper — always returns the singleton, creating it if missing
async function getConfig() {
  let cfg = await PointsConfig.findOne({ key: "default" });
  if (!cfg) cfg = await PointsConfig.create({ key: "default" });
  return cfg;
}

// GET /api/points-config
exports.getPointsConfig = async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json(cfg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/points-config
exports.updatePointsConfig = async (req, res) => {
  try {
    const { pointsPerPeso, ecoPointsPerByoc, minRedemptionPoints } = req.body;

    const update = {};
    if (pointsPerPeso !== undefined) {
      const v = Number(pointsPerPeso);
      if (isNaN(v) || v < 0) return res.status(400).json({ message: "pointsPerPeso must be ≥ 0" });
      update.pointsPerPeso = v;
    }
    if (ecoPointsPerByoc !== undefined) {
      const v = Number(ecoPointsPerByoc);
      if (isNaN(v) || v < 0) return res.status(400).json({ message: "ecoPointsPerByoc must be ≥ 0" });
      update.ecoPointsPerByoc = v;
    }
    if (minRedemptionPoints !== undefined) {
      const v = Number(minRedemptionPoints);
      if (isNaN(v) || v < 0) return res.status(400).json({ message: "minRedemptionPoints must be ≥ 0" });
      update.minRedemptionPoints = v;
    }

    const cfg = await PointsConfig.findOneAndUpdate(
      { key: "default" },
      { $set: update },
      { new: true, upsert: true }
    );

    logAudit({
      action: "Points Config Updated",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} updated points configuration`,
      category: "config",
      meta: update,
    });

    res.json(cfg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export helper for use in other controllers
module.exports.getConfigData = getConfig;

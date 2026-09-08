const Reward = require("../models/Reward");
const logAudit = require("../utils/auditLogger");

// GET /api/rewards
exports.getRewards = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const query = activeOnly === "true" ? { isActive: true } : {};
    const rewards = await Reward.find(query).sort({ createdAt: -1 });
    const total = rewards.length;
    const active = rewards.filter((r) => r.isActive).length;
    res.json({ rewards, total, active });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/rewards
exports.createReward = async (req, res) => {
  try {
    const { name, description, type, pointsCost, icon } = req.body;
    if (!name || !type || !pointsCost) {
      return res.status(400).json({ message: "Name, type and points cost are required" });
    }
    const reward = await Reward.create({ name, description, type, pointsCost, icon });

    logAudit({
      action: "Reward Created",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} created reward "${name}" (${pointsCost} pts)`,
      category: "reward",
      meta: { rewardId: reward._id, name, pointsCost },
    });

    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/rewards/:id
exports.updateReward = async (req, res) => {
  try {
    const { name, description, type, pointsCost, icon } = req.body;
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      { name, description, type, pointsCost, icon },
      { new: true, runValidators: true }
    );
    if (!reward) return res.status(404).json({ message: "Reward not found" });

    logAudit({
      action: "Reward Updated",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} updated reward "${reward.name}"`,
      category: "reward",
      meta: { rewardId: reward._id },
    });

    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/rewards/:id/toggle
exports.toggleReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    reward.isActive = !reward.isActive;
    await reward.save();

    logAudit({
      action: `Reward ${reward.isActive ? "Enabled" : "Disabled"}`,
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} ${reward.isActive ? "enabled" : "disabled"} reward "${reward.name}"`,
      category: "reward",
      meta: { rewardId: reward._id, isActive: reward.isActive },
    });

    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/rewards/:id
exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });

    logAudit({
      action: "Reward Deleted",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} deleted reward "${reward.name}"`,
      category: "reward",
      meta: { name: reward.name },
    });

    res.json({ message: "Reward deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

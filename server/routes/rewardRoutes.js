const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const { getRewards, createReward, updateReward, toggleReward, deleteReward } = require("../controllers/rewardController");

// Student-accessible: active rewards only
router.get("/active", protectStudent, async (req, res) => {
  req.query.activeOnly = "true";
  return getRewards(req, res);
});

// Admin / staff routes
router.use(protect, restrictTo("admin", "staff"));

router.get("/", getRewards);
router.post("/", createReward);
router.put("/:id", updateReward);
router.patch("/:id/toggle", toggleReward);
router.delete("/:id", deleteReward);

module.exports = router;

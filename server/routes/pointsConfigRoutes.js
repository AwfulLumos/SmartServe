const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { getPointsConfig, updatePointsConfig } = require("../controllers/pointsConfigController");

router.get("/", protect, getPointsConfig);
router.put("/", protect, restrictTo("admin", "staff"), updatePointsConfig);

module.exports = router;

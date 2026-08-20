const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { getIncomeForecast, getRestockForecast } = require("../controllers/forecastController");

router.get("/restock", protect, restrictTo("admin", "staff"), getRestockForecast);
router.get("/income", protect, restrictTo("admin", "staff"), getIncomeForecast);

module.exports = router;
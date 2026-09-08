const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/stats", protect, restrictTo("admin", "staff"), getDashboardStats);

module.exports = router;

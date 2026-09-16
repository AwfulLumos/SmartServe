const express = require("express");
const router = express.Router();
const networkController = require("../controllers/networkController");
const { protect, restrictTo } = require("../middleware/auth");

// Users & IP Telemetry (Sessions)
router.get("/sessions", protect, restrictTo("admin", "staff"), networkController.getConnectedSessions);

// Interactive ICMP Ping Diagnostics
router.post("/ping", protect, restrictTo("admin", "staff"), networkController.pingIp);

module.exports = router;

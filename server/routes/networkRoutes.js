const express = require("express");
const router = express.Router();
const networkController = require("../controllers/networkController");
const { protect, restrictTo } = require("../middleware/auth");

// Users & IP Telemetry (Sessions)
router.get("/sessions", protect, restrictTo("admin", "staff"), networkController.getConnectedSessions);

// Interactive ICMP Ping Diagnostics
router.post("/ping", protect, restrictTo("admin", "staff"), networkController.pingIp);

// Failed Login Attempts Telemetry
router.get("/failed-logins", protect, restrictTo("admin", "staff"), networkController.getFailedLogins);
router.delete("/failed-logins/clear-all", protect, restrictTo("admin"), networkController.clearFailedLogins);
router.delete("/failed-logins/:id", protect, restrictTo("admin"), networkController.deleteFailedLogin);

module.exports = router;

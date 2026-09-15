const express = require("express");
const router = express.Router();
const networkController = require("../controllers/networkController");
const { protect, restrictTo } = require("../middleware/auth");

// Overview & Telemetry
router.get("/overview", protect, restrictTo("admin", "staff"), networkController.getOverview);
router.get("/sessions", protect, restrictTo("admin", "staff"), networkController.getConnectedSessions);
router.get("/logs", protect, restrictTo("admin", "staff"), networkController.getNetworkLogs);
router.post("/simulate", protect, restrictTo("admin", "staff"), networkController.simulatePacket);

// Network Configuration (Operating Mode & Subnets)
router.put("/config", protect, restrictTo("admin"), networkController.updateConfig);

// Access Control Lists (ACL Rules)
router.get("/acl", protect, restrictTo("admin", "staff"), networkController.getAclRules);
router.post("/acl", protect, restrictTo("admin"), networkController.createAclRule);
router.put("/acl/:id", protect, restrictTo("admin"), networkController.updateAclRule);
router.patch("/acl/:id/toggle", protect, restrictTo("admin"), networkController.toggleAclRule);
router.delete("/acl/:id", protect, restrictTo("admin"), networkController.deleteAclRule);

// DHCP Stations & Static Reservations
router.get("/dhcp", protect, restrictTo("admin", "staff"), networkController.getDhcpStations);
router.post("/dhcp", protect, restrictTo("admin"), networkController.createDhcpReservation);
router.put("/dhcp/:id", protect, restrictTo("admin"), networkController.updateDhcpReservation);
router.delete("/dhcp/:id", protect, restrictTo("admin"), networkController.deleteDhcpReservation);
router.post("/dhcp/:id/ping", protect, restrictTo("admin", "staff"), networkController.pingStation);

module.exports = router;

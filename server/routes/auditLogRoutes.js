const express = require("express");
const router = express.Router();
const { getLogs, deleteLog, clearLogs } = require("../controllers/auditLogController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/", protect, restrictTo("admin", "staff"), getLogs);
router.delete("/clear-all", protect, restrictTo("admin"), clearLogs);
router.delete("/:id", protect, restrictTo("admin"), deleteLog);
router.delete("/", protect, restrictTo("admin"), clearLogs);

module.exports = router;

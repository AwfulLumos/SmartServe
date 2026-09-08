const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/auditLogController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/", protect, restrictTo("admin", "staff"), getLogs);

module.exports = router;

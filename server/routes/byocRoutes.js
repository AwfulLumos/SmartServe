const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const { getByocRecords, logByoc, getStudentByocRecords } = require("../controllers/byocController");

// Student route
router.get("/mine", protectStudent, getStudentByocRecords);

// Admin/staff routes
router.use(protect, restrictTo("admin", "staff"));
router.get("/", getByocRecords);
router.post("/", logByoc);

module.exports = router;

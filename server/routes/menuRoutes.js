const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const { getActiveMenuItems, getMenuItems, createMenuItem, updateMenuItem, toggleMenuItem, deleteMenuItem } = require("../controllers/menuController");

// Student-accessible: only active items
router.get("/active", protectStudent, getActiveMenuItems);

// Admin / staff protected
router.use(protect, restrictTo("admin", "staff"));
router.get("/", getMenuItems);
router.post("/", createMenuItem);
router.put("/:id", updateMenuItem);
router.patch("/:id/toggle", toggleMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;

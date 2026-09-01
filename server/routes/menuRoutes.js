const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const { handleMenuImageUpload } = require("../middleware/upload");
const { getActiveMenuItems, getMenuItems, createMenuItem, updateMenuItem, toggleMenuItem, deleteMenuItem } = require("../controllers/menuController");

// Student-accessible: only active items
router.get("/active", protectStudent, getActiveMenuItems);

// Admin / staff protected
router.use(protect, restrictTo("admin", "staff"));
router.get("/", getMenuItems);
router.post("/", handleMenuImageUpload, createMenuItem);
router.put("/:id", handleMenuImageUpload, updateMenuItem);
router.patch("/:id/toggle", toggleMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;

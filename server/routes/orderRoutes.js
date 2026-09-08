const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const { createOrder, getStudentOrders, getOrders, updateOrderStatus } = require("../controllers/orderController");

// Admin / staff routes
router.get("/", protect, restrictTo("admin", "staff"), getOrders);
router.patch("/:id/status", protect, restrictTo("admin", "staff"), updateOrderStatus);

// Student routes
router.post("/", protectStudent, createOrder);
router.get("/mine", protectStudent, getStudentOrders);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const {
  getNotifications,
  markAllRead,
  markOneRead,
} = require("../controllers/notificationController");

// Admin/staff — fetch their notifications
router.get("/admin", protect, restrictTo("admin", "staff"), (req, res) => {
  req.query.recipientType = "admin";
  getNotifications(req, res);
});

// Admin/staff — mark all admin notifications read
router.patch("/admin/read-all", protect, restrictTo("admin", "staff"), (req, res) => {
  req.body.recipientType = "admin";
  markAllRead(req, res);
});

// Student — fetch their notifications
router.get("/student", protectStudent, (req, res) => {
  req.query.recipientType = "student";
  getNotifications(req, res);
});

// Student — mark all student notifications read
router.patch("/student/read-all", protectStudent, (req, res) => {
  req.body.recipientType = "student";
  markAllRead(req, res);
});

// Shared — mark a single notification read (caller must own it, handled by DB filter)
router.patch("/:id/read", (req, res, next) => {
  // Allow both authed admin/staff and students
  next();
}, markOneRead);

module.exports = router;

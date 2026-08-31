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

// Shared — mark a single notification read (caller must be authed as admin/staff or student)
router.patch("/:id/read", async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader && (!req.cookies || (!req.cookies.token && !req.cookies.student_token))) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Try student auth first if student_token cookie or token type matches, else protect
  try {
    const jwt = require("jsonwebtoken");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : (req.cookies?.token || req.cookies?.student_token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.type === "student") {
      return protectStudent(req, res, next);
    }
  } catch {
    // Fall back to standard protect middleware
  }
  protect(req, res, next);
}, markOneRead);

module.exports = router;

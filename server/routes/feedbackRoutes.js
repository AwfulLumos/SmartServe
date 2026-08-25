const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const {
  submitFeedback,
  getStudentFeedbacks,
  deleteStudentFeedback,
  getFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");

// Student endpoints
router.post("/student", protectStudent, submitFeedback);
router.get("/student/my", protectStudent, getStudentFeedbacks);
router.delete("/student/:id", protectStudent, deleteStudentFeedback);

// Admin & Staff endpoints
router.get("/", protect, restrictTo("admin", "staff"), getFeedbacks);
router.patch("/:id/status", protect, restrictTo("admin", "staff"), updateFeedbackStatus);
router.delete("/:id", protect, restrictTo("admin", "staff"), deleteFeedback);

module.exports = router;

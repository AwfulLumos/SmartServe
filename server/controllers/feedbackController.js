const Feedback = require("../models/Feedback");

// ── Student: Submit Feedback ────────────────────────────────────────────────
exports.submitFeedback = async (req, res) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(401).json({ message: "Student authentication required." });
    }

    const { category, rating, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Feedback message is required." });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const validCategories = ["General", "Food Quality", "Canteen Service", "App Issue", "Suggestion"];
    const selectedCategory = validCategories.includes(category) ? category : "General";

    const feedback = await Feedback.create({
      student: student._id,
      studentName: student.fullName,
      studentSchoolId: student.schoolId || "",
      studentImage: student.profileImage || "",
      category: selectedCategory,
      rating: numRating,
      message: message.trim(),
      status: "pending",
    });

    res.status(201).json({
      message: "Feedback submitted successfully. Thank you!",
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Student: Get Own Feedbacks ───────────────────────────────────────────────
exports.getStudentFeedbacks = async (req, res) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(401).json({ message: "Student authentication required." });
    }

    const feedbacks = await Feedback.find({ student: student._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ feedbacks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Get Feedbacks with Search & Filter ───────────────────────────────
exports.getFeedbacks = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
      rating = "",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (rating && rating !== "all") {
      filter.rating = Number(rating);
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { studentName: regex },
        { studentSchoolId: regex },
        { message: regex },
        { adminResponse: regex },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [feedbacks, total, allDocs] = await Promise.all([
      Feedback.find(filter)
        .populate("student", "profileImage fullName schoolId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Feedback.countDocuments(filter),
      Feedback.find({}), // For aggregated stats calculation
    ]);

    // Calculate Summary Stats
    const totalCount = allDocs.length;
    const pendingCount = allDocs.filter((f) => f.status === "pending").length;
    const reviewedCount = allDocs.filter((f) => f.status === "reviewed").length;
    const resolvedCount = allDocs.filter((f) => f.status === "resolved").length;

    const sumRating = allDocs.reduce((sum, f) => sum + (f.rating || 5), 0);
    const averageRating = totalCount > 0 ? (sumRating / totalCount).toFixed(1) : "5.0";

    res.json({
      feedbacks,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      stats: {
        total: totalCount,
        pending: pendingCount,
        reviewed: reviewedCount,
        resolved: resolvedCount,
        averageRating: Number(averageRating),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Update Status & Add Response ────────────────────────────────────
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    if (status && ["pending", "reviewed", "resolved"].includes(status)) {
      feedback.status = status;
    }

    if (adminResponse !== undefined) {
      feedback.adminResponse = adminResponse.trim();
      feedback.respondedAt = new Date();
      feedback.respondedBy = req.user?.fullName || "Admin";
      if (feedback.status === "pending") {
        feedback.status = "reviewed";
      }

      // Notify student via socket & push notification
      if (feedback.student) {
        const { pushNotification } = require("./notificationController");
        pushNotification({
          recipientType: "student",
          recipientId: feedback.student.toString(),
          type: "order_status",
          title: "Feedback Response Received",
          body: `Admin replied: "${adminResponse.trim().slice(0, 80)}${adminResponse.trim().length > 80 ? "..." : ""}"`,
          meta: { feedbackId: feedback._id },
        });
      }
    }

    await feedback.save();

    res.json({
      message: "Feedback updated successfully.",
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Student: Delete Own Feedback ───────────────────────────────────────────
exports.deleteStudentFeedback = async (req, res) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(401).json({ message: "Student authentication required." });
    }

    const { id } = req.params;
    const feedback = await Feedback.findOne({ _id: id, student: student._id });
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found or unauthorized." });
    }

    await Feedback.findByIdAndDelete(id);

    res.json({ message: "Feedback deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Delete Feedback ──────────────────────────────────────────────────
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.json({ message: "Feedback entry deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

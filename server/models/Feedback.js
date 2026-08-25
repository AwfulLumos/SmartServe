const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentSchoolId: {
      type: String,
      default: "",
      trim: true,
    },
    studentImage: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["General", "Food Quality", "Canteen Service", "App Issue", "Suggestion"],
      default: "General",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      default: "",
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);

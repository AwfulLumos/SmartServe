const mongoose = require("mongoose");

const failedLoginSchema = new mongoose.Schema(
  {
    accountType: {
      type: String,
      enum: ["student", "staff", "admin", "unknown"],
      default: "unknown",
      index: true,
    },
    identifier: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userModel: {
      type: String,
      enum: ["User", "Student", null],
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    name: {
      type: String,
      default: "Unregistered Account",
    },
    email: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      required: true,
      default: "127.0.0.1",
      index: true,
    },
    region: {
      type: String,
      default: "Philippines",
    },
    deviceType: {
      type: String,
      default: "Desktop / Laptop",
    },
    userAgent: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "Invalid credentials",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying and time sorting
failedLoginSchema.index({ createdAt: -1 });
failedLoginSchema.index({ accountType: 1, createdAt: -1 });
failedLoginSchema.index({ ipAddress: 1, createdAt: -1 });

module.exports = mongoose.model("FailedLogin", failedLoginSchema);

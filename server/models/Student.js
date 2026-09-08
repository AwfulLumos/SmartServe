const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userType: { type: String, enum: ["student", "employee"], default: "student" },
    // Student-specific
    gradeLevel: { type: String, default: "" },
    section: { type: String, default: "" },
    // Employee-specific
    jobTitle: { type: String, default: "" },
    department: { type: String, default: "" },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    points: { type: Number, default: 0 },
    byocCount: { type: Number, default: 0 },
    // Unique QR token derived from schoolId — used in Rewards scanning
    qrToken: { type: String, unique: true, sparse: true },
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

studentSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Student", studentSchema);

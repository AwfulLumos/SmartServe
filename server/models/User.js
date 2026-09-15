const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      required: true,
    },
    password: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
    profileImageUrl: { type: String, default: "" },
    lastLoginAt: { type: Date, default: null },
    loginCount: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    // Network & Session Telemetry
    lastLoginIp: { type: String, default: "" },
    lastLoginRegion: { type: String, default: "" },
    lastActiveAt: { type: Date, default: null },
    lastDevice: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model("User", userSchema);

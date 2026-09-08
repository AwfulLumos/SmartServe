const express = require("express");
const router = express.Router();
const { register, login, getMe, getPendingUsers, approveUser, getStaffAccounts, createStaffAccount, deleteStaffAccount } = require("../controllers/authController");
const { forgotPassword, verifyResetCode, resetPassword } = require("../controllers/passwordController");
const { protect, restrictTo } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Password reset flow (public)
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

// Admin-only: list pending accounts & approve
router.get("/pending", protect, restrictTo("admin"), getPendingUsers);
router.put("/approve/:id", protect, restrictTo("admin"), approveUser);

// Staff management
router.get("/staff", protect, restrictTo("admin", "staff"), getStaffAccounts);
router.post("/staff", protect, restrictTo("admin"), createStaffAccount);
router.delete("/staff/:id", protect, restrictTo("admin"), deleteStaffAccount);

module.exports = router;

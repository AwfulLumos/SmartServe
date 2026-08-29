const express = require("express");
const router = express.Router();
const {
	register,
	login,
	getMe,
	getPendingUsers,
	approveUser,
	getStaffAccounts,
	createStaffAccount,
	deleteStaffAccount,
	changePassword,
	resetStaffPassword,
	updateMyProfile,
	uploadMyProfileImage,
	deleteMyProfile,
} = require("../controllers/authController");
const { forgotPassword, verifyResetCode, resetPassword } = require("../controllers/passwordController");
const { protect, restrictTo } = require("../middleware/auth");
const { uploadProfileImage } = require("../middleware/upload");
const {
	validateRegister,
	validateLogin,
	validateCreateStaff,
	validateForgotPassword,
	validateVerifyResetCode,
	validateResetPassword,
	validateChangePassword,
	validateUpdateProfile,
} = require("../middleware/validators");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);
router.patch("/me/profile", protect, validateUpdateProfile, updateMyProfile);
router.post("/me/profile-image", protect, uploadProfileImage.single("profileImage"), uploadMyProfileImage);
router.delete("/me/profile", protect, deleteMyProfile);

// Password reset flow (public)
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verify-reset-code", validateVerifyResetCode, verifyResetCode);
router.post("/reset-password", validateResetPassword, resetPassword);

// Admin-only: list pending accounts & approve
router.get("/pending", protect, restrictTo("admin"), getPendingUsers);
router.put("/approve/:id", protect, restrictTo("admin"), approveUser);

// Staff management
router.get("/staff", protect, restrictTo("admin", "staff"), getStaffAccounts);
router.post("/staff", protect, restrictTo("admin"), validateCreateStaff, createStaffAccount);
router.delete("/staff/:id", protect, restrictTo("admin"), deleteStaffAccount);
router.post("/staff/:id/reset-password", protect, restrictTo("admin"), resetStaffPassword);

// Admin password management
router.patch("/change-password", protect, validateChangePassword, changePassword);

module.exports = router;

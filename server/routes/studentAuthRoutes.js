const express = require("express");
const router = express.Router();
const {
  login,
  getMe,
  updateMe,
  updateMyPhoto,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
} = require("../controllers/studentAuthController");
const { protectStudent } = require("../middleware/studentAuth");
const { uploadProfileImage } = require("../middleware/upload");
const {
  validateStudentLogin,
  validateForgotPassword,
  validateVerifyResetCode,
  validateResetPassword,
  validateChangePassword,
} = require("../middleware/validators");

router.post("/login", validateStudentLogin, login);
router.get("/me", protectStudent, getMe);
router.patch("/me", protectStudent, updateMe);
router.patch("/me/photo", protectStudent, uploadProfileImage.single("profileImage"), updateMyPhoto);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verify-reset-code", validateVerifyResetCode, verifyResetCode);
router.post("/reset-password", validateResetPassword, resetPassword);
router.patch("/change-password", protectStudent, validateChangePassword, changePassword);

module.exports = router;

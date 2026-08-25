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

router.post("/login", login);
router.get("/me", protectStudent, getMe);
router.patch("/me", protectStudent, updateMe);
router.patch("/me/photo", protectStudent, uploadProfileImage.single("profileImage"), updateMyPhoto);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.patch("/change-password", protectStudent, changePassword);

module.exports = router;

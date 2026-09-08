const express = require("express");
const router = express.Router();
const {
  login,
  getMe,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/studentAuthController");
const { protectStudent } = require("../middleware/studentAuth");

router.post("/login", login);
router.get("/me", protectStudent, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { protectStudent } = require("../middleware/studentAuth");
const { getRedemptions, redeemReward, redeemRewardStudent, getStudentRedemptions } = require("../controllers/redemptionController");

// Student routes
router.post("/student", protectStudent, redeemRewardStudent);
router.get("/mine", protectStudent, getStudentRedemptions);

// Admin / staff routes
router.use(protect, restrictTo("admin", "staff"));
router.get("/", getRedemptions);
router.post("/", redeemReward);

module.exports = router;

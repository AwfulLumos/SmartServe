const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    schoolId: { type: String, required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },
    rewardName: { type: String, required: true },
    pointsUsed: { type: Number, required: true },
    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    redeemedByName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Redemption", redemptionSchema);

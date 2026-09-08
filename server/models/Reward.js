const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    type: {
      type: String,
      enum: ["free_item", "discount", "eco_badge"],
      required: true,
    },
    pointsCost: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    icon: {
      type: String,
      enum: ["gift", "star", "leaf"],
      default: "gift",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);

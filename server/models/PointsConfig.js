const mongoose = require("mongoose");

// Singleton document — always only one record with key "default"
const pointsConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    pointsPerPeso: { type: Number, default: 0.1, min: 0 },   // points earned per ₱1 spent on orders
    ecoPointsPerByoc: { type: Number, default: 5, min: 0 },  // eco points per BYOC log
    minRedemptionPoints: { type: Number, default: 30, min: 0 }, // minimum points to redeem a reward
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointsConfig", pointsConfigSchema);

const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Morning", "Lunch", "Snacks", "Beverages", "Others"],
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ isActive: 1, category: 1, createdAt: -1 });
menuItemSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);

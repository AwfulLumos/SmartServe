const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, default: "pcs", trim: true },
    minThreshold: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

// Virtual: derived stock status based on quantity vs threshold
inventoryItemSchema.virtual("status").get(function () {
  if (this.quantity <= 0) return "out_of_stock";
  if (this.quantity <= this.minThreshold) return "low_stock";
  return "in_stock";
});

inventoryItemSchema.set("toJSON", { virtuals: true });
inventoryItemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);

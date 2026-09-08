const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actorType: {
      type: String,
      enum: ["admin", "staff", "student", "system"],
      required: true,
    },
    actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
    actorName: { type: String, default: "System" },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["auth", "student", "inventory", "menu", "order", "reward", "byoc", "config", "system"],
      default: "system",
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Index for fast sorted queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ actorType: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

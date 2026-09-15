const mongoose = require("mongoose");

const networkAclSchema = new mongoose.Schema(
  {
    ruleName: { type: String, required: true, trim: true },
    action: {
      type: String,
      enum: ["ALLOW", "DENY"],
      required: true,
      default: "ALLOW",
    },
    priority: { type: Number, required: true, default: 100 },
    sourceCidr: { type: String, required: true, trim: true }, // e.g. "172.16.0.0/20", "192.168.10.0/24", "*"
    routePattern: { type: String, required: true, trim: true }, // e.g. "/api/inventory/*", "/api/student/*", "*"
    httpMethod: {
      type: String,
      enum: ["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"],
      default: "ALL",
    },
    isEnabled: { type: Boolean, default: true },
    description: { type: String, default: "" },
    hitCount: { type: Number, default: 0 },
    lastHitAt: { type: Date, default: null },
  },
  { timestamps: true }
);

networkAclSchema.index({ priority: 1 });
networkAclSchema.index({ isEnabled: 1, priority: 1 });

module.exports = mongoose.model("NetworkAcl", networkAclSchema);

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Who should see this notification
    recipientType: { type: String, enum: ["admin", "student"], required: true },
    // For student notifications — the student's ObjectId; omit for admin-broadcast
    recipientId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Categorised type for icon/colour selection on the client
    type: {
      type: String,
      enum: ["order_placed", "order_status", "byoc_awarded", "reward_redeemed"],
      required: true,
    },

    title: { type: String, required: true },
    body: { type: String, required: true },

    // Any extra data the client may need (orderId, status, points, …)
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fast lookups: unread count for a recipient
notificationSchema.index({ recipientType: 1, recipientId: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require("mongoose");

const dhcpReservationSchema = new mongoose.Schema(
  {
    deviceName: { type: String, required: true, trim: true },
    deviceType: {
      type: String,
      enum: [
        "admin_pc",
        "admin_laptop",
        "student_phone",
        "other",
      ],
      default: "admin_pc",
    },
    macAddress: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    ipAddress: { type: String, required: true, trim: true },
    vlanId: { type: Number, required: true, default: 10 },
    vlanName: { type: String, default: "VLAN 10 - Admin & Management" },
    leaseType: {
      type: String,
      enum: ["static_reservation", "dynamic_lease"],
      default: "static_reservation",
    },
    leaseDurationHours: { type: Number, default: 24 },
    status: {
      type: String,
      enum: ["online", "offline", "standby"],
      default: "online",
    },
    lastSeen: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

dhcpReservationSchema.index({ ipAddress: 1 }, { unique: true });
dhcpReservationSchema.index({ macAddress: 1 });
dhcpReservationSchema.index({ vlanId: 1 });

module.exports = mongoose.model("DhcpReservation", dhcpReservationSchema);

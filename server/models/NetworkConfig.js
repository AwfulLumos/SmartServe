const mongoose = require("mongoose");

const campusSubnetSchema = new mongoose.Schema(
  {
    vlanId: { type: Number, required: true },
    name: { type: String, required: true },
    cidr: { type: String, required: true },
    gateway: { type: String, required: true },
    dhcpRange: { type: String, required: true },
    purpose: { type: String, default: "" },
  },
  { _id: false }
);

const networkConfigSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["audit_only", "enforce", "disabled"],
      default: "audit_only", // Safe default so nobody is locked out
    },
    defaultAction: {
      type: String,
      enum: ["ALLOW", "DENY"],
      default: "ALLOW",
    },
    allowLocalhostBypass: {
      type: Boolean,
      default: true,
    },
    subnets: {
      type: [campusSubnetSchema],
      default: [
        {
          vlanId: 10,
          name: "VLAN 10 - Admin & Management Network",
          cidr: "192.168.1.0/24",
          gateway: "192.168.1.1",
          dhcpRange: "Static Reservation / 192.168.1.50 - 192.168.1.100",
          purpose: "Administrator PCs, laptops, and central SmartServe server",
        },
        {
          vlanId: 20,
          name: "VLAN 20 - Student Mobile Wi-Fi Network",
          cidr: "172.16.0.0/20",
          gateway: "172.16.0.1",
          dhcpRange: "Dynamic DHCP (2hr lease) / 172.16.1.1 - 172.16.15.254",
          purpose: "Student personal smartphones connecting for mobile portal access and points",
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NetworkConfig", networkConfigSchema);

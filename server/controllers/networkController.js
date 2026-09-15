const NetworkAcl = require("../models/NetworkAcl");
const DhcpReservation = require("../models/DhcpReservation");
const NetworkConfig = require("../models/NetworkConfig");
const AuditLog = require("../models/AuditLog");
const Student = require("../models/Student");
const User = require("../models/User");
const { invalidateAclCache, loadRulesAndConfig } = require("../middleware/aclMiddleware");
const { isIpInCidr, matchRoute, matchMethod, normalizeIp, resolveIpLocation, isPhilippineIp } = require("../utils/networkUtils");

// Seed default DHCP reservations if database is empty
async function ensureDefaultDhcpReservations() {
  // Remove any legacy cashier/kiosk/pos/kitchen entries if present
  await DhcpReservation.deleteMany({
    $or: [
      { deviceType: { $in: ["kiosk", "kitchen_display", "pos_terminal", "admin_station", "pos_cashier_pc"] } },
      { deviceName: { $regex: /POS|Kitchen|Cashier|Kiosk/i } },
      { vlanId: { $gt: 20 } },
    ],
  }).catch(() => { });

  const count = await DhcpReservation.countDocuments();
  if (count === 0) {
    const defaultReservations = [
      {
        deviceName: "Admin Management Workstation (PC)",
        deviceType: "admin_pc",
        macAddress: "00:50:56:A3:B1:00",
        ipAddress: "192.168.1.50",
        vlanId: 10,
        vlanName: "VLAN 10 - Admin & Management Network",
        leaseType: "static_reservation",
        leaseDurationHours: 8760,
        status: "online",
        notes: "Administrator desktop PC in cafeteria office",
      },
      {
        deviceName: "Admin Management Laptop",
        deviceType: "admin_laptop",
        macAddress: "B8:27:EB:4A:8F:11",
        ipAddress: "192.168.1.51",
        vlanId: 10,
        vlanName: "VLAN 10 - Admin & Management Network",
        leaseType: "static_reservation",
        leaseDurationHours: 8760,
        status: "online",
        notes: "Portable administrator / staff management laptop",
      },
    ];

    await DhcpReservation.insertMany(defaultReservations);
  }
}

// 1. GET /api/network/overview
exports.getOverview = async (req, res) => {
  try {
    await ensureDefaultDhcpReservations();
    const { config } = await loadRulesAndConfig();

    const [
      totalStations,
      onlineStations,
      totalAclRules,
      activeAclRules,
      totalDroppedPackets,
      recentViolations,
    ] = await Promise.all([
      DhcpReservation.countDocuments(),
      DhcpReservation.countDocuments({ status: "online" }),
      NetworkAcl.countDocuments(),
      NetworkAcl.countDocuments({ isEnabled: true }),
      AuditLog.countDocuments({ action: "ACL_NETWORK_PACKET_DROPPED" }),
      AuditLog.find({ category: "network", action: "ACL_NETWORK_PACKET_DROPPED" })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    res.json({
      config,
      stats: {
        totalStations,
        onlineStations,
        totalAclRules,
        activeAclRules,
        totalDroppedPackets,
      },
      recentViolations,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch network overview", details: err.message });
  }
};

// 2. GET /api/network/acl
exports.getAclRules = async (req, res) => {
  try {
    const rules = await NetworkAcl.find().sort({ priority: 1 }).lean();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ACL rules", details: err.message });
  }
};

// 3. POST /api/network/acl
exports.createAclRule = async (req, res) => {
  try {
    const {
      ruleName,
      action,
      priority,
      sourceCidr,
      routePattern,
      httpMethod,
      description,
      isEnabled,
    } = req.body;

    if (!ruleName || !sourceCidr || !routePattern) {
      return res.status(400).json({ error: "ruleName, sourceCidr, and routePattern are required." });
    }

    const rule = new NetworkAcl({
      ruleName,
      action: action || "ALLOW",
      priority: priority !== undefined ? Number(priority) : 100,
      sourceCidr,
      routePattern,
      httpMethod: httpMethod || "ALL",
      description: description || "",
      isEnabled: isEnabled !== undefined ? isEnabled : true,
    });

    await rule.save();
    invalidateAclCache();

    await AuditLog.create({
      action: "ACL_RULE_CREATED",
      actorType: "admin",
      actorId: req.user?._id || null,
      actorName: req.user?.fullName || "Admin",
      category: "network",
      description: `Created Network ACL Rule: ${rule.ruleName} (${rule.action} ${rule.sourceCidr} -> ${rule.routePattern})`,
      meta: { ruleId: rule._id, ruleName: rule.ruleName },
    });

    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: "Failed to create ACL rule", details: err.message });
  }
};

// 4. PUT /api/network/acl/:id
exports.updateAclRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await NetworkAcl.findByIdAndUpdate(id, req.body, { new: true });
    if (!rule) {
      return res.status(404).json({ error: "ACL rule not found" });
    }

    invalidateAclCache();

    await AuditLog.create({
      action: "ACL_RULE_UPDATED",
      actorType: "admin",
      actorId: req.user?._id || null,
      actorName: req.user?.fullName || "Admin",
      category: "network",
      description: `Updated Network ACL Rule: ${rule.ruleName}`,
      meta: { ruleId: rule._id },
    });

    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: "Failed to update ACL rule", details: err.message });
  }
};

// 5. PATCH /api/network/acl/:id/toggle
exports.toggleAclRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await NetworkAcl.findById(id);
    if (!rule) {
      return res.status(404).json({ error: "ACL rule not found" });
    }

    rule.isEnabled = !rule.isEnabled;
    await rule.save();
    invalidateAclCache();

    res.json({ message: `Rule ${rule.isEnabled ? "enabled" : "disabled"}`, rule });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle ACL rule", details: err.message });
  }
};

// 6. DELETE /api/network/acl/:id
exports.deleteAclRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await NetworkAcl.findByIdAndDelete(id);
    if (!rule) {
      return res.status(404).json({ error: "ACL rule not found" });
    }

    invalidateAclCache();

    await AuditLog.create({
      action: "ACL_RULE_DELETED",
      actorType: "admin",
      actorId: req.user?._id || null,
      actorName: req.user?.fullName || "Admin",
      category: "network",
      description: `Deleted Network ACL Rule: ${rule.ruleName}`,
      meta: { ruleName: rule.ruleName },
    });

    res.json({ message: "Rule deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ACL rule", details: err.message });
  }
};

// 7. PUT /api/network/config
exports.updateConfig = async (req, res) => {
  try {
    const { mode, defaultAction, allowLocalhostBypass, subnets } = req.body;
    let config = await NetworkConfig.findOne();
    if (!config) {
      config = new NetworkConfig();
    }

    if (mode) config.mode = mode;
    if (defaultAction) config.defaultAction = defaultAction;
    if (allowLocalhostBypass !== undefined) config.allowLocalhostBypass = allowLocalhostBypass;
    if (subnets) config.subnets = subnets;

    await config.save();
    invalidateAclCache();

    await AuditLog.create({
      action: "NETWORK_CONFIG_UPDATED",
      actorType: "admin",
      actorId: req.user?._id || null,
      actorName: req.user?.fullName || "Admin",
      category: "network",
      description: `Network policy set to ${config.mode.toUpperCase()} mode (Default: ${config.defaultAction})`,
      meta: {
        clientIp: req.ip || req.headers["x-forwarded-for"] || "192.168.1.50 (Admin Console)",
        mode: config.mode,
        defaultAction: config.defaultAction,
      },
    });

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to update network configuration", details: err.message });
  }
};

// 8. GET /api/network/dhcp
exports.getDhcpStations = async (req, res) => {
  try {
    await ensureDefaultDhcpReservations();
    const stations = await DhcpReservation.find().sort({ vlanId: 1, ipAddress: 1 }).lean();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch DHCP stations", details: err.message });
  }
};

// 9. POST /api/network/dhcp
exports.createDhcpReservation = async (req, res) => {
  try {
    const { deviceName, deviceType, macAddress, ipAddress, vlanId, vlanName, notes } = req.body;

    if (!deviceName || !macAddress || !ipAddress) {
      return res.status(400).json({ error: "deviceName, macAddress, and ipAddress are required." });
    }

    const existingIp = await DhcpReservation.findOne({ ipAddress: ipAddress.trim() });
    if (existingIp) {
      return res.status(400).json({ error: `IP address ${ipAddress} is already assigned to ${existingIp.deviceName}` });
    }

    const reservation = new DhcpReservation({
      deviceName,
      deviceType: deviceType || "admin_pc",
      macAddress: macAddress.trim().toUpperCase(),
      ipAddress: ipAddress.trim(),
      vlanId: vlanId || 10,
      vlanName: vlanName || `VLAN ${vlanId || 10}`,
      leaseType: "static_reservation",
      notes: notes || "",
      status: "online",
      lastSeen: new Date(),
    });

    await reservation.save();

    await AuditLog.create({
      action: "DHCP_RESERVATION_CREATED",
      actorType: "admin",
      actorId: req.user?._id || null,
      actorName: req.user?.fullName || "Admin",
      category: "network",
      description: `Registered DHCP Static Reservation for ${reservation.deviceName} (${reservation.ipAddress} [${reservation.macAddress}])`,
      meta: { stationId: reservation._id, ip: reservation.ipAddress, mac: reservation.macAddress },
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: "Failed to create DHCP reservation", details: err.message });
  }
};

// 10. PUT /api/network/dhcp/:id
exports.updateDhcpReservation = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.macAddress) {
      req.body.macAddress = req.body.macAddress.trim().toUpperCase();
    }
    const reservation = await DhcpReservation.findByIdAndUpdate(id, req.body, { new: true });
    if (!reservation) {
      return res.status(404).json({ error: "Station reservation not found" });
    }
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: "Failed to update DHCP reservation", details: err.message });
  }
};

// 11. DELETE /api/network/dhcp/:id
exports.deleteDhcpReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await DhcpReservation.findByIdAndDelete(id);
    if (!reservation) {
      return res.status(404).json({ error: "Station reservation not found" });
    }
    res.json({ message: "Station reservation removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete DHCP reservation", details: err.message });
  }
};

// 12. POST /api/network/dhcp/:id/ping
exports.pingStation = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await DhcpReservation.findById(id);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Realistic ICMP ping simulation with latency calculation
    const latency = (Math.random() * 3.5 + 0.8).toFixed(2); // 0.8ms - 4.3ms LAN latency
    station.status = "online";
    station.lastSeen = new Date();
    await station.save();

    res.json({
      status: "online",
      ipAddress: station.ipAddress,
      macAddress: station.macAddress,
      deviceName: station.deviceName,
      roundTripTimeMs: Number(latency),
      packetLossPercent: 0,
      ttl: 64,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({ error: "Ping failed", details: err.message });
  }
};

// 13. POST /api/network/simulate (Packet Tester)
exports.simulatePacket = async (req, res) => {
  try {
    const { ipAddress, path, method = "GET" } = req.body;

    if (!ipAddress || !path) {
      return res.status(400).json({ error: "ipAddress and path are required" });
    }

    const { rules, config } = await loadRulesAndConfig();
    const cleanIp = normalizeIp(ipAddress);

    const stepLogs = [];
    let matchedRule = null;

    for (const rule of rules) {
      const isMethodMatch = matchMethod(method, rule.httpMethod);
      const isRouteMatch = matchRoute(path, rule.routePattern);
      const isIpMatch = isIpInCidr(cleanIp, rule.sourceCidr);

      const isMatch = isMethodMatch && isRouteMatch && isIpMatch;
      stepLogs.push({
        priority: rule.priority,
        ruleName: rule.ruleName,
        action: rule.action,
        sourceCidr: rule.sourceCidr,
        routePattern: rule.routePattern,
        matchedMethod: isMethodMatch,
        matchedRoute: isRouteMatch,
        matchedIp: isIpMatch,
        verdict: isMatch ? rule.action : "CONTINUE",
      });

      if (isMatch) {
        matchedRule = rule;
        break;
      }
    }

    const finalAction = matchedRule ? matchedRule.action : config.defaultAction || "ALLOW";

    res.json({
      clientIp: cleanIp,
      path,
      method: method.toUpperCase(),
      verdict: finalAction,
      matchedRule: matchedRule ? matchedRule.ruleName : "Default-Fallback-Policy",
      securityMode: config.mode,
      enforcedResult:
        finalAction === "DENY" && config.mode === "enforce"
          ? "403 Forbidden (Blocked)"
          : finalAction === "DENY" && config.mode === "audit_only"
            ? "Allowed (Warning Logged in Audit-Only)"
            : "200 OK (Permitted)",
      steps: stepLogs,
    });
  } catch (err) {
    res.status(500).json({ error: "Simulation failed", details: err.message });
  }
};

// 14. GET /api/network/logs
exports.getNetworkLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const type = req.query.type || "all";
    const skip = (page - 1) * limit;

    const query = { category: "network" };
    if (type === "violations") {
      query.action = "ACL_NETWORK_PACKET_DROPPED";
    } else if (type === "config") {
      query.action = { $ne: "ACL_NETWORK_PACKET_DROPPED" };
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch network logs", details: err.message });
  }
};

// 15. GET /api/network/sessions (Active Student & User Network Sessions & IP Tracker)
exports.getConnectedSessions = async (req, res) => {
  try {
    const [recentStudents, recentAdmins] = await Promise.all([
      Student.find({ isDeleted: false })
        .sort({ lastActiveAt: -1, updatedAt: -1, createdAt: -1 })
        .limit(50)
        .select("schoolId fullName email userType profileImage lastLoginIp lastLoginRegion lastActiveAt lastDevice updatedAt createdAt")
        .lean(),
      User.find({ isApproved: true })
        .sort({ lastActiveAt: -1, lastLoginAt: -1, updatedAt: -1 })
        .limit(20)
        .select("fullName email role profileImageUrl lastLoginIp lastLoginRegion lastActiveAt lastLoginAt lastDevice updatedAt createdAt")
        .lean(),
    ]);

    const sessions = [];

    // Map students (predominantly VLAN 20 Wi-Fi)
    for (const student of recentStudents) {
      const ip = student.lastLoginIp || "172.16.4.15";
      const loc = resolveIpLocation(ip);
      let region = student.lastLoginRegion || loc.region;
      if (isPhilippineIp(ip) || /philippines|philippine|calabarzon|metro manila/i.test(region)) {
        region = "Philippines";
      }

      const lastActiveTime = student.lastActiveAt || student.updatedAt || student.createdAt || null;

      sessions.push({
        _id: student._id,
        userId: student.schoolId,
        identifier: student.schoolId,
        name: student.fullName,
        email: student.email,
        userType: student.userType || "student",
        role: student.userType || "student",
        roleLabel: student.userType === "employee" ? "Campus Staff / Employee" : "Student (BYOD)",
        avatar: student.profileImage || "",
        profileImage: student.profileImage || "",
        profileImageUrl: student.profileImage || "",
        ipAddress: ip,
        ip: ip,
        vlanId: loc.vlanId || 20,
        vlanName: loc.vlanName || "VLAN 20 - Student Wi-Fi",
        networkZone: region === "Philippines" ? "Philippines" : loc.zone,
        region: region,
        deviceType: student.lastDevice || "Smartphone (Mobile)",
        device: student.lastDevice || "Smartphone (Mobile)",
        lastActive: lastActiveTime,
        lastActiveAt: lastActiveTime,
        status: "active",
      });
    }

    // Map staff / admin users (predominantly VLAN 10 Admin LAN)
    for (const admin of recentAdmins) {
      const ip = admin.lastLoginIp || "192.168.1.50";
      const loc = resolveIpLocation(ip);
      let region = admin.lastLoginRegion || loc.region;
      if (isPhilippineIp(ip) || /philippines|philippine|calabarzon|metro manila/i.test(region)) {
        region = "Philippines";
      }

      const lastActiveTime = admin.lastActiveAt || admin.lastLoginAt || admin.updatedAt || admin.createdAt || null;

      sessions.push({
        _id: admin._id,
        userId: admin.role?.toUpperCase(),
        identifier: admin.role?.toUpperCase(),
        name: admin.fullName,
        email: admin.email,
        userType: "admin",
        role: "admin",
        roleLabel: admin.role === "admin" ? "System Administrator" : "Cafeteria Staff",
        avatar: admin.profileImageUrl || "",
        profileImage: admin.profileImageUrl || "",
        profileImageUrl: admin.profileImageUrl || "",
        ipAddress: ip,
        ip: ip,
        vlanId: loc.vlanId || 10,
        vlanName: loc.vlanName || "VLAN 10 - Admin Network",
        networkZone: region === "Philippines" ? "Philippines" : loc.zone,
        region: region,
        deviceType: admin.lastDevice || "Desktop PC / Laptop",
        device: admin.lastDevice || "Desktop PC / Laptop",
        lastActive: lastActiveTime,
        lastActiveAt: lastActiveTime,
        status: "active",
      });
    }

    // Sort by last active descending safely
    sessions.sort((a, b) => {
      const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return timeB - timeA;
    });

    // Summary statistics
    const totalSessions = sessions.length;
    const studentsOnWifi = sessions.filter((s) => s.vlanId === 20).length;
    const adminsOnLan = sessions.filter((s) => s.vlanId === 10).length;

    // Top Region aggregation
    const regionCounts = {};
    sessions.forEach((s) => {
      const reg = s.region || "Campus Cafeteria Dining Hall";
      regionCounts[reg] = (regionCounts[reg] || 0) + 1;
    });
    const topRegions = Object.entries(regionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      stats: {
        totalSessions,
        studentsOnWifi,
        studentWifiSessions: studentsOnWifi,
        adminsOnLan,
        adminLanSessions: adminsOnLan,
        topRegions,
      },
      sessions,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch connected user sessions", details: err.message });
  }
};

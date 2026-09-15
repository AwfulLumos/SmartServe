const NetworkAcl = require("../models/NetworkAcl");
const NetworkConfig = require("../models/NetworkConfig");
const AuditLog = require("../models/AuditLog");
const { getIO } = require("../socket");
const {
  extractClientIp,
  isLoopback,
  isIpInCidr,
  matchRoute,
  matchMethod,
} = require("../utils/networkUtils");

// In-memory cache for fast evaluation without DB hit on every HTTP packet
let cachedRules = null;
let cachedConfig = null;
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 10000; // 10 seconds auto-refresh or immediate invalidation

async function loadRulesAndConfig(force = false) {
  const now = Date.now();
  if (!force && cachedRules && cachedConfig && now - lastCacheUpdate < CACHE_TTL_MS) {
    return { rules: cachedRules, config: cachedConfig };
  }

  try {
    let [rules, config] = await Promise.all([
      NetworkAcl.find({ isEnabled: true }).sort({ priority: 1 }).lean(),
      NetworkConfig.findOne().lean(),
    ]);

    const DEFAULT_CAMPUS_SUBNETS = [
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
    ];

    // Seed default config if none exists
    if (!config) {
      const newConfig = new NetworkConfig({ subnets: DEFAULT_CAMPUS_SUBNETS });
      config = await newConfig.save();
    } else {
      // Migrate existing DB config to ensure legacy POS/Kitchen subnets are removed
      const hasLegacy =
        !config.subnets ||
        config.subnets.length !== 2 ||
        config.subnets.some((s) => s.vlanId > 20 || /pos|cashier|kitchen|kds/i.test(s.name));

      if (hasLegacy) {
        await NetworkConfig.updateOne(
          { _id: config._id },
          { $set: { subnets: DEFAULT_CAMPUS_SUBNETS } }
        );
        config.subnets = DEFAULT_CAMPUS_SUBNETS;
      }
    }

    // Clean up any legacy POS/Cashier/Kitchen ACL rules
    await NetworkAcl.deleteMany({
      ruleName: { $regex: /POS|Cashier|Kitchen|Kiosk/i },
    }).catch(() => { });

    // Seed default ACL rules if none exist
    if (!rules || rules.length === 0) {
      const defaultRules = [
        {
          ruleName: "Allow-Admin-Full-Access",
          action: "ALLOW",
          priority: 10,
          sourceCidr: "192.168.1.0/24",
          routePattern: "/*",
          httpMethod: "ALL",
          description: "VLAN 10 Admin management subnet has unrestricted API access",
        },
        {
          ruleName: "Allow-Student-Portal-Routes",
          action: "ALLOW",
          priority: 20,
          sourceCidr: "172.16.0.0/20",
          routePattern: "/api/student/*",
          httpMethod: "ALL",
          description: "VLAN 20 Student Mobile Wi-Fi can access student authentication and portal routes",
        },
        {
          ruleName: "Deny-Student-Admin-Access",
          action: "DENY",
          priority: 30,
          sourceCidr: "172.16.0.0/20",
          routePattern: "/api/audit-logs/*",
          httpMethod: "ALL",
          description: "Prevent student phones from querying internal audit logs",
        },
        {
          ruleName: "Deny-Student-Inventory-Access",
          action: "DENY",
          priority: 40,
          sourceCidr: "172.16.0.0/20",
          routePattern: "/api/inventory/*",
          httpMethod: "ALL",
          description: "Prevent student phones from reading or modifying staff inventory",
        },
        {
          ruleName: "Deny-Student-Orders-Management",
          action: "DENY",
          priority: 50,
          sourceCidr: "172.16.0.0/20",
          routePattern: "/api/orders/*",
          httpMethod: "ALL",
          description: "Block student phones from directly managing or manipulating staff orders",
        },
        {
          ruleName: "Deny-Student-Points-Config",
          action: "DENY",
          priority: 60,
          sourceCidr: "172.16.0.0/20",
          routePattern: "/api/points-config/*",
          httpMethod: "ALL",
          description: "Block student phones from tampering with cafeteria points configuration",
        },
      ];

      await NetworkAcl.insertMany(defaultRules);
      rules = await NetworkAcl.find({ isEnabled: true }).sort({ priority: 1 }).lean();
    }

    cachedRules = rules;
    cachedConfig = config;
    lastCacheUpdate = now;
  } catch (err) {
    console.error("Failed to load Network ACL rules / config:", err.message);
  }

  return { rules: cachedRules || [], config: cachedConfig || { mode: "audit_only", defaultAction: "ALLOW" } };
}

function invalidateAclCache() {
  cachedRules = null;
  cachedConfig = null;
  lastCacheUpdate = 0;
}

// Main ACL Middleware
async function aclMiddleware(req, res, next) {
  // Always exempt health check, static files, and network configuration endpoints
  if (
    req.path === "/api/health" ||
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/api/network")
  ) {
    return next();
  }

  const { rules, config } = await loadRulesAndConfig();

  if (config.mode === "disabled") {
    return next();
  }

  const clientIp = extractClientIp(req);
  const isDevLoopback = isLoopback(clientIp) && !req.headers["x-simulated-ip"];

  // Localhost developer bypass unless explicitly testing with X-Simulated-IP
  if (config.allowLocalhostBypass && isDevLoopback) {
    return next();
  }

  let matchedRule = null;

  for (const rule of rules) {
    const isMethodMatch = matchMethod(req.method, rule.httpMethod);
    const isRouteMatch = matchRoute(req.path, rule.routePattern);
    const isIpMatch = isIpInCidr(clientIp, rule.sourceCidr);

    if (isMethodMatch && isRouteMatch && isIpMatch) {
      matchedRule = rule;
      break;
    }
  }

  const finalAction = matchedRule ? matchedRule.action : config.defaultAction || "ALLOW";

  // Async update rule hit count (fire & forget to avoid slowing request)
  if (matchedRule) {
    NetworkAcl.updateOne(
      { _id: matchedRule._id },
      { $inc: { hitCount: 1 }, $set: { lastHitAt: new Date() } }
    ).catch(() => { });
  }

  if (finalAction === "DENY") {
    const violationInfo = {
      clientIp,
      path: req.path,
      method: req.method,
      matchedRule: matchedRule ? matchedRule.ruleName : "Default-Deny-Policy",
      sourceCidr: matchedRule ? matchedRule.sourceCidr : "*",
      timestamp: new Date(),
    };

    // Log to AuditLog asynchronously
    AuditLog.create({
      action: "ACL_NETWORK_PACKET_DROPPED",
      actorType: "system",
      actorName: "Network ACL Firewall",
      category: "network",
      description: `Blocked ${req.method} request to ${req.path} from IP ${clientIp} matching rule '${violationInfo.matchedRule}'`,
      meta: violationInfo,
    }).catch((e) => console.error("AuditLog error:", e.message));

    // Emit live security alert to admin socket room
    try {
      const io = getIO();
      if (io) {
        io.to("admin").emit("network:acl_blocked", violationInfo);
      }
    } catch { }

    // In Audit-Only mode, allow request through with warning headers
    if (config.mode === "audit_only") {
      res.setHeader("X-ACL-Warning", `Audit Only: Request from ${clientIp} would be blocked by rule ${violationInfo.matchedRule}`);
      return next();
    }

    // In Enforce mode, actively drop/reject request
    return res.status(403).json({
      error: "Access Denied by Campus Network ACL Policy",
      code: "NETWORK_ACL_VIOLATION",
      clientIp,
      matchedRule: violationInfo.matchedRule,
      path: req.path,
    });
  }

  next();
}

module.exports = {
  aclMiddleware,
  loadRulesAndConfig,
  invalidateAclCache,
};

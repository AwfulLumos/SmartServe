/**
 * Network Utilities for IP calculation, CIDR matching, and route wildcard evaluation.
 */

// Convert IPv4 string to 32-bit unsigned number
function ipToLong(ip) {
  if (!ip) return 0;
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return 0;
  }
  return (((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0)) >>> 0;
}

// Clean IP string (strip ::ffff: or normalize IPv6 loopback)
function normalizeIp(rawIp) {
  if (!rawIp) return "127.0.0.1";
  let ip = String(rawIp).trim();
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  if (ip === "::1" || ip === "localhost") {
    return "127.0.0.1";
  }
  return ip;
}

// Check if an IPv4 is within a given CIDR (e.g. "172.16.0.0/20")
function isIpInCidr(ip, cidr) {
  if (!ip || !cidr) return false;
  const cleanIp = normalizeIp(ip);
  const cleanCidr = cidr.trim();

  if (cleanCidr === "*" || cleanCidr === "0.0.0.0/0" || cleanCidr === "ANY") {
    return true;
  }

  let [network, prefixStr] = cleanCidr.split("/");
  let prefix = prefixStr !== undefined ? parseInt(prefixStr, 10) : 32;

  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    prefix = 32;
  }

  const ipNum = ipToLong(cleanIp);
  const netNum = ipToLong(network);

  if (prefix === 0) return true;

  const mask = ((0xffffffff << (32 - prefix)) >>> 0);
  return ((ipNum & mask) >>> 0) === ((netNum & mask) >>> 0);
}

// Check if IP is loopback or local machine
function isLoopback(ip) {
  const cleanIp = normalizeIp(ip);
  return cleanIp.startsWith("127.") || cleanIp === "::1" || cleanIp === "localhost";
}

// Match URL path against route pattern (supports wildcard *)
function matchRoute(routePath, pattern) {
  if (!routePath || !pattern) return false;
  const cleanPath = routePath.split("?")[0].toLowerCase();
  const cleanPattern = pattern.trim().toLowerCase();

  if (cleanPattern === "*" || cleanPattern === "any") return true;

  if (cleanPattern.endsWith("/*")) {
    const base = cleanPattern.slice(0, -2);
    return cleanPath === base || cleanPath.startsWith(`${base}/`);
  }

  if (cleanPattern.endsWith("*")) {
    const base = cleanPattern.slice(0, -1);
    return cleanPath.startsWith(base);
  }

  return cleanPath === cleanPattern;
}

// Match HTTP method
function matchMethod(reqMethod, ruleMethod) {
  if (!ruleMethod || ruleMethod === "ALL" || ruleMethod === "*") return true;
  return String(reqMethod).toUpperCase() === String(ruleMethod).toUpperCase();
}

// Extract client IP with support for proxy headers and optional simulator header
function extractClientIp(req, allowSimulated = true) {
  // Allow X-Simulated-IP for testing/demonstrations
  if (allowSimulated && req.headers["x-simulated-ip"]) {
    return normalizeIp(req.headers["x-simulated-ip"]);
  }

  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    if (ips.length > 0 && ips[0]) {
      return normalizeIp(ips[0]);
    }
  }

  return normalizeIp(req.ip || req.socket?.remoteAddress || "127.0.0.1");
}

// Resolve network zone and geographic region from IP
function resolveIpLocation(ip) {
  const cleanIp = normalizeIp(ip);

  // 1. VLAN 10 Check: Campus Admin LAN
  if (isIpInCidr(cleanIp, "192.168.1.0/24")) {
    return {
      vlanId: 10,
      vlanName: "VLAN 10 - Admin Network",
      zone: "Campus Admin LAN (Office / Management)",
      region: "Campus Admin Building, Bulacan / NCR",
      isInternal: true,
    };
  }

  // 2. VLAN 20 Check: Campus Cafeteria Student Wi-Fi
  if (isIpInCidr(cleanIp, "172.16.0.0/20")) {
    return {
      vlanId: 20,
      vlanName: "VLAN 20 - Student Wi-Fi",
      zone: "Campus Cafeteria Wi-Fi (Student BYOD Zone)",
      region: "School Cafeteria Dining Hall, Bulacan / NCR",
      isInternal: true,
    };
  }

  // 3. Loopback / Developer Station
  if (isLoopback(cleanIp)) {
    return {
      vlanId: 10,
      vlanName: "VLAN 10 - Localhost Gateway",
      zone: "Localhost / Developer Workstation",
      region: "Campus Server Room (Local Loopback)",
      isInternal: true,
    };
  }

  // 4. Other Private Subnets
  if (
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("172.")
  ) {
    return {
      vlanId: 0,
      vlanName: "External Private LAN",
      zone: "Campus Intranet / Auxiliary Subnet",
      region: "Campus Facilities / Local LAN",
      isInternal: true,
    };
  }

  // 5. External Public IP (Recognized as Philippines Internet / Cellular WAN)
  return {
    vlanId: 0,
    vlanName: "External Internet / Cellular WAN",
    zone: "Philippines",
    region: "Philippines",
    isInternal: false,
  };
}

// Parse device form factor from User-Agent string
function parseDeviceFormFactor(userAgent = "") {
  const ua = String(userAgent).toLowerCase();
  if (/android|iphone|ipod|mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    return "Smartphone (Mobile)";
  }
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    return "Tablet Device";
  }
  if (/windows|macintosh|linux/i.test(ua)) {
    return "Desktop PC / Laptop";
  }
  return "Unknown Device";
}

// Check if an IP is a public external IP recognized as Philippine connection
function isPhilippineIp(ip) {
  if (!ip) return false;
  const clean = normalizeIp(ip);
  if (isLoopback(clean) || clean.startsWith("10.") || clean.startsWith("192.168.") || isIpInCidr(clean, "172.16.0.0/12")) {
    return false;
  }
  return true;
}

module.exports = {
  ipToLong,
  normalizeIp,
  isIpInCidr,
  isLoopback,
  matchRoute,
  matchMethod,
  extractClientIp,
  resolveIpLocation,
  parseDeviceFormFactor,
  isPhilippineIp,
};

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Keep user's lastActiveAt and IP telemetry freshly updated (throttled to at most once per 30s)
    try {
      const now = Date.now();
      const lastActiveTime = req.user.lastActiveAt ? new Date(req.user.lastActiveAt).getTime() : 0;
      if (!req.user.lastLoginIp || now - lastActiveTime > 30000) {
        const { extractClientIp, resolveIpLocation, parseDeviceFormFactor } = require("../utils/networkUtils");
        const clientIp = extractClientIp(req);
        const loc = resolveIpLocation(clientIp);
        const device = parseDeviceFormFactor(req.headers["user-agent"]);

        req.user.lastActiveAt = new Date(now);
        if (clientIp) req.user.lastLoginIp = clientIp;
        if (loc.region) req.user.lastLoginRegion = loc.region;
        if (device) req.user.lastDevice = device;

        User.updateOne(
          { _id: req.user._id },
          {
            $set: {
              lastActiveAt: new Date(now),
              ...(clientIp ? { lastLoginIp: clientIp } : {}),
              ...(loc.region ? { lastLoginRegion: loc.region } : {}),
              ...(device ? { lastDevice: device } : {}),
            },
          }
        ).catch(() => { });
      }
    } catch {
      // Silently continue if telemetry resolution fails
    }

    next();
  } catch {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { protect, restrictTo };

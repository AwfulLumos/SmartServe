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

    // Auto-stamp client IP telemetry for active sessions if missing
    if (!req.user.lastLoginIp) {
      try {
        const { extractClientIp, resolveIpLocation, parseDeviceFormFactor } = require("../utils/networkUtils");
        const clientIp = extractClientIp(req);
        const loc = resolveIpLocation(clientIp);
        const device = parseDeviceFormFactor(req.headers["user-agent"]);
        req.user.lastLoginIp = clientIp;
        req.user.lastLoginRegion = loc.region;
        req.user.lastDevice = device;
        req.user.lastActiveAt = new Date();

        User.updateOne(
          { _id: req.user._id },
          {
            $set: {
              lastLoginIp: clientIp,
              lastLoginRegion: loc.region,
              lastDevice: device,
              lastActiveAt: new Date(),
            },
          }
        ).catch(() => { });
      } catch (err) {
        // Silently continue if telemetry resolution fails
      }
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

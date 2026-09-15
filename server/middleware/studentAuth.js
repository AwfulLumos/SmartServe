const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const protectStudent = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.student_token) {
    token = req.cookies.student_token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type && decoded.type !== "student") {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.student = await Student.findById(decoded.id);
    if (!req.student) {
      return res.status(401).json({ message: "Student not found" });
    }

    // Keep student's lastActiveAt and IP telemetry freshly updated (throttled to at most once per 30s)
    try {
      const now = Date.now();
      const lastActiveTime = req.student.lastActiveAt ? new Date(req.student.lastActiveAt).getTime() : 0;
      if (!req.student.lastLoginIp || now - lastActiveTime > 30000) {
        const { extractClientIp, resolveIpLocation, parseDeviceFormFactor } = require("../utils/networkUtils");
        const clientIp = extractClientIp(req);
        const loc = resolveIpLocation(clientIp);
        const device = parseDeviceFormFactor(req.headers["user-agent"]);

        req.student.lastActiveAt = new Date(now);
        if (clientIp) req.student.lastLoginIp = clientIp;
        if (loc.region) req.student.lastLoginRegion = loc.region;
        if (device) req.student.lastDevice = device;

        Student.updateOne(
          { _id: req.student._id },
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

module.exports = { protectStudent };

const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const protectStudent = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "student") {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.student = await Student.findById(decoded.id).select("-password -resetCode -resetCodeExpiry");
    if (!req.student) {
      return res.status(401).json({ message: "Student not found" });
    }
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { protectStudent };

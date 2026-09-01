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
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { protectStudent };

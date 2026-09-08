const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { sendResetCode } = require("../config/mailer");
const logAudit = require("../utils/auditLogger");

const generateToken = (id) =>
  jwt.sign({ id, type: "student" }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/student/auth/login
exports.login = async (req, res) => {
  try {
    const { schoolId, password } = req.body;

    if (!schoolId || !password) {
      return res.status(400).json({ message: "School ID and password are required" });
    }

    const student = await Student.findOne({ schoolId: schoolId.toUpperCase().trim() });
    if (!student || !(await student.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid School ID or password" });
    }

    if (!student.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact your school administrator." });
    }

    logAudit({
      action: "Student Login",
      actorType: "student",
      actorId: student._id,
      actorName: student.fullName,
      description: `${student.fullName} (${student.schoolId}) signed in`,
      category: "auth",
    });

    res.json({
      _id: student._id,
      schoolId: student.schoolId,
      fullName: student.fullName,
      email: student.email,
      userType: student.userType ?? "student",
      gradeLevel: student.gradeLevel,
      section: student.section,
      jobTitle: student.jobTitle,
      department: student.department,
      points: student.points,
      byocCount: student.byocCount,
      qrToken: student.qrToken,
      token: generateToken(student._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/student/auth/me  (protected)
exports.getMe = async (req, res) => {
  res.json(req.student);
};

// POST /api/student/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { schoolId, email } = req.body;

    if (!schoolId || !email) {
      return res.status(400).json({ message: "School ID and email are required" });
    }

    const student = await Student.findOne({
      schoolId: schoolId.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
    });

    // Always 200 to prevent enumeration
    if (!student) {
      return res.json({ message: "If that School ID and email match an account, a reset link has been sent." });
    }

    const code = String(Math.floor(100000 + crypto.randomInt(900000)));
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    student.resetCode = code;
    student.resetCodeExpiry = expiry;
    await student.save({ validateBeforeSave: false });

    await sendResetCode(student.email, code);

    res.json({ message: "If that School ID and email match an account, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/student/auth/verify-reset-code
exports.verifyResetCode = async (req, res) => {
  try {
    const { schoolId, code } = req.body;
    if (!schoolId || !code) {
      return res.status(400).json({ message: "School ID and code are required" });
    }

    const student = await Student.findOne({
      schoolId: schoolId.toUpperCase().trim(),
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() },
    });

    if (!student) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    res.json({ message: "Code verified." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/student/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { schoolId, code, password, confirmPassword } = req.body;

    if (!schoolId || !code || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const student = await Student.findOne({
      schoolId: schoolId.toUpperCase().trim(),
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() },
    });

    if (!student) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    student.password = password;
    student.resetCode = null;
    student.resetCodeExpiry = null;
    await student.save();

    res.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

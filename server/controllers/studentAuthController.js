const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { sendResetCode } = require("../config/mailer");
const logAudit = require("../utils/auditLogger");

const generateToken = (id) =>
  jwt.sign({ id, type: "student" }, process.env.JWT_SECRET, { expiresIn: "7d" });

const normalizeEmail = (email) => (email || "").toLowerCase().trim();

const toStudentAuthPayload = (student, token) => {
  const payload = {
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
    profileImage: student.profileImage || "",
    qrToken: student.qrToken,
    createdAt: student.createdAt,
  };

  if (token) payload.token = token;
  return payload;
};

const removeLocalUpload = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.startsWith("/uploads/profiles/")) return;
  const filename = path.basename(fileUrl);
  const diskPath = path.join(__dirname, "..", "uploads", "profiles", filename);
  if (fs.existsSync(diskPath)) {
    fs.unlinkSync(diskPath);
  }
};

// POST /api/student/auth/login
exports.login = async (req, res) => {
  try {
    const { schoolId, password } = req.body;

    if (!schoolId || !password) {
      return res.status(400).json({ message: "School ID and password are required" });
    }

    const student = await Student.findOne({ schoolId: schoolId.toUpperCase().trim() });
    if (!student) {
      return res.status(401).json({ message: "Invalid School ID or password" });
    }

    if (student.isLocked()) {
      const minutesRemaining = Math.ceil((student.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        message: `Account is temporarily locked due to consecutive failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
      });
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      student.failedLoginAttempts = (student.failedLoginAttempts || 0) + 1;
      if (student.failedLoginAttempts >= 5) {
        student.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        await student.save({ validateBeforeSave: false });
        return res.status(403).json({
          message: "Account locked due to 5 consecutive failed login attempts. Please try again after 15 minutes.",
        });
      }
      await student.save({ validateBeforeSave: false });
      return res.status(401).json({ message: "Invalid School ID or password" });
    }

    if (student.isDeleted) {
      return res.status(403).json({ message: "Your account has been deleted. Please contact your administrator." });
    }

    if (!student.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact your school administrator." });
    }

    // Reset lockout counters on success
    student.failedLoginAttempts = 0;
    student.lockUntil = null;
    await student.save({ validateBeforeSave: false });

    logAudit({
      action: "Student Login",
      actorType: "student",
      actorId: student._id,
      actorName: student.fullName,
      description: `${student.fullName} (${student.schoolId}) signed in`,
      category: "auth",
    });

    const token = generateToken(student._id);

    // Set secure HttpOnly cookie for student session
    res.cookie("student_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(toStudentAuthPayload(student, token));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/student/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie("student_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
};

// GET /api/student/auth/me  (protected)
exports.getMe = async (req, res) => {
  res.json(toStudentAuthPayload(req.student));
};

// PATCH /api/student/auth/me  (protected)
// Logged-in student can only update their own editable profile fields.
exports.updateMe = async (req, res) => {
  try {
    const student = req.student;
    const { fullName, email, gradeLevel, section, jobTitle, department } = req.body;

    if (fullName !== undefined) {
      const nextName = String(fullName).trim();
      if (nextName.length < 2) {
        return res.status(400).json({ message: "Full name must be at least 2 characters" });
      }
      student.fullName = nextName;
    }

    if (email !== undefined) {
      const nextEmail = normalizeEmail(email);
      if (!nextEmail) {
        return res.status(400).json({ message: "Email is required" });
      }

      const duplicate = await Student.findOne({
        email: nextEmail,
        _id: { $ne: student._id },
      }).select("_id");

      if (duplicate) {
        return res.status(409).json({ message: "Email is already in use" });
      }
      student.email = nextEmail;
    }

    if ((student.userType ?? "student") === "employee") {
      if (jobTitle !== undefined) student.jobTitle = String(jobTitle || "").trim();
      if (department !== undefined) student.department = String(department || "").trim();
    } else {
      if (gradeLevel !== undefined) student.gradeLevel = String(gradeLevel || "").trim();
      if (section !== undefined) student.section = String(section || "").trim();
    }

    await student.save();

    logAudit({
      action: "Student Profile Updated",
      actorType: "student",
      actorId: student._id,
      actorName: student.fullName,
      description: `${student.fullName} (${student.schoolId}) updated their account information`,
      category: "student",
      meta: { studentId: student._id },
    });

    res.json(toStudentAuthPayload(student));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/student/auth/me/photo  (protected)
// Logged-in student uploads/changes only their own profile photo.
exports.updateMyPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const student = req.student;
    const oldImage = student.profileImage;
    student.profileImage = `/uploads/profiles/${req.file.filename}`;
    await student.save();

    removeLocalUpload(oldImage);

    logAudit({
      action: "Student Profile Photo Updated",
      actorType: "student",
      actorId: student._id,
      actorName: student.fullName,
      description: `${student.fullName} (${student.schoolId}) updated their profile photo`,
      category: "student",
      meta: { studentId: student._id },
    });

    res.json(toStudentAuthPayload(student));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/student/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { schoolId, email } = req.body;

    if (!schoolId && !email) {
      return res.status(400).json({ message: "Please provide your Email or School ID" });
    }

    const query = {};
    if (schoolId && String(schoolId).trim()) {
      query.schoolId = String(schoolId).toUpperCase().trim();
    }
    if (email && String(email).trim()) {
      query.email = String(email).toLowerCase().trim();
    }

    const student = await Student.findOne(query);

    if (!student) {
      return res.status(404).json({ message: "No student account found matching your input" });
    }

    if (!student.email) {
      return res.status(400).json({ message: "This student account does not have a registered email address. Please contact an administrator." });
    }

    const code = String(Math.floor(100000 + crypto.randomInt(900000)));
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    student.resetCode = code;
    student.resetCodeExpiry = expiry;
    await student.save({ validateBeforeSave: false });

    console.log(`Processing password reset request for Student (${student.schoolId}): ${student.email}`);
    await sendResetCode(student.email, code);

    res.json({ message: `A 6-digit reset code has been sent to ${student.email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/student/auth/verify-reset-code
exports.verifyResetCode = async (req, res) => {
  try {
    const { schoolId, email, code } = req.body;
    if (!code || (!schoolId && !email)) {
      return res.status(400).json({ message: "Code and School ID or Email are required" });
    }

    const query = {
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() },
    };
    if (schoolId && String(schoolId).trim()) query.schoolId = String(schoolId).toUpperCase().trim();
    if (email && String(email).trim()) query.email = String(email).toLowerCase().trim();

    const student = await Student.findOne(query);

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
    const { schoolId, email, code, password, confirmPassword } = req.body;

    if ((!schoolId && !email) || !code || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const query = {
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() },
    };
    if (schoolId && String(schoolId).trim()) query.schoolId = String(schoolId).toUpperCase().trim();
    if (email && String(email).trim()) query.email = String(email).toLowerCase().trim();

    const student = await Student.findOne(query);

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

// PATCH /api/student/auth/change-password  (protected)
// Logged-in user changes their own password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const student = req.student;
    if (!await student.matchPassword(oldPassword)) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    student.password = newPassword;
    await student.save();

    logAudit({
      action: "Password Changed",
      actorType: "student",
      actorId: student._id,
      actorName: student.fullName,
      description: `${student.fullName} (${student.schoolId}) changed their password`,
      category: "auth",
      meta: { studentId: student._id },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

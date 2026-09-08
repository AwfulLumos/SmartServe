const crypto = require("crypto");
const Student = require("../models/Student");
const logAudit = require("../utils/auditLogger");

/**
 * Generates a unique QR token: "SSQR-<uppercased schoolId>-<8-char hex>"
 * e.g. SSQR-STU-2024-001-A3F9C12B
 */
const generateQrToken = (schoolId) => {
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `SSQR-${schoolId.toUpperCase()}-${suffix}`;
};

// POST /api/students  (admin/staff only)
exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, schoolId, gradeLevel, section, jobTitle, department, userType, password } = req.body;

    if (!firstName || !lastName || !email || !schoolId || !password) {
      return res.status(400).json({ message: "First name, last name, email, school ID and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const normalizedId = schoolId.toUpperCase().trim();
    const type = userType === "employee" ? "employee" : "student";

    const existing = await Student.findOne({
      $or: [{ schoolId: normalizedId }, { email: email.toLowerCase().trim() }],
    });
    if (existing) {
      return res.status(409).json({ message: "A user with that ID or email already exists" });
    }

    const qrToken = generateQrToken(normalizedId);

    const student = await Student.create({
      fullName,
      email,
      schoolId: normalizedId,
      userType: type,
      gradeLevel: type === "student" ? (gradeLevel || "") : "",
      section: type === "student" ? (section || "") : "",
      jobTitle: type === "employee" ? (jobTitle || "") : "",
      department: type === "employee" ? (department || "") : "",
      password,
      qrToken,
    });

    res.status(201).json({
      _id: student._id,
      schoolId: student.schoolId,
      fullName: student.fullName,
      email: student.email,
      userType: student.userType,
      gradeLevel: student.gradeLevel,
      section: student.section,
      jobTitle: student.jobTitle,
      department: student.department,
      qrToken: student.qrToken,
      isActive: student.isActive,
      points: student.points,
      createdAt: student.createdAt,
    });

    logAudit({
      action: "Student Registered",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} registered student "${fullName}" (${normalizedId})`,
      category: "student",
      meta: { studentId: student._id, schoolId: normalizedId },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/students  (admin/staff only)
exports.getStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { schoolId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .select("-password -resetCode -resetCodeExpiry")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ students, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/students/:id  (admin/staff only)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password -resetCode -resetCodeExpiry");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/students/by-qr/:token  (admin/staff only)
exports.getStudentByQr = async (req, res) => {
  try {
    const student = await Student.findOne({ qrToken: req.params.token }).select("-password -resetCode -resetCodeExpiry");
    if (!student) return res.status(404).json({ message: "No student found for that QR code" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/students/:id  (admin/staff only)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { firstName, lastName, email, schoolId, userType, gradeLevel, section, jobTitle, department, isActive, password } = req.body;

    if (firstName !== undefined) student.fullName = `${firstName.trim()} ${(lastName ?? student.fullName.split(" ").slice(1).join(" ")).trim()}`;
    if (firstName !== undefined && lastName !== undefined) student.fullName = `${firstName.trim()} ${lastName.trim()}`;
    if (email !== undefined) student.email = email.toLowerCase().trim();
    if (schoolId !== undefined) student.schoolId = schoolId.toUpperCase().trim();
    if (userType !== undefined) student.userType = userType === "employee" ? "employee" : "student";
    if (gradeLevel !== undefined) student.gradeLevel = gradeLevel;
    if (section !== undefined) student.section = section;
    if (jobTitle !== undefined) student.jobTitle = jobTitle;
    if (department !== undefined) student.department = department;
    if (isActive !== undefined) student.isActive = isActive;
    if (password && password.length >= 6) student.password = password;

    await student.save();

    logAudit({
      action: "Student Updated",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} updated user "${student.fullName}" (${student.schoolId})`,
      category: "student",
      meta: { studentId: student._id },
    });

    const updated = student.toObject();
    delete updated.password;
    delete updated.resetCode;
    delete updated.resetCodeExpiry;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/students/:id  (admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    logAudit({
      action: "Student Deleted",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} deleted user "${student.fullName}" (${student.schoolId})`,
      category: "student",
      meta: { studentId: student._id, schoolId: student.schoolId },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

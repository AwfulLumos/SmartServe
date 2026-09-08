const Student = require("../models/Student");
const ByocRecord = require("../models/ByocRecord");
const { getConfigData } = require("./pointsConfigController");
const logAudit = require("../utils/auditLogger");
const { pushNotification } = require("./notificationController");

// GET /api/byoc  — list + stats
exports.getByocRecords = async (req, res) => {
  try {
    const { search } = req.query;
    let records = await ByocRecord.find({}).sort({ createdAt: -1 }).limit(200);

    if (search) {
      const s = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.studentName.toLowerCase().includes(s) ||
          r.schoolId.toLowerCase().includes(s)
      );
    }

    // Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const allRecords = await ByocRecord.find({});
    const ecoPointsToday = allRecords
      .filter((r) => new Date(r.createdAt) >= today)
      .reduce((sum, r) => sum + r.ecoPoints, 0);
    const containersSavedMonth = allRecords.filter(
      (r) => new Date(r.createdAt) >= monthStart
    ).length;

    res.json({ records, stats: { ecoPointsToday, containersSavedMonth } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/byoc/mine  — student's own BYOC history
exports.getStudentByocRecords = async (req, res) => {
  try {
    const records = await ByocRecord.find({ student: req.student._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/byoc  — log a BYOC action for a student (5 eco points)
exports.logByoc = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId is required" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.isActive) return res.status(403).json({ message: "Student account is inactive" });

    const cfg = await getConfigData();
    const ECO_POINTS = cfg.ecoPointsPerByoc || 5;

    // Award points and increment BYOC count
    student.points += ECO_POINTS;
    student.byocCount += 1;
    await student.save();

    const record = await ByocRecord.create({
      student: student._id,
      studentName: student.fullName,
      schoolId: student.schoolId,
      ecoPoints: ECO_POINTS,
      confirmedBy: req.user._id,
      confirmedByName: req.user.fullName,
      confirmedByRole: req.user.role,
    });

    res.status(201).json({ record, studentPoints: student.points });

    // Notify the student they earned eco points
    pushNotification({
      recipientType: "student",
      recipientId: String(student._id),
      type: "byoc_awarded",
      title: "Eco Points Earned! 🌿",
      body: `+${ECO_POINTS} eco points awarded for bringing your own container.`,
      meta: { ecoPoints: ECO_POINTS, newBalance: student.points },
    });

    logAudit({
      action: "BYOC Logged",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} logged BYOC for ${student.fullName} (${student.schoolId}) — +${ECO_POINTS} eco pts`,
      category: "byoc",
      meta: { recordId: record._id, studentId: student._id, ecoPoints: ECO_POINTS },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

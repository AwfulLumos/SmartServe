const Student = require("../models/Student");
const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const logAudit = require("../utils/auditLogger");
const { pushNotification } = require("./notificationController");

// GET /api/redemptions  — history list
exports.getRedemptions = async (req, res) => {
  try {
    const { search } = req.query;
    let records = await Redemption.find({}).sort({ createdAt: -1 }).limit(200);

    if (search) {
      const s = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.studentName.toLowerCase().includes(s) ||
          r.schoolId.toLowerCase().includes(s)
      );
    }

    res.json({ redemptions: records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/redemptions  — redeem a reward for a student
exports.redeemReward = async (req, res) => {
  try {
    const { studentId, rewardId } = req.body;
    if (!studentId || !rewardId) {
      return res.status(400).json({ message: "studentId and rewardId are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.isActive) return res.status(403).json({ message: "Student account is inactive" });

    const reward = await Reward.findById(rewardId);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    if (!reward.isActive) return res.status(400).json({ message: "This reward is no longer active" });

    if (student.points < reward.pointsCost) {
      return res.status(400).json({
        message: `Insufficient points. Student has ${student.points} pts but reward requires ${reward.pointsCost} pts.`,
      });
    }

    // Deduct points
    student.points -= reward.pointsCost;
    await student.save();

    const redemption = await Redemption.create({
      student: student._id,
      studentName: student.fullName,
      schoolId: student.schoolId,
      reward: reward._id,
      rewardName: reward.name,
      pointsUsed: reward.pointsCost,
      redeemedBy: req.user._id,
      redeemedByName: req.user.fullName,
    });

    res.status(201).json({
      redemption,
      studentPoints: student.points,
    });

    // Notify the student their reward was redeemed
    pushNotification({
      recipientType: "student",
      recipientId: String(student._id),
      type: "reward_redeemed",
      title: "Reward Redeemed! 🎁",
      body: `"${reward.name}" redeemed for ${reward.pointsCost} pts. Remaining balance: ${student.points} pts.`,
      meta: { rewardName: reward.name, pointsUsed: reward.pointsCost, newBalance: student.points },
    });

    logAudit({
      action: "Reward Redeemed (Staff)",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} redeemed "${reward.name}" for student ${student.fullName} (${student.schoolId}) — ${reward.pointsCost} pts`,
      category: "reward",
      meta: { redemptionId: redemption._id, studentId: student._id, rewardId: reward._id, pointsUsed: reward.pointsCost },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/redemptions/student  — student redeems for themselves
exports.redeemRewardStudent = async (req, res) => {
  try {
    const { rewardId } = req.body;
    if (!rewardId) return res.status(400).json({ message: "rewardId is required" });

    const student = await Student.findById(req.student._id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.isActive) return res.status(403).json({ message: "Account is inactive" });

    const reward = await Reward.findById(rewardId);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    if (!reward.isActive) return res.status(400).json({ message: "This reward is no longer available" });

    if (student.points < reward.pointsCost) {
      return res.status(400).json({
        message: `Not enough points. You have ${student.points} pts but need ${reward.pointsCost} pts.`,
      });
    }

    student.points -= reward.pointsCost;
    await student.save();

    const redemption = await Redemption.create({
      student: student._id,
      studentName: student.fullName,
      schoolId: student.schoolId,
      reward: reward._id,
      rewardName: reward.name,
      pointsUsed: reward.pointsCost,
      redeemedBy: student._id,
      redeemedByName: student.fullName,
    });

    res.status(201).json({ redemption, studentPoints: student.points });

    logAudit({
      action: "Reward Redeemed (Student)",
      actorType: "student",
      actorId: student._id,
      actorName: student.fullName,
      description: `${student.fullName} (${student.schoolId}) redeemed "${reward.name}" — ${reward.pointsCost} pts`,
      category: "reward",
      meta: { redemptionId: redemption._id, rewardId: reward._id, pointsUsed: reward.pointsCost, remainingPoints: student.points },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/redemptions/mine  — student's own redemption history
exports.getStudentRedemptions = async (req, res) => {
  try {
    const records = await Redemption.find({ student: req.student._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ redemptions: records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

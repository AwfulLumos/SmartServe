const express = require("express");
const router = express.Router();
const { createStudent, getStudents, getStudentById, getStudentByQr, updateStudent, deleteStudent, restoreStudent, permanentDeleteStudent, resetStudentPassword, checkStudentExists } = require("../controllers/studentController");
const { protect, restrictTo } = require("../middleware/auth");

// All routes require admin or staff
router.use(protect, restrictTo("admin", "staff"));

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/exists", checkStudentExists);
router.get("/by-qr/:token", getStudentByQr);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.put("/:id/restore", restrictTo("admin"), restoreStudent);
router.patch("/:id/restore", restrictTo("admin"), restoreStudent);
router.post("/:id/reset-password", resetStudentPassword);
router.delete("/:id", restrictTo("admin"), deleteStudent);
router.delete("/:id/permanent", restrictTo("admin"), permanentDeleteStudent);

module.exports = router;

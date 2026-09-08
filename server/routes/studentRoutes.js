const express = require("express");
const router = express.Router();
const { createStudent, getStudents, getStudentById, getStudentByQr, updateStudent, deleteStudent } = require("../controllers/studentController");
const { protect, restrictTo } = require("../middleware/auth");

// All routes require admin or staff
router.use(protect, restrictTo("admin", "staff"));

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/by-qr/:token", getStudentByQr);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", restrictTo("admin"), deleteStudent);

module.exports = router;

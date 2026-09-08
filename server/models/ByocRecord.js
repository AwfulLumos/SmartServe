const mongoose = require("mongoose");

const byocRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    schoolId: { type: String, required: true },
    ecoPoints: { type: Number, default: 5 },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    confirmedByName: { type: String, required: true },
    confirmedByRole: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ByocRecord", byocRecordSchema);

const Sample = require("../models/Sample");

// GET /api/sample
exports.getAll = async (req, res) => {
  try {
    const items = await Sample.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sample
exports.create = async (req, res) => {
  try {
    const item = await Sample.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/sample/:id
exports.getById = async (req, res) => {
  try {
    const item = await Sample.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sample/:id
exports.update = async (req, res) => {
  try {
    const item = await Sample.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/sample/:id
exports.remove = async (req, res) => {
  try {
    const item = await Sample.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

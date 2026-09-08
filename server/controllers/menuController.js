const MenuItem = require("../models/MenuItem");
const logAudit = require("../utils/auditLogger");

// GET /api/menu/active  (student-accessible – only active items)
exports.getActiveMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isActive: true }).sort({ category: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({}).sort({ category: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: "Name, category and price are required" });
    }
    const item = await MenuItem.create({ name, category, price });

    logAudit({
      action: "Menu Item Added",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} added menu item "${name}" (${category}) at ₱${price}`,
      category: "menu",
      meta: { itemId: item._id, name, category, price },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, category, price },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    logAudit({
      action: "Menu Item Updated",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} updated menu item "${item.name}"`,
      category: "menu",
      meta: { itemId: item._id },
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/menu/:id/toggle
exports.toggleMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    item.isActive = !item.isActive;
    await item.save();

    logAudit({
      action: `Menu Item ${item.isActive ? "Enabled" : "Disabled"}`,
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} ${item.isActive ? "enabled" : "disabled"} menu item "${item.name}"`,
      category: "menu",
      meta: { itemId: item._id, isActive: item.isActive },
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    logAudit({
      action: "Menu Item Deleted",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} deleted menu item "${item.name}"`,
      category: "menu",
      meta: { name: item.name, category: item.category },
    });

    res.json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

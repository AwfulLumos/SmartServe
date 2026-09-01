const fs = require("fs");
const path = require("path");
const MenuItem = require("../models/MenuItem");
const logAudit = require("../utils/auditLogger");

// In-Memory Cache Store
let activeMenuCache = null;
let allMenuCache = null;
let activeCacheTime = 0;
let allCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache lifetime

// Helper to invalidate cache when menu items are mutated
const invalidateMenuCache = () => {
  activeMenuCache = null;
  allMenuCache = null;
  activeCacheTime = 0;
  allCacheTime = 0;
};

const removeLocalUpload = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.startsWith("/uploads/menu/")) return;
  const filename = path.basename(fileUrl);
  const diskPath = path.join(__dirname, "..", "uploads", "menu", filename);
  if (fs.existsSync(diskPath)) {
    try {
      fs.unlinkSync(diskPath);
    } catch { /* ignore */ }
  }
};

// GET /api/menu/active  (student-accessible – only active items)
exports.getActiveMenuItems = async (req, res) => {
  try {
    const now = Date.now();
    if (activeMenuCache && now - activeCacheTime < CACHE_TTL_MS) {
      return res.json(activeMenuCache);
    }

    const items = await MenuItem.find({ isActive: { $ne: false } })
      .sort({ category: 1, createdAt: -1 })
      .lean();

    activeMenuCache = items;
    activeCacheTime = now;
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/menu (admin / staff)
exports.getMenuItems = async (req, res) => {
  try {
    const now = Date.now();
    if (allMenuCache && now - allCacheTime < CACHE_TTL_MS) {
      return res.json(allMenuCache);
    }

    const items = await MenuItem.find({})
      .sort({ category: 1, createdAt: -1 })
      .lean();

    allMenuCache = items;
    allCacheTime = now;
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    let imageUrl = req.body.image || "";

    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: "Name, category and price are required" });
    }
    const item = await MenuItem.create({ name, category, price: Number(price), image: imageUrl });

    invalidateMenuCache();

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
    const { name, category, price, image } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);

    const existingItem = await MenuItem.findById(req.params.id);
    if (!existingItem) return res.status(404).json({ message: "Menu item not found" });

    if (req.file) {
      removeLocalUpload(existingItem.image);
      updateData.image = `/uploads/menu/${req.file.filename}`;
    } else if (image !== undefined) {
      if (image === "" && existingItem.image) {
        removeLocalUpload(existingItem.image);
      }
      updateData.image = image;
    }

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    invalidateMenuCache();

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

    invalidateMenuCache();

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

    removeLocalUpload(item.image);
    invalidateMenuCache();

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

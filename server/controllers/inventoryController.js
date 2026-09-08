const InventoryItem = require("../models/InventoryItem");
const logAudit = require("../utils/auditLogger");

// GET /api/inventory
exports.getItems = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const items = await InventoryItem.find(query).sort({ createdAt: -1 });

    // Apply status filter post-fetch (status is a virtual)
    let filtered = items;
    if (status && status !== "all") {
      filtered = items.filter((i) => i.status === status);
    }

    // Summary counts (from unfiltered list)
    const total = items.length;
    const inStock = items.filter((i) => i.status === "in_stock").length;
    const lowStock = items.filter((i) => i.status === "low_stock").length;
    const outOfStock = items.filter((i) => i.status === "out_of_stock").length;

    res.json({ items: filtered, summary: { total, inStock, lowStock, outOfStock } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/inventory
exports.createItem = async (req, res) => {
  try {
    const { name, category, quantity, unit, minThreshold, price } = req.body;
    if (!name || !category || quantity === undefined || !unit || minThreshold === undefined || price === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await InventoryItem.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" }, category: category.trim() });
    if (existing) {
      return res.status(409).json({ message: "An item with that name and category already exists" });
    }

    const item = await InventoryItem.create({ name, category, quantity, unit, minThreshold, price });

    logAudit({
      action: "Inventory Item Added",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} added inventory item "${name}" (${category})`,
      category: "inventory",
      meta: { itemId: item._id, name, category, quantity, unit },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/inventory/:id
exports.updateItem = async (req, res) => {
  try {
    const { name, category, quantity, unit, minThreshold, price } = req.body;
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { name, category, quantity, unit, minThreshold, price },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    logAudit({
      action: "Inventory Item Updated",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} updated inventory item "${item.name}"`,
      category: "inventory",
      meta: { itemId: item._id },
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/inventory/:id/quantity  — inline quantity update
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/inventory/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    logAudit({
      action: "Inventory Item Deleted",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} deleted inventory item "${item.name}"`,
      category: "inventory",
      meta: { name: item.name, category: item.category },
    });

    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

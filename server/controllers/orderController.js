const Order = require("../models/Order");
const logAudit = require("../utils/auditLogger");
const { pushNotification } = require("./notificationController");

function generateOrderNumber() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${random}`;
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

// GET /api/orders  (admin/staff)
exports.getOrders = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
        { schoolId: { $regex: search, $options: "i" } },
      ];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/orders/:id/status  (admin/staff)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Fetch existing order to check previous status
    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Order not found" });

    const previousStatus = existing.status;
    existing.status = status;
    await existing.save();

    // Notify the student their order status changed
    pushNotification({
      recipientType: "student",
      recipientId: String(existing.student),
      type: "order_status",
      title: "Order Update",
      body: `Your order ${existing.orderNumber} is now ${status}.`,
      meta: { orderId: existing._id, orderNumber: existing.orderNumber, status },
    });

    logAudit({
      action: "Order Status Updated",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} changed order ${existing.orderNumber} from "${previousStatus}" to "${status}"`,
      category: "order",
      meta: { orderId: existing._id, orderNumber: existing.orderNumber, from: previousStatus, to: status },
    });

    res.json({ order: existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/orders  (student)
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const sanitizedItems = items.map((i) => ({
      menuItemId: i.menuItemId,
      name: String(i.name),
      category: String(i.category),
      price: Number(i.price),
      quantity: Math.max(1, Math.floor(Number(i.quantity))),
    }));

    const total = sanitizedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      student: req.student._id,
      studentName: req.student.fullName,
      schoolId: req.student.schoolId,
      items: sanitizedItems,
      total,
    });

    logAudit({
      action: "Order Placed",
      actorType: "student",
      actorId: req.student._id,
      actorName: req.student.fullName,
      description: `${req.student.fullName} (${req.student.schoolId}) placed order ${order.orderNumber} — ₱${total.toFixed(2)}`,
      category: "order",
      meta: { orderId: order._id, orderNumber: order.orderNumber, total, itemCount: sanitizedItems.length },
    });

    // Notify admin/staff that a new order arrived
    pushNotification({
      recipientType: "admin",
      type: "order_placed",
      title: "New Order",
      body: `${order.studentName} placed order ${order.orderNumber} — ₱${total.toFixed(2)}`,
      meta: { orderId: order._id, orderNumber: order.orderNumber, total },
    });

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

// GET /api/orders/mine  (student)
exports.getStudentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.student._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

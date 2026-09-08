const Notification = require("../models/Notification");

// ── Shared helper ─────────────────────────────────────────────────────────────
/**
 * Create a notification in the DB and push it over the socket.
 *
 * @param {object} opts
 * @param {"admin"|"student"} opts.recipientType
 * @param {string|null}       opts.recipientId   - Student ObjectId string (omit for admin)
 * @param {string}            opts.type
 * @param {string}            opts.title
 * @param {string}            opts.body
 * @param {object}            opts.meta
 */
async function pushNotification({ recipientType, recipientId = null, type, title, body, meta = {} }) {
  try {
    const notif = await Notification.create({ recipientType, recipientId, type, title, body, meta });

    const { getIO } = require("../socket");
    const io = getIO();
    if (io) {
      const room = recipientType === "admin" ? "admin" : `student:${recipientId}`;
      io.to(room).emit("notification", {
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        meta: notif.meta,
        read: notif.read,
        createdAt: notif.createdAt,
      });
    }
  } catch (err) {
    console.error("pushNotification error:", err.message);
  }
}

// ── REST endpoints ─────────────────────────────────────────────────────────────

// GET /api/notifications?recipientType=admin  (admin/staff)
// GET /api/notifications?recipientType=student (student — uses req.student)
exports.getNotifications = async (req, res) => {
  try {
    const { recipientType } = req.query;

    let filter = {};
    if (recipientType === "student") {
      if (!req.student) return res.status(401).json({ message: "Unauthorised" });
      filter = { recipientType: "student", recipientId: req.student._id };
    } else {
      filter = { recipientType: "admin" };
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unread = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/notifications/read-all  — mark all as read for the caller
exports.markAllRead = async (req, res) => {
  try {
    const { recipientType } = req.body;

    let filter = {};
    if (recipientType === "student") {
      if (!req.student) return res.status(401).json({ message: "Unauthorised" });
      filter = { recipientType: "student", recipientId: req.student._id, read: false };
    } else {
      filter = { recipientType: "admin", read: false };
    }

    await Notification.updateMany(filter, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/notifications/:id/read  — mark single as read
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.pushNotification = pushNotification;

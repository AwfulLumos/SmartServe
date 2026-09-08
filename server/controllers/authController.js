const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logAudit = require("../utils/auditLogger");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullName, email, username, role, password, confirmPassword } = req.body;

    if (!fullName || !email || !username || !role || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or staff" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    // Auto-approve only if this is the very first user in the system (bootstrap admin)
    const userCount = await User.countDocuments();
    const isBootstrap = userCount === 0;

    const user = await User.create({
      fullName,
      email,
      username,
      role,
      password,
      isApproved: isBootstrap,
    });

    res.status(201).json({
      message: isBootstrap
        ? "Account created and approved. You can now sign in."
        : "Account created. Please wait for an admin to approve your account before signing in.",
      isApproved: user.isApproved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is pending approval by an admin. Please try again later.",
      });
    }

    logAudit({
      action: "Staff Login",
      actorType: user.role,
      actorId: user._id,
      actorName: user.fullName,
      description: `${user.fullName} (${user.role}) signed in`,
      category: "auth",
    });

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// GET /api/auth/pending  (admin only — list unapproved users)
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/staff  (admin only — all approved staff + admins)
exports.getStaffAccounts = async (req, res) => {
  try {
    const users = await User.find({ isApproved: true }).select("-password -resetCode -resetCodeExpiry").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/staff  (admin only — create staff directly, pre-approved)
exports.createStaffAccount = async (req, res) => {
  try {
    const { fullName, email, role, password } = req.body;
    if (!fullName || !email || !role || !password) {
      return res.status(400).json({ message: "Full name, email, role and password are required" });
    }
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or staff" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists" });
    }
    // Auto-generate username from email prefix
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter++}`;
    }
    const user = await User.create({ fullName, email, username, role, password, isApproved: true });

    logAudit({
      action: "Staff Account Created",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `New ${role} "${fullName}" created by ${req.user.fullName}`,
      category: "auth",
      meta: { createdUserId: user._id, email, role },
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/approve/:id  (admin only)
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    logAudit({
      action: "Staff Account Approved",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} approved account for "${user.fullName}" (${user.role})`,
      category: "auth",
      meta: { approvedUserId: user._id },
    });

    res.json({ message: `${user.fullName}'s account has been approved.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/auth/staff/:id  (admin only)
exports.deleteStaffAccount = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Account not found" });

    logAudit({
      action: "Staff Account Deleted",
      actorType: req.user.role,
      actorId: req.user._id,
      actorName: req.user.fullName,
      description: `${req.user.fullName} deleted account for "${user.fullName}" (${user.role})`,
      category: "auth",
      meta: { deletedUserId: user._id, email: user.email, role: user.role },
    });

    res.json({ message: `${user.fullName}'s account has been deleted.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

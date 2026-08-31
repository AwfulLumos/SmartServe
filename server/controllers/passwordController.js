const crypto = require("crypto");
const User = require("../models/User");
const Student = require("../models/Student");
const { sendResetCode } = require("../config/mailer");

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();
    let account = await User.findOne({ email: cleanEmail });
    let accountType = "Staff";

    if (!account) {
      account = await Student.findOne({ email: cleanEmail });
      accountType = "Student";
    }

    if (!account) {
      return res.status(404).json({ message: "No account found with that email address" });
    }

    // Generate 6-digit numeric code
    const code = String(Math.floor(100000 + crypto.randomInt(900000)));
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    account.resetCode = code;
    account.resetCodeExpiry = expiry;
    await account.save({ validateBeforeSave: false });

    console.log(`Processing password reset request for ${accountType} User: ${account.email}`);
    await sendResetCode(account.email, code);

    res.json({ message: "A password reset code has been sent to your email address." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/verify-reset-code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const query = {
      email: cleanEmail,
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() },
    };

    let account = await User.findOne(query);
    if (!account) {
      account = await Student.findOne(query);
    }

    if (!account) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    res.json({ message: "Code verified. You may now reset your password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password, newPassword, confirmPassword } = req.body;
    const finalPassword = password || newPassword;

    if (!email || !code || !finalPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }

    if (confirmPassword && finalPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const query = {
      email: cleanEmail,
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() },
    };

    let account = await User.findOne(query);
    if (!account) {
      account = await Student.findOne(query);
    }

    if (!account) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    account.password = finalPassword;
    account.resetCode = null;
    account.resetCodeExpiry = null;
    await account.save();

    res.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

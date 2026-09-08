const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a password reset code email.
 * @param {string} to   - recipient email
 * @param {string} code - 6-digit OTP
 */
const sendResetCode = async (to, code) => {
  await transporter.sendMail({
    from: `"SmartServe" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "SmartServe — Password Reset Code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#4a6741;margin-bottom:8px;">Password Reset Request</h2>
        <p style="color:#555;margin-bottom:24px;">Use the code below to reset your SmartServe password. It expires in <strong>15 minutes</strong>.</p>
        <div style="background:#fff;border:2px solid #4a6741;border-radius:10px;padding:20px;text-align:center;font-size:36px;font-weight:700;letter-spacing:12px;color:#4a6741;">
          ${code}
        </div>
        <p style="color:#888;font-size:13px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendResetCode };

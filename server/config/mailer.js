const dns = require("dns");
const nodemailer = require("nodemailer");

// Force IPv4 resolution first to prevent Windows Node.js ECONNREFUSED ::1:587 errors on Gmail
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const createTransporter = () => {
  const isGmail = process.env.SMTP_HOST === "smtp.gmail.com" || (process.env.SMTP_USER && process.env.SMTP_USER.endsWith("@gmail.com"));

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

/**
 * Send a password reset code email.
 * @param {string} to   - recipient email
 * @param {string} code - 6-digit OTP
 */
const sendResetCode = async (to, code) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"SmartServe" <${process.env.SMTP_USER}>`,
    to,
    subject: "SmartServe — Password Reset Code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#4a6741;margin-top:0;margin-bottom:8px;">Password Reset Request</h2>
        <p style="color:#555;margin-bottom:24px;font-size:15px;line-height:1.5;">Use the code below to reset your SmartServe password. It expires in <strong>15 minutes</strong>.</p>
        <div style="background:#fff;border:2px solid #4a6741;border-radius:10px;padding:20px;text-align:center;font-size:36px;font-weight:700;letter-spacing:12px;color:#4a6741;">
          ${code}
        </div>
        <p style="color:#888;font-size:13px;margin-top:24px;margin-bottom:0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`\n==================================================`);
    console.log(`RESET CODE EMAIL SENT SUCCESSFULLY`);
    console.log(`Sent To: ${to}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`==================================================\n`);
    return info;
  } catch (mailError) {
    console.error("Failed to send email via SMTP:", mailError.message);
    throw mailError;
  }
};

module.exports = { sendResetCode };

const rateLimit = require("express-rate-limit");

/**
 * Custom Key Generator for Express Rate Limit
 * If a request has an authenticated user/student, rate limit by account ID.
 * Otherwise, fall back to IP address.
 * This prevents students on shared campus Wi-Fi from locking each other out.
 */
const getUserOrIpKey = (req) => {
  if (req.user && req.user._id) return `user_${req.user._id}`;
  if (req.student && req.student._id) return `student_${req.student._id}`;
  return req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
};

// Check if running in local development mode
const isDev = () => process.env.NODE_ENV !== "production";

/**
 * 1. Strict Authentication Limiter
 * Applied to: Login, Register, Forgot Password
 * Limits brute-force login attempts
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts in production
  skip: () => isDev(), // Skip during local development
  keyGenerator: getUserOrIpKey,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again after 15 minutes." },
});

/**
 * 2. Action / Mutation Limiter
 * Applied to: Order placement, BYOC claims, Reward redemptions
 * Prevents rapid double-clicks and spam transactions
 */
const actionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 actions per minute per account/IP
  skip: () => isDev(), // Skip during local development
  keyGenerator: getUserOrIpKey,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Transaction limit reached. Please wait a minute before submitting again." },
});

/**
 * 3. General API Limiter
 * Applied to: Browsing menus, notifications, dashboard statistics
 * Protects server & database from high request volumes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes in production
  skip: () => isDev(), // Skip during local development
  keyGenerator: getUserOrIpKey,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again after a few minutes." },
});

module.exports = {
  authLimiter,
  actionLimiter,
  apiLimiter,
};

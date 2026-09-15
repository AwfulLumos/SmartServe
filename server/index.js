const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { init: initSocket } = require("./socket");

// Load environment variables (absolute path so it works regardless of cwd)
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: path.join(__dirname, envFile) });

const app = express();
const httpServer = http.createServer(app);

// Initialise Socket.IO (only binds; no-op in Vercel serverless mode)
if (process.env.VERCEL !== "1") {
  initSocket(httpServer);
}

// Connect to MongoDB
connectDB();

// -------------------------------------------------------------
// Security Middleware (Phase 1 & Phase 3)
// -------------------------------------------------------------

// Cookie Parser for HttpOnly Auth Cookies
app.use(cookieParser());

// 1. Helmet HTTP Security Headers (allow cross-origin for uploads)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. Prevent NoSQL Injection Attacks
app.use(mongoSanitize());

const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");

// 3. Rate Limiting (Dev-bypassed, Tiered & User-Aware in Production)
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/student/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/student/auth/forgot-password", authLimiter);

// -------------------------------------------------------------
// Core Middleware
// -------------------------------------------------------------
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const { aclMiddleware } = require("./middleware/aclMiddleware");
app.use(aclMiddleware);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/student/auth", require("./routes/studentAuthRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/rewards", require("./routes/rewardRoutes"));
app.use("/api/redemptions", require("./routes/redemptionRoutes"));
app.use("/api/byoc", require("./routes/byocRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/forecast", require("./routes/forecastRoutes"));
app.use("/api/points-config", require("./routes/pointsConfigRoutes"));
app.use("/api/audit-logs", require("./routes/auditLogRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/network", require("./routes/networkRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV || "development" });
});

const PORT = process.env.PORT || 5000;

// Only start the HTTP server when running locally (not in Vercel serverless)
if (process.env.VERCEL !== "1") {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

module.exports = app;

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
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

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/points-config", require("./routes/pointsConfigRoutes"));
app.use("/api/audit-logs", require("./routes/auditLogRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/sample", require("./routes/sampleRoutes"));

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

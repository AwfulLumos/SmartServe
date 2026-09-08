let _io = null;

/**
 * Initialise Socket.IO against an existing http.Server instance.
 * Call once from index.js before app.listen().
 * Lazy-requires socket.io so it doesn't crash Vercel serverless at module load.
 */
function init(httpServer) {
  try {
    const { Server } = require("socket.io");
    _io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    _io.on("connection", (socket) => {
      socket.on("join:admin", () => {
        socket.join("admin");
      });

      socket.on("join:student", ({ studentId }) => {
        if (studentId) socket.join(`student:${studentId}`);
      });

      socket.on("disconnect", () => {});
    });
  } catch (err) {
    console.warn("Socket.IO unavailable (skipping):", err.message);
  }

  return _io;
}

/** Return the live io instance (null if not yet initialised) */
function getIO() {
  return _io;
}

module.exports = { init, getIO };

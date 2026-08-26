import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5001",
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (
              err.code === "ECONNRESET" ||
              err.code === "ECONNABORTED" ||
              err.code === "ECONNREFUSED"
            ) {
              // Suppress harmless websocket reset logs on server restart
              return;
            }
          });
        },
      },
    },
  },
});

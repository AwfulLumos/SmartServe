import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../utils/api";

const NotificationContext = createContext(null);

// Icon map for toast label
const TYPE_LABEL = {
  order_placed:    "New Order",
  order_status:    "Order Update",
  byoc_awarded:    "Eco Points",
  reward_redeemed: "Reward Redeemed",
};

/**
 * role  : "admin" | "student"
 * token : JWT string
 * id    : user/student ObjectId string (students only)
 */
export function NotificationProvider({ role, token, id, onNotification, children }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);
  // Track the newest notification id we've already toasted so polling doesn't re-toast
  const latestIdRef = useRef(null);

  // In local dev, connect to the same origin so Vite proxies the socket to the backend.
  // In production (Vercel serverless), socket.io is unavailable — skip entirely unless
  // an explicit VITE_SOCKET_URL is configured.
  const isLocalDev = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  let SOCKET_URL = null;
  if (import.meta.env.VITE_SOCKET_URL) {
    SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  } else if (isLocalDev) {
    // Same origin — Vite will proxy /socket.io → localhost:5001
    SOCKET_URL = window.location.origin;
  }

  // ── Fetch persisted notifications from REST ───────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = role === "admin" ? "/notifications/admin" : "/notifications/student";
      const { data } = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const incoming = data.notifications || [];

      // On subsequent polls, toast any notifications newer than what we last saw
      if (latestIdRef.current !== null && incoming.length > 0) {
        const prevIds = new Set(
          notifications.map ? notifications.map((n) => n._id) : []
        );
        const brandNew = incoming.filter((n) => !prevIds.has(n._id) && !n.read);
        brandNew.forEach((n) => {
          if (onNotification) onNotification(n);
          toast(n.body, {
            icon: role === "admin" ? "🔔" : "✨",
            duration: 4000,
            style: { fontSize: "13px", maxWidth: "320px" },
          });
        });
      }

      if (incoming.length > 0) latestIdRef.current = incoming[0]._id;
      setNotifications(incoming);
      setUnread(data.unread || 0);
    } catch {
      // non-fatal
    }
  }, [token, role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mark all read ─────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = role === "admin" ? "/notifications/admin/read-all" : "/notifications/student/read-all";
      await api.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // silent
    }
  }, [token, role]);

  // ── Mark one read ─────────────────────────────────────────────────────────
  const markOneRead = useCallback(async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }, [token]);

  // ── Socket.IO connection OR polling fallback ─────────────────────────────
  useEffect(() => {
    if (!token) return;

    fetchNotifications();

    if (!SOCKET_URL) {
      // Vercel serverless: poll every 10 seconds for new notifications
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnectionAttempts: 2,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (role === "admin") {
        socket.emit("join:admin");
      } else {
        socket.emit("join:student", { studentId: id });
      }
    });

    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
      setUnread((c) => c + 1);
      if (onNotification) onNotification(notif);

      // Show a toast
      toast(notif.body, {
        icon: role === "admin" ? "🔔" : "✨",
        duration: 4000,
        style: { fontSize: "13px", maxWidth: "320px" },
      });
    });

    socket.on("connect_error", () => {
      // Socket unavailable (e.g. Vercel serverless) — fall back to silent polling
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, role, id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NotificationContext.Provider
      value={{ notifications, unread, markAllRead, markOneRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

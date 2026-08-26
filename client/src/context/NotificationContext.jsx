import {
  createContext,     // Creates a React Context to share notification data
  useContext,        // Used in useNotifications hook to consume the context value
  useState,          // Holds notifications array and unread count state
  useEffect,         // Handles Socket.IO connection and cleanup lifecycle
  useRef,            // References the socket connection and tracks the latest notification ID
  useCallback        // Memoizes utility functions (fetchNotifications, markAllRead, markOneRead)
} from "react";
import { io } from "socket.io-client";  // For real-time WebSocket connection
import toast from "react-hot-toast";     // For popup notification toasts
import api from "../utils/api";          // Custom API utility for HTTP requests
import studentApi from "../utils/studentApi"; // Custom API utility for student HTTP requests

// ──────────────────────────────────────────────────────
// NOTIFICATION CONTEXT
// Manages application-wide notifications
// Includes real-time Socket.IO sync with fallback HTTP polling
// ──────────────────────────────────────────────────────

const NotificationContext = createContext(null);

// ──────────────────────────────────────────────────────
// TYPE LABEL MAP - for readable notification labels
// Maps technical notification type identifiers to user-friendly text
// ──────────────────────────────────────────────────────
const TYPE_LABEL = {
  order_placed: "New Order",        // New canteen order placed
  order_status: "Order Update",     // Update sa order status
  byoc_awarded: "Eco Points",       // Eco points awarded
  reward_redeemed: "Reward Redeemed",  // Reward redeemed
};

/**
 * role  : "admin" | "student" - user role authorization
 * token : JWT string - token authorization header
 * id    : user/student ObjectId string (students only)
 */
export function NotificationProvider({ role, token, id, onNotification, children }) {
  // ──────────────────────────────────────────────────────
  // STATE VARIABLES
  // ──────────────────────────────────────────────────────

  // List of all notifications
  const [notifications, setNotifications] = useState([]);

  // Unread notification count (for tab badge indicator)
  const [unread, setUnread] = useState(0);

  // Reference to the active Socket.IO client connection
  const socketRef = useRef(null);

  // Tracks the ID of the most recent notification toasted
  // Prevents duplicate toast alerts during polling fallback cycles
  const latestIdRef = useRef(null);

  // Track notification IDs that have already shown a toast
  // This prevents duplicates when a notification arrives via socket and polling
  const displayedIdsRef = useRef(new Set());

  const showToast = (notif) => {
    if (!notif || displayedIdsRef.current.has(notif._id)) return;
    displayedIdsRef.current.add(notif._id);
    toast(notif.body, {
      duration: 4000,
      style: { fontSize: "13px", maxWidth: "320px" },
    });
  };

  // In local dev, connect to the same origin so Vite proxies the socket to the backend.
  // In production (Vercel serverless), socket.io is unavailable — skip entirely unless
  // an explicit VITE_SOCKET_URL is configured.
  const isLocalDev = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  let SOCKET_URL = null;
  if (import.meta.env.VITE_SOCKET_URL) {
    // Use explicit socket URL from environment variables
    SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  } else if (isLocalDev) {
    // Local dev: same origin, Vite will proxy to backend
    SOCKET_URL = window.location.origin;
  }

  // ──────────────────────────────────────────────────────
  // FETCH NOTIFICATIONS FUNCTION
  // Retrieves notifications from the REST API endpoints
  // ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return; // Do not fetch without a valid authentication token
    try {
      // Resolve endpoint and client instance based on the user role (admin vs student)
      const axiosInstance = role === "admin" ? api : studentApi;
      const endpoint = role === "admin" ? "/notifications/admin" : "/notifications/student";
      const { data } = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const incoming = data.notifications || [];

      // On subsequent polls, toast any notifications newer than what we last saw
      if (latestIdRef.current !== null && incoming.length > 0) {
        // Retrieve existing notification IDs
        const prevIds = new Set(
          notifications.map ? notifications.map((n) => n._id) : []
        );
        // Filter out unread, newly incoming notifications
        const brandNew = incoming.filter((n) => !prevIds.has(n._id) && !n.read);
        brandNew.forEach((n) => {
          if (onNotification) onNotification(n); // Execute dynamic notification callback
          toast(n.body, { // Display instant user alert toast
            duration: 4000,
            style: { fontSize: "13px", maxWidth: "320px" },
          });
        });
      }

      // Update the latest ID tracker for deduplication
      if (incoming.length > 0) latestIdRef.current = incoming[0]._id;
      setNotifications(incoming); // Update local state list
      setUnread(data.unread || 0); // Update unread count indicator
    } catch {
      // Fail silently without interrupting user interaction
    }
  }, [token, role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ──────────────────────────────────────────────────────
  // MARK ALL READ FUNCTION
  // Sets read status of all user notifications to true
  // ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      // Choose backend endpoint/instance depending on user role
      const axiosInstance = role === "admin" ? api : studentApi;
      const endpoint = role === "admin" ? "/notifications/admin/read-all" : "/notifications/student/read-all";
      await axiosInstance.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state list items
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0); // Reset unread count to 0
    } catch {
      // Fail silently
    }
  }, [token, role]);

  // ──────────────────────────────────────────────────────
  // MARK ONE READ FUNCTION
  // Sets read status of a single specific notification to true
  // ──────────────────────────────────────────────────────
  const markOneRead = useCallback(async (notifId) => {
    try {
      // Select appropriate axios instance for role
      const axiosInstance = role === "admin" ? api : studentApi;
      // Mark notification as read on the backend
      await axiosInstance.patch(`/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state list
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
      // Decrement the unread count indicator
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // Fail silently
    }
  }, [token, role]);

  // ──────────────────────────────────────────────────────
  // SOCKET.IO CONNECTION OR POLLING FALLBACK
  // Real-time notifications via WebSocket, or polling every 8 seconds
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    fetchNotifications(); // Initial retrieval on context load

    if (!SOCKET_URL) {
      // Vercel serverless: poll every 8 seconds for new notifications
      const interval = setInterval(fetchNotifications, 4000);
      return () => clearInterval(interval);
    }

    // May socket URL - connect via Socket.IO
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Prioritize WebSocket connections with HTTP polling fallback
      auth: { token }, // Include authentication token in connect payload
      reconnectionAttempts: 5, // Reconnection retry limit
    });
    socketRef.current = socket;

    // Connection established successfully
    socket.on("connect", () => {
      if (role === "admin") {
        socket.emit("join:admin"); // Subscribe to administrative channel
      } else {
        socket.emit("join:student", { studentId: id }); // Subscribe to personal student channel
      }

    });

    // Event listener for incoming real-time notifications
    socket.on("notification", (notif) => {
      // Prepend the new notification to local state (capped at 50)
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
      setUnread((c) => c + 1); // Increment unread count
      if (onNotification) onNotification(notif); // Fire callback hook

      // Display native app toast message
      toast(notif.body, {
        duration: 4000,
        style: { fontSize: "13px", maxWidth: "320px" },
      });
    });

    // Event listener for WebSocket connection errors
    socket.on("connect_error", () => {
      // Fallback silently to HTTP polling
    });

    // Cleanup function
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, role, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ──────────────────────────────────────────────────────
  // PROVIDER RETURN - Expose notification state and actions to children
  // ──────────────────────────────────────────────────────
  return (
    <NotificationContext.Provider
      value={{ notifications, unread, markAllRead, markOneRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ──────────────────────────────────────────────────────
// USE NOTIFICATIONS HOOK - Easy custom hook access to notifications context
// ──────────────────────────────────────────────────────
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

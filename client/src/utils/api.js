import axios from "axios";
import toast from "react-hot-toast";

// Base URL for API calls: uses environment variable or defaults to '/api'
const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: automatically attach JWT token from localStorage to requests
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("smartserve_user");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        if (config.headers?.set) {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }
    }
  } catch {
    // Silently ignore any parsing errors
  }
  return config;
});

// Response interceptor: handle rate limiting (429) gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const message = error.response?.data?.message || "Too many requests. Please wait a moment.";
      toast.error(message, { id: "rate-limit-toast" });
    }
    return Promise.reject(error);
  }
);

// Export the configured Axios instance for use in other modules
export default api;

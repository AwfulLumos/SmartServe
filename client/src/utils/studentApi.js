import axios from "axios";
import toast from "react-hot-toast";

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Create a configured Axios instance for student-facing API requests
const studentApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

studentApi.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("smartserve_student");
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
    // Ignore JSON parsing errors
  }
  return config;
});

// Response interceptor: handle rate limiting (429) gracefully
studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const message = error.response?.data?.message || "Too many requests. Please wait a moment.";
      toast.error(message, { id: "rate-limit-toast" });
    }
    return Promise.reject(error);
  }
);

export default studentApi;

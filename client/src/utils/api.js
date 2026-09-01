// Axios library for making HTTP requests
import axios from "axios";

// Base URL for API calls: uses environment variable or defaults to '/api'
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Create a configured Axios instance with base URL and default JSON headers
// This instance will be used for all API calls, ensuring consistent configuration
//React frontend cannot communicate with Express backend
// Axios is used to connect the frontend and backend of the system. It sends requests from the React frontend to the Express backend so the system can fetch, create, update, or delete data from MongoDB.

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

// Export the configured Axios instance for use in other modules
export default api;

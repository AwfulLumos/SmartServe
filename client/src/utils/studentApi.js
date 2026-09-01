// Import Axios library
// Purpose:
// Axios is used to let the frontend communicate with the backend server.
//
// Examples:
// - Login requests
// - Fetching orders
// - Saving data to MongoDB
// - Updating order status
//
// Without Axios:
// React frontend cannot talk to the Express backend.
import axios from "axios";


// Backend API URL
// Purpose:
// Tells the frontend where the backend server is located.
// It uses an environment variable (VITE_API_URL) if defined, otherwise defaults to '/api'.
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Create a configured Axios instance for student-facing API requests
const studentApi = axios.create({
  // Base backend URL
  // Example:
  // https://smartserve-main-2.onrender.com/api
  baseURL: API_URL,
  // Tells backend that request data is JSON format
  //
  // Example:
  // {
  //   "name": "Kimberly",
  //   "items": [...]
  // }
  headers: { "Content-Type": "application/json" },
});


// Axios Request Interceptor
// Purpose:
// Automatically runs BEFORE every API request.
//
// Main purpose:
// Automatically attach the student's login token
// to every request sent to the backend.
//
// This allows the backend to know:
//
// - Who is logged in
// - Which student placed the request
// - Whether the user is authorized
//
// Without this:
// Protected routes would fail because backend
// cannot identify the logged-in student.
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

// Export Axios instance
// Purpose:
// Allows other frontend files/pages/components
// to use this configured API connection.
//
// Example usage:
//
// studentApi.get("/orders")
// studentApi.post("/orders")
export default studentApi;

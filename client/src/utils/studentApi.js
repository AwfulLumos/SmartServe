import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const studentApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

studentApi.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("smartserve_student");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

export default studentApi;

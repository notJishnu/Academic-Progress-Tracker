import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const getApiErrorMessage = (error, fallback) => {
  const responseMessage = error.response?.data?.message;

  if (typeof responseMessage === "string") return responseMessage;
  if (responseMessage && typeof responseMessage === "object") {
    return responseMessage.message || Object.values(responseMessage).join(", ");
  }

  return error.message || fallback;
};

// Attach token automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

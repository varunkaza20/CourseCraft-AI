import axios from "axios";
import ROUTES from "../constants/routes";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    const isAuthRoute = err.config?.url?.includes('/api/auth/login') || err.config?.url?.includes('/api/auth/register');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("cc_token");
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;

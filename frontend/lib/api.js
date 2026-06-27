import axios from "axios";
import { getToken, getRefreshToken, setToken, clearToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip token refresh logic for auth endpoints
    if (originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          setToken(access, refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token is invalid/expired
          clearToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token
        clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
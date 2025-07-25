// Common axios configuration for all services
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:5000/api";

// Create axios instance with interceptors
const createApiInstance = () => {
  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add access token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for automatic token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Handle different authentication failure codes
        const errorCode = error.response?.data?.code;
        
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'AUTH_FAILED' || errorCode === 'INVALID_TOKEN') {
          try {
            console.log('🔄 Attempting token refresh for error:', errorCode);
            
            const response = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const { accessToken } = response.data.data;
            localStorage.setItem("accessToken", accessToken);

            if (response.data.data.user) {
              localStorage.setItem("user", JSON.stringify(response.data.data.user));
            }

            console.log('✅ Token refresh successful, retrying original request');
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            
            // Dispatch custom event for components to handle logout
            window.dispatchEvent(new CustomEvent('auth:logout'));
            
            // Only redirect if we're not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }
        
        // For other authentication errors (like EMAIL_NOT_VERIFIED, ACCOUNT_DEACTIVATED)
        // don't attempt refresh, just handle them appropriately
        if (errorCode === 'NO_TOKEN' || errorCode === 'USER_NOT_FOUND' || 
            errorCode === 'EMAIL_NOT_VERIFIED' || errorCode === 'ACCOUNT_DEACTIVATED') {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new CustomEvent('auth:logout'));
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = "/login";
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export { createApiInstance, API_URL };

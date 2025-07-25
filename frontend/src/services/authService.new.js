import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:5000/api";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
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

      // Check if it's a token expiration error
      if (error.response?.data?.code === "TOKEN_EXPIRED") {
        try {
          // Try to refresh the token
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          // Update user data if provided
          if (response.data.data.user) {
            localStorage.setItem(
              "user",
              JSON.stringify(response.data.data.user)
            );
          }

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          authService.logout();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Register user
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify email with OTP
  async verifyEmail(email, otp) {
    try {
      const response = await api.post("/auth/verify", { email, otp });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        // Refresh token is automatically stored in HTTP-only cookie
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        // Refresh token is automatically stored in HTTP-only cookie
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refresh access token
  async refreshToken() {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout user
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  },

  // Logout from all devices
  async logoutAll() {
    try {
      await api.post("/auth/logout-all");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return { success: true, message: "Logged out from all devices" };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get active sessions
  async getSessions() {
    try {
      const response = await api.get("/auth/sessions");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user role
  async updateRole(role) {
    try {
      const response = await api.put("/auth/role", { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // OAuth Methods
  // Get Google OAuth login URL
  getGoogleLoginUrl() {
    return `${API_URL}/auth/google`;
  },

  // Handle OAuth callback
  async handleOAuthCallback(token, isNewUser = false) {
    try {
      if (token) {
        // For legacy OAuth that returns JWT token directly
        localStorage.setItem("accessToken", token);

        // Get user profile to store user data
        const profileResponse = await this.getUserProfile();
        if (profileResponse.success) {
          localStorage.setItem("user", JSON.stringify(profileResponse.data));
        }

        return {
          success: true,
          isNewUser,
          user: profileResponse.data,
        };
      }

      throw new Error("No token received from OAuth");
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, {
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem("accessToken") !== null;
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Update password
  async updatePassword(passwordData) {
    try {
      const response = await api.put("/users/password", passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await api.put("/users/profile", profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Validate token (check if current token is valid)
  async validateToken() {
    try {
      const response = await api.get("/auth/validate");
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },

  // Change email
  async changeEmail(newEmail, password) {
    try {
      const response = await api.put("/users/email", {
        newEmail,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete account
  async deleteAccount(password) {
    try {
      const response = await api.delete("/users/account", {
        data: { password },
      });

      // Clear local storage after successful deletion
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get security settings
  async getSecuritySettings() {
    try {
      const response = await api.get("/users/security");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Enable/disable two-factor authentication
  async toggleTwoFactor(enable, password) {
    try {
      const response = await api.put("/users/two-factor", {
        enable,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;

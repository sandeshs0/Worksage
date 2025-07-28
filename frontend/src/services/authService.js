import { createApiInstance } from "./apiConfig";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:5000/api";

// Use shared API instance with consistent token handling
const api = createApiInstance();

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
      console.log("Verifying OTP:", { email, otp });
      const response = await api.post("/auth/verify", email, otp);

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
      console.log("🔐 Attempting login...", { email: credentials.email });
      const response = await api.post("/auth/login", credentials);
      console.log("✅ Login response:", response.data);

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        console.log("💾 Storing tokens and user data:", { user });
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        // Refresh token is automatically stored in HTTP-only cookie
      }

      return response.data;
    } catch (error) {
      console.error("❌ Login error:", error);
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
      console.log("👤 Fetching user profile...");
      const response = await api.get("/users/profile");
      console.log("✅ Profile response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Profile fetch error:", error);
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
  async handleOAuthCallback(accessToken, isNewUser = false) {
    try {
      console.log(
        "🔐 OAuth callback started with token:",
        accessToken ? "✅ Present" : "❌ Missing"
      );

      if (accessToken) {
        // Token should already be stored by GoogleAuthCallback component
        // but ensure it's stored here too for safety
        localStorage.setItem("accessToken", accessToken);
        console.log("💾 Access token confirmed in localStorage");

        // Get user profile to store user data
        console.log("👤 Fetching user profile...");
        const profileResponse = await this.getUserProfile();
        console.log("📋 Profile response:", profileResponse);

        let userData = null;
        if (profileResponse.success && profileResponse.data) {
          userData = profileResponse.data;
        } else if (profileResponse.data) {
          // Handle case where success field might be missing but data is present
          userData = profileResponse.data;
        } else {
          // Still try to extract user data from different possible structures
          userData = profileResponse.user || profileResponse;
        }

        if (
          userData &&
          typeof userData === "object" &&
          (userData._id || userData.id)
        ) {
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("✅ User data stored:", userData);
        } else {
          console.warn(
            "⚠️ Could not extract valid user data:",
            profileResponse
          );
        }

        return {
          success: true,
          isNewUser,
          user: userData,
        };
      }

      throw new Error("No access token received from OAuth");
    } catch (error) {
      console.error("❌ OAuth callback error:", error);
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

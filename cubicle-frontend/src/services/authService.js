import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "x-auth-token": `${token}`,
    },
  };
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Response from the API
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify user email with OTP
 * @param {Object} verificationData - Email and OTP data
 * @returns {Promise} - Response with JWT token on success
 */
export const verifyOtp = async (verificationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/verify`,
      verificationData
    );
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Log in a user with email and password
 * @param {Object} loginData - User login credentials
 * @returns {Promise} - Response with JWT token on success
 */
export const login = async (loginData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user role
 * @param {Object} roleData - Role data to update
 * @returns {Promise} - Response from the API
 */
export const updateUserRole = async (roleData) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "x-auth-token": token,
      },
    };
    const response = await axios.put(`${API_URL}/auth/role`, roleData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get Google OAuth login URL
 * @returns {String} - Google login URL
 */
export const getGoogleLoginUrl = () => {
  return `${API_URL}/auth/google`;
};

/**
 * Log out the current user
 */
export const logout = () => {
  localStorage.removeItem("token");
};

/**
 * Extract and process OAuth token from URL
 * @param {string} token - JWT token from URL query parameter
 * @returns {boolean} - Whether token was successfully processed
 */
export const processOAuthToken = (token) => {
  if (!token) return false;

  try {
    // Store token
    localStorage.setItem("token", token);
    return true;
  } catch (error) {
    console.error("Error processing OAuth token:", error);
    return false;
  }
};

/**
 * Fetch the current user's profile
 * @returns {Promise} - Response with user profile data
 */
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const config = {
      headers: {
        "x-auth-token": token,
      },
    };

    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile information
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
const updateUserProfile = async (userData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({
        name: userData.fullName,
        // email: userData.email,
        // phone: userData.phone,
        // company: userData.company,
        role: userData.role,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Object containing current and new password
 * @returns {Promise<boolean>} Success status
 */
const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change password");
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload user profile picture
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - Response with updated user data
 */
const updateProfilePicture = async (imageFile) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Create form data
    const formData = new FormData();
    formData.append("profileImage", imageFile);

    const response = await axios.put(`${API_URL}/users/me/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-auth-token": token,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add to the exported service object
const authService = {
  register,
  verifyOtp,
  login,
  updateUserRole,
  getGoogleLoginUrl,
  logout,
  processOAuthToken,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateProfilePicture, // Add this line
};

export default authService;

import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

/**
 * Get authentication token from local storage
 * @returns {string|null} The auth token or null if not found
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Add a new email account
 * @param {Object} emailData - Email account details
 * @param {string} emailData.email - Email address
 * @param {string} emailData.displayName - Display name for the email
 * @param {Object} emailData.smtp - SMTP configuration
 * @param {string} emailData.smtp.host - SMTP host
 * @param {number} emailData.smtp.port - SMTP port
 * @param {boolean} emailData.smtp.secure - Whether to use SSL/TLS
 * @param {Object} emailData.auth - Authentication details
 * @param {string} emailData.auth.user - SMTP username
 * @param {string} emailData.auth.pass - SMTP password
 * @returns {Promise<Object>} The created email account
 */
const addEmailAccount = async (emailData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(`${API_URL}/email-accounts`, emailData, {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with an error status
      throw new Error(
        error.response.data.message || "Failed to add email account"
      );
    }
    throw error;
  }
};

/**
 * Verify an email account using the token sent to that email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Verification result
 */
const verifyEmailAccount = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/email-accounts/verify/${token}`,
      { headers: { "x-auth-token": getToken() } }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to verify email account"
      );
    }
    throw error;
  }
};

/**
 * Get all email accounts for the current user
 * @returns {Promise<Array>} List of email accounts
 */
const getEmailAccounts = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/email-accounts`, {
      headers: {
        "x-auth-token": token,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch email accounts"
      );
    }
    throw error;
  }
};

/**
 * Set an email account as the default sender
 * @param {string} id - Email account ID
 * @returns {Promise<Object>} Updated email account
 */
const setDefaultEmailAccount = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      `${API_URL}/email-accounts/${id}/set-default`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to set default email account"
      );
    }
    throw error;
  }
};

/**
 * Delete an email account
 * @param {string} id - Email account ID
 * @returns {Promise<Object>} Result of deletion
 */
const deleteEmailAccount = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.delete(`${API_URL}/email-accounts/${id}`, {
      headers: {
        "x-auth-token": token,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to delete email account"
      );
    }
    throw error;
  }
};

const settingsService = {
  addEmailAccount,
  verifyEmailAccount,
  getEmailAccounts,
  setDefaultEmailAccount,
  deleteEmailAccount,
};

export default settingsService;

import { createApiInstance } from './apiConfig';

const api = createApiInstance();

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
    const response = await api.post('/email-accounts', emailData);
    return response.data;
  } catch (error) {
    console.error("Error adding email account:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get all email accounts for the current user
 * @returns {Promise<Array>} Array of email accounts
 */
const getEmailAccounts = async () => {
  try {
    const response = await api.get('/email-accounts');
    return response.data;
  } catch (error) {
    console.error("Error fetching email accounts:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update an email account
 * @param {string} accountId - Email account ID
 * @param {Object} emailData - Updated email account data
 * @returns {Promise<Object>} The updated email account
 */
const updateEmailAccount = async (accountId, emailData) => {
  try {
    const response = await api.put(`/email-accounts/${accountId}`, emailData);
    return response.data;
  } catch (error) {
    console.error("Error updating email account:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete an email account
 * @param {string} accountId - Email account ID
 * @returns {Promise<Object>} Success message
 */
const deleteEmailAccount = async (accountId) => {
  try {
    const response = await api.delete(`/email-accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting email account:", error);
    throw error.response?.data || error;
  }
};

/**
 * Test an email account connection
 * @param {Object} emailData - Email account configuration to test
 * @returns {Promise<Object>} Test result
 */
const testEmailAccount = async (emailData) => {
  try {
    const response = await api.post('/email-accounts/test', emailData);
    return response.data;
  } catch (error) {
    console.error("Error testing email account:", error);
    throw error.response?.data || error;
  }
};

/**
 * Set default email account
 * @param {string} accountId - Email account ID to set as default
 * @returns {Promise<Object>} Updated account
 */
const setDefaultEmailAccount = async (accountId) => {
  try {
    const response = await api.patch(`/email-accounts/${accountId}/default`);
    return response.data;
  } catch (error) {
    console.error("Error setting default email account:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get user profile settings
 * @returns {Promise<Object>} User profile data
 */
const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} Updated profile
 */
const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success message
 */
const updateUserPassword = async (passwordData) => {
  try {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error.response?.data || error;
  }
};

/**
 * Upload user avatar
 * @param {File} avatarFile - Avatar image file
 * @returns {Promise<Object>} Updated profile with new avatar URL
 */
const uploadAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error.response?.data || error;
  }
};

export default {
  addEmailAccount,
  getEmailAccounts,
  updateEmailAccount,
  deleteEmailAccount,
  testEmailAccount,
  setDefaultEmailAccount,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  uploadAvatar
};

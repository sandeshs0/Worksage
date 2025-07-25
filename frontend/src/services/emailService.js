import { createApiInstance } from './apiConfig';

const api = createApiInstance();

/**
 * Send an email through the API
 * @param {FormData|Object} data - The email data as FormData (for attachments) or Object
 * @returns {Promise} - The API response
 */
export const sendEmail = async (data) => {
  try {
    // Determine if we're sending FormData (with attachments) or JSON
    const isFormData = data instanceof FormData;

    const config = isFormData ? {
      headers: {
        // Let browser set Content-Type for FormData
      }
    } : {};

    const response = await api.post("/emails", data, config);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get emails from the API
 * @param {Object} params - Query parameters
 * @returns {Promise} - The API response
 */
export const getEmails = async (params = { page: 1, limit: 10, status: "sent" }) => {
  try {
    const response = await api.get("/emails", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get email by ID
 * @param {string} emailId - The email ID
 * @returns {Promise} - The API response
 */
export const getEmailById = async (emailId) => {
  try {
    const response = await api.get(`/emails/${emailId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching email:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete email by ID
 * @param {string} emailId - The email ID
 * @returns {Promise} - The API response
 */
export const deleteEmail = async (emailId) => {
  try {
    const response = await api.delete(`/emails/${emailId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting email:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get email statistics
 * @returns {Promise} - The API response
 */
export const getEmailStats = async () => {
  try {
    const response = await api.get("/emails/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching email stats:", error);
    throw error.response?.data || error;
  }
};

/**
 * Send test email
 * @param {Object} data - Test email data
 * @returns {Promise} - The API response
 */
export const sendTestEmail = async (data) => {
  try {
    const response = await api.post("/email/send-test", data);
    return response.data;
  } catch (error) {
    console.error("Error sending test email:", error);
    throw error.response?.data || error;
  }
};

/**
 * Check email account status
 * @returns {Promise} - The API response
 */
export const checkEmailAccount = async () => {
  try {
    const response = await api.get("/email-accounts/check");
    return response.data;
  } catch (error) {
    console.error("Error checking email account:", error);
    throw error.response?.data || error;
  }
};

/**
 * Rewrite email content using AI
 * @param {Object} data - Email content and rewrite parameters
 * @returns {Promise} - The API response with rewritten content
 */
export const rewriteEmailWithAI = async (data) => {
  try {
    const response = await api.post("/ai/rewrite-email", data);
    return response.data;
  } catch (error) {
    console.error("Error rewriting email with AI:", error);
    throw error.response?.data || error;
  }
};

export default {
  sendEmail,
  getEmails,
  getEmailById,
  deleteEmail,
  getEmailStats,
  sendTestEmail,
  checkEmailAccount,
  rewriteEmailWithAI
};

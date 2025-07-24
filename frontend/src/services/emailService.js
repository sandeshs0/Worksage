import axios from "axios";
// import { API_BASE_URL } from '../config'; // Adjust this import based on your project structure

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// Get token from localStorage (you might have a utility function for this)
const getAuthToken = () => localStorage.getItem("token");

/**
 * Send an email through the API
 * @param {FormData|Object} data - The email data as FormData (for attachments) or Object
 * @returns {Promise} - The API response
 */
export const sendEmail = async (data) => {
  try {
    // Determine if we're sending FormData (with attachments) or JSON
    const isFormData = data instanceof FormData;

    const headers = {
      "x-auth-token": getAuthToken(),
    };

    // Only set Content-Type for JSON data, browser sets it automatically for FormData with boundary
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
      // Convert regular object to JSON if not FormData
      data = JSON.stringify(data);
    }

    const response = await axios.post(`${API_BASE_URL}/api/emails`, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Get emails from the API
 * @param {Object} params - Query parameters
 * @returns {Promise} - The API response
 */
export const getEmails = async (
  params = { page: 1, limit: 10, status: "sent" }
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/emails`, {
      headers: {
        "x-auth-token": getAuthToken(),
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
};

// Add this to your emailService.js file
export const checkEmailAccount = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/email-accounts/check`,
      {
        headers: {
          "x-auth-token": getAuthToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking email account:", error);
    throw error;
  }
};

export const rewriteEmailWithAI = async ({ text, tone, length }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/ai/rewrite-email`,
      { text, tone, length },
      {
        headers: {
          "x-auth-token": getAuthToken(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error rewriting email:", error);
    throw error;
  }
};

/**
 * Get email statistics
 */
export const getEmailStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/emails/stats`, {
      headers: {
        "x-auth-token": getAuthToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching email stats:", error);
    throw error;
  }
};

import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const getAuthToken = () => localStorage.getItem("token");

/**
 * Get notifications with pagination
 * @param {Object} options - Request options
 * @param {Number} options.limit - Number of notifications to fetch
 * @param {Number} options.skip - Number of notifications to skip
 * @returns {Promise} Promise with notifications data
 */
export const getNotifications = async ({ limit = 10, skip = 0 } = {}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/notifications?limit=${limit}&skip=${skip}`,
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {String} id - Notification ID
 * @returns {Promise} Promise with updated notification
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/notifications/${id}/read`,
      {},
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise} Promise with success message
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/notifications/read-all`,
      {},
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

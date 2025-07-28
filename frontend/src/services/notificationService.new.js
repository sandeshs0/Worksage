import { createApiInstance } from "./apiConfig";

const api = createApiInstance();

/**
 * Get notifications with pagination
 * @param {Object} options - Request options
 * @param {Number} options.limit - Number of notifications to fetch
 * @param {Number} options.skip - Number of notifications to skip
 * @returns {Promise} Promise with notifications data
 */
export const getNotifications = async ({ limit = 10, skip = 0 } = {}) => {
  try {
    const response = await api.get(
      `/notifications?limit=${limit}&skip=${skip}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error.response?.data || error;
  }
};

/**
 * Mark a notification as read
 * @param {String} id - Notification ID
 * @returns {Promise} Promise with updated notification
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error.response?.data || error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise} Promise with success status
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a notification
 * @param {String} id - Notification ID
 * @returns {Promise} Promise with success status
 */
export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get unread notification count
 * @returns {Promise} Promise with unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error.response?.data || error;
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
};

import { createApiInstance } from "./apiConfig";

const api = createApiInstance();

/**
 * Get all columns with tasks for a board
 * @param {string} boardId - Board ID
 * @returns {Promise} Response from the API
 */
export const getBoardColumns = async (boardId) => {
  try {
    const response = await api.get(`/boards/${boardId}/columns`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching columns:", error);
    throw error.response?.data || error;
  }
};

/**
 * Create a new column
 * @param {Object} columnData - Column data (title, boardId)
 * @returns {Promise} Response from the API
 */
export const createColumn = async (columnData) => {
  try {
    const response = await api.post("/columns", columnData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating column:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update a column
 * @param {string} id - Column ID
 * @param {Object} columnData - Updated column data
 * @returns {Promise} Response from the API
 */
export const updateColumn = async (id, columnData) => {
  try {
    const response = await api.put(`/columns/${id}`, columnData);
    return response.data.data;
  } catch (error) {
    console.error("Error updating column:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a column
 * @param {string} id - Column ID
 * @returns {Promise} Response from the API
 */
export const deleteColumn = async (id) => {
  try {
    const response = await api.delete(`/columns/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting column:", error);
    throw error.response?.data || error;
  }
};

/**
 * Reorder columns in a board
 * @param {string} boardId - Board ID
 * @param {Array} columnOrder - Array of column IDs in new order
 * @returns {Promise} Response from the API
 */
export const reorderColumns = async (boardId, columnOrder) => {
  try {
    const response = await api.patch(`/boards/${boardId}/columns/reorder`, {
      columnOrder,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error reordering columns:", error);
    throw error.response?.data || error;
  }
};

export default {
  getBoardColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
};

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
 * Get all columns with tasks for a board
 * @param {string} boardId - Board ID
 * @returns {Promise} Response from the API
 */
export const getBoardColumns = async (boardId) => {
  try {
    const response = await axios.get(
      `${API_URL}/boards/${boardId}/columns`,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching columns:", error);
    throw error;
  }
};

/**
 * Create a new column
 * @param {Object} columnData - Column data (title, boardId)
 * @returns {Promise} Response from the API
 */
export const createColumn = async (columnData) => {
  try {
    const response = await axios.post(
      `${API_URL}/columns`,
      columnData,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating column:", error);
    throw error;
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
    const response = await axios.put(
      `${API_URL}/columns/${id}`,
      columnData,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating column:", error);
    throw error;
  }
};

/**
 * Delete a column
 * @param {string} id - Column ID
 * @returns {Promise} Response from the API
 */
export const deleteColumn = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/columns/${id}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting column:", error);
    throw error;
  }
};

/**
 * Reorder columns
 * @param {string} boardId - Board ID
 * @param {Array} columnOrder - Array of column IDs in the new order
 * @returns {Promise} Response from the API
 */
export const reorderColumns = async (boardId, columnOrder) => {
  try {
    const response = await axios.put(
      `${API_URL}/boards/${boardId}/columns/reorder`,
      {
        columnOrder,
      },
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error reordering columns:", error);
    throw error;
  }
};

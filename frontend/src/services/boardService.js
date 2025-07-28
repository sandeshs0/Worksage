import { createApiInstance } from "./apiConfig";

const api = createApiInstance();

/**
 * Get all boards for the current user
 * @returns {Promise} Response from the API
 */
export const getUserBoards = async () => {
  try {
    const response = await api.get("/boards");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw error.response?.data || error;
  }
};

/**
 * Create a new board
 * @param {Object} boardData - Board data (title, description)
 * @returns {Promise} Response from the API
 */
export const createBoard = async (boardData) => {
  try {
    const response = await api.post("/boards", boardData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating board:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get a board by ID with all columns and tasks
 * @param {string} id - Board ID
 * @returns {Promise} Response from the API
 */
export const getBoard = async (id) => {
  try {
    const response = await api.get(`/boards/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching board:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update a board
 * @param {string} id - Board ID
 * @param {Object} boardData - Updated board data
 * @returns {Promise} Response from the API
 */
export const updateBoard = async (id, boardData) => {
  try {
    const response = await api.put(`/boards/${id}`, boardData);
    return response.data.data;
  } catch (error) {
    console.error("Error updating board:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a board
 * @param {string} id - Board ID
 * @returns {Promise} Response from the API
 */
export const deleteBoard = async (id) => {
  try {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error.response?.data || error;
  }
};

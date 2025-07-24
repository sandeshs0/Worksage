import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "x-auth-token": `${token}`,
    },
  };
};

/**
 * Get all boards for the current user
 * @returns {Promise} Response from the API
 */
export const getUserBoards = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/boards`, getAuthHeader());
    return response.data.data;
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw error;
  }
};

/**
 * Create a new board
 * @param {Object} boardData - Board data (title, description)
 * @returns {Promise} Response from the API
 */
export const createBoard = async (boardData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/boards`,
      boardData,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
};

/**
 * Get a board by ID with all columns and tasks
 * @param {string} id - Board ID
 * @returns {Promise} Response from the API
 */
export const getBoard = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/boards/${id}`,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching board:", error);
    throw error;
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
    const response = await axios.put(
      `${API_URL}/api/boards/${id}`,
      boardData,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating board:", error);
    throw error;
  }
};

/**
 * Delete a board
 * @param {string} id - Board ID
 * @returns {Promise} Response from the API
 */
export const deleteBoard = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/boards/${id}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};

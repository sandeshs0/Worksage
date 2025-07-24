import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/clients`;

// Helper function to get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "x-auth-token": `${token}`,
    },
  };
};

/**
 * Get all clients for authenticated user
 * @returns {Promise} List of clients
 */
const getAllClients = async () => {
  try {
    const response = await axios.get(`${API_URL}/getClients`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific client by ID
 * @param {string} clientId - ID of the client to retrieve
 * @returns {Promise} Client data
 */
const getClientById = async (clientId) => {
  try {
    const response = await axios.get(`${API_URL}/${clientId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new client with possible file upload
 * @param {FormData|Object} clientData - Client data with optional file
 * @returns {Promise} Created client data
 */
const createClient = async (clientData) => {
  try {
    // Check if we're sending FormData (for file uploads)
    const isFormData = clientData instanceof FormData;

    const config = {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        // Only set Content-Type for non-FormData requests
        // For FormData, let the browser set the Content-Type with boundary
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    };

    const response = await axios.post(
      `${API_URL}/createClient`,
      clientData,
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing client with possible file upload
 * @param {string} clientId - ID of the client to update
 * @param {FormData|Object} clientData - Updated client data with optional file
 * @returns {Promise} Updated client data
 */
const updateClient = async (clientId, clientData) => {
  try {
    // Check if we're sending FormData (for file uploads)
    const isFormData = clientData instanceof FormData;

    const config = {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        // Only set Content-Type for non-FormData requests
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    };

    const response = await axios.put(
      `${API_URL}/${clientId}`,
      clientData,
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a client
 * @param {string} clientId - ID of the client to delete
 * @returns {Promise} Success message
 */
const deleteClient = async (clientId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${clientId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const clientService = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};

export default clientService;

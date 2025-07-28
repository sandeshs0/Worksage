import { createApiInstance } from "./apiConfig";

const api = createApiInstance();

/**
 * Get all clients for authenticated user
 * @returns {Promise} List of clients
 */
const getAllClients = async () => {
  try {
    const response = await api.get("/clients/getClients");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get a specific client by ID
 * @param {string} clientId - ID of the client to retrieve
 * @returns {Promise} Client data
 */
const getClientById = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create a new client with possible file upload
 * @param {FormData|Object} clientData - Client data with optional file
 * @returns {Promise} Created client data
 */
const createClient = async (clientData) => {
  try {
    const isFormData = clientData instanceof FormData;

    // For FormData, don't set Content-Type - let browser handle it
    const config = isFormData
      ? {
          headers: {
            // Remove Content-Type for FormData to allow browser to set boundary
          },
        }
      : {};

    const response = await api.post(
      "/clients/createClient",
      clientData,
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
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
    const isFormData = clientData instanceof FormData;

    const config = isFormData
      ? {
          headers: {
            // Remove Content-Type for FormData
          },
        }
      : {};

    const response = await api.put(`/clients/${clientId}`, clientData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a client
 * @param {string} clientId - ID of the client to delete
 * @returns {Promise} Success message
 */
const deleteClient = async (clientId) => {
  try {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
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

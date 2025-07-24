import axios from "axios";

// Updated API URL to match the new endpoint
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/projects`;

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
 * Get all projects
 * @returns {Promise} List of projects
 */
const getAllProjects = async () => {
  console.log("getAllProjects called");
  try {
   
    console.log("Making API call to:", API_URL);
    const response = await axios.get(API_URL, getAuthHeader());
    console.log("API response:", response);
    return response.data;
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    // Return empty array to prevent further errors
    return [];
  }
};

/**
 * Get a project by ID
 * @param {string} projectId - ID of the project
 * @returns {Promise} Project details
 */
const getProjectById = async (projectId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${projectId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new project
 * @param {Object} projectData - Project information
 * @returns {Promise} Created project
 */
const createProject = async (projectData) => {
  try {
    const response = await axios.post(API_URL, projectData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing project
 * @param {string} projectId - ID of the project
 * @param {Object} projectData - Updated project information
 * @returns {Promise} Updated project
 */
const updateProject = async (projectId, projectData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${projectId}`,
      projectData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update project status and completion rate only
 * @param {string} projectId - ID of the project
 * @param {Object} updateData - Contains status and completionRate
 * @returns {Promise} Updated project
 */
const updateProjectStatus = async (projectId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${projectId}/status`,
      updateData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a project
 * @param {string} projectId - ID of the project
 * @returns {Promise} Delete confirmation
 */
const deleteProject = async (projectId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${projectId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all projects for a specific client
 * @param {string} clientId - ID of the client
 * @returns {Promise} List of projects for the client
 */
const getProjectsByClient = async (clientId) => {
  try {
    const response = await axios.get(
      `${API_URL}/client/${clientId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching client projects:", error);
    return [];
  }
};

/**
 * Get all projects by status
 * @param {string} status - Status to filter by (e.g., 'in progress', 'completed')
 * @returns {Promise} Filtered list of projects
 */
const getProjectsByStatus = async (status) => {
  try {
    const response = await axios.get(
      `${API_URL}/status/${status}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} projects:`, error);
    return [];
  }
};

/**
 * Update project cover image
 * @param {string} projectId - ID of the project to update
 * @param {File} imageFile - The image file to upload
 * @returns {Promise} Updated cover image URL
 */
const updateProjectCover = async (projectId, imageFile) => {
  try {
    // Create form data object to send file
    const formData = new FormData();
    formData.append('coverImage', imageFile);

    const response = await axios.put(
      `${API_URL}/${projectId}/cover`,
      formData,
      {
        ...getAuthHeader(),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating project cover:', error);
    throw error;
  }
};

const projectService = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectsByClient,
  getProjectsByStatus,
  updateProjectCover,
};

export default projectService;

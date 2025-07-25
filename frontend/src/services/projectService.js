import { createApiInstance } from './apiConfig';

const api = createApiInstance();

/**
 * Get all projects
 * @returns {Promise} List of projects
 */
const getAllProjects = async () => {
  console.log("getAllProjects called");
  try {
    console.log("Making API call to: /projects");
    const response = await api.get("/projects");
    console.log("API response:", response);
    return response.data;
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    throw error.response?.data || error;
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
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error.response?.data || error;
  }
};

/**
 * Create a new project
 * @param {Object} projectData - Project information
 * @returns {Promise} Created project
 */
const createProject = async (projectData) => {
  try {
    const response = await api.post("/projects", projectData);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error.response?.data || error;
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
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error.response?.data || error;
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
    const response = await api.patch(`/projects/${projectId}/status`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a project
 * @param {string} projectId - ID of the project
 * @returns {Promise} Delete confirmation
 */
const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get all projects for a specific client
 * @param {string} clientId - ID of the client
 * @returns {Promise} List of projects for the client
 */
const getProjectsByClient = async (clientId) => {
  try {
    const response = await api.get(`/projects/client/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client projects:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get all projects by status
 * @param {string} status - Status to filter by (e.g., 'in progress', 'completed')
 * @returns {Promise} Filtered list of projects
 */
const getProjectsByStatus = async (status) => {
  try {
    const response = await api.get(`/projects/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} projects:`, error);
    throw error.response?.data || error;
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
    const formData = new FormData();
    formData.append('coverImage', imageFile);

    const response = await api.put(`/projects/${projectId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating project cover:', error);
    throw error.response?.data || error;
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

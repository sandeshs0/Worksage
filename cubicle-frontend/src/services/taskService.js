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
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise} Response from the API
 */
export const createTask = async (taskData) => {
  try {
    const formData = new FormData();

    // Add basic task fields
    formData.append("title", taskData.title);
    formData.append("columnId", taskData.columnId);
    formData.append("boardId", taskData.boardId);
    if (taskData.description)
      formData.append("description", taskData.description);
    if (taskData.dueDate)
      formData.append("dueDate", taskData.dueDate.toISOString());
    if (taskData.priority) formData.append("priority", taskData.priority);

    // Handle assignedTo - append each ID individually with the same field name
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      taskData.assignedTo.forEach((userId) => {
        formData.append("assignedTo[]", userId);
      });
    } else {
      // Empty array case
      formData.append("assignedTo", "[]");
    }
    // Don't append anything for empty arrays - let backend handle default

    if (taskData.labels && taskData.labels.length > 0) {
      formData.append("labels", JSON.stringify(taskData.labels));
    }
    // Don't append anything for empty arrays - let backend handle default

    if (taskData.subtasks && taskData.subtasks.length > 0) {
      formData.append("subtasks", JSON.stringify(taskData.subtasks));
    }

    // Handle cover image file if it exists
    if (taskData.coverImage instanceof File) {
      formData.append("coverImage", taskData.coverImage);
    }

    const response = await axios.post(`${API_URL}/tasks`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader().headers,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Get a task by ID
 * @param {string} id - Task ID
 * @returns {Promise} Response from the API
 */
export const getTask = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${id}`, getAuthHeader());
    return response.data.data;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

/**
 * Update a task
 * @param {string} id - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise} Response from the API
 */
export const updateTask = async (id, taskData) => {
  try {
    const formData = new FormData();

    // Add all fields that might have changed
    if (taskData.title !== undefined) formData.append("title", taskData.title);
    if (taskData.description !== undefined)
      formData.append("description", taskData.description);
    if (taskData.columnId !== undefined)
      formData.append("columnId", taskData.columnId);
    if (taskData.dueDate !== undefined) {
      formData.append(
        "dueDate",
        taskData.dueDate ? taskData.dueDate.toISOString() : ""
      );
    }
    if (taskData.priority !== undefined)
      formData.append("priority", taskData.priority);

    // Handle assignedTo - correctly handle array
    if (taskData.assignedTo !== undefined) {
      if (taskData.assignedTo && taskData.assignedTo.length > 0) {
        taskData.assignedTo.forEach((userId) => {
          formData.append("assignedTo[]", userId);
        });
      }
      // Don't append anything for empty arrays - let backend handle default
    }

    // Handle labels - correctly handle array
    if (taskData.labels !== undefined) {
      if (taskData.labels && taskData.labels.length > 0) {
        formData.append("labels", JSON.stringify(taskData.labels));
      }
      // Don't append anything for empty arrays - let backend handle default
    }

    if (taskData.subtasks !== undefined) {
      formData.append("subtasks", JSON.stringify(taskData.subtasks || []));
    }

    // Handle cover image
    if (taskData.coverImage instanceof File) {
      formData.append("coverImage", taskData.coverImage);
    } else if (taskData.coverImage === null) {
      // User wants to remove the cover image
      formData.append("removeCover", "true");
    }

    const response = await axios.put(`${API_URL}/tasks/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader().headers,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} id - Task ID
 * @returns {Promise} Response from the API
 */
export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/tasks/${id}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

/**
 * Move a task between columns or reorder within a column
 * @param {string} id - Task ID
 * @param {string} columnId - Target column ID
 * @param {number} position - New position in the column
 * @returns {Promise} Response from the API
 */
export const moveTask = async (id, columnId, position) => {
  try {
    const response = await axios.put(
      `${API_URL}/tasks/${id}/move`,
      { columnId, position },
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error moving task:", error);
    throw error;
  }
};

/**
 * Assign users to a task
 * @param {string} id - Task ID
 * @param {Array} userIds - Array of user IDs
 * @returns {Promise} Response from the API
 */
export const assignTask = async (id, userIds) => {
  try {
    const response = await axios.put(
      `${API_URL}/tasks/${id}/assign`,
      { assignedTo: userIds },
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error assigning task:", error);
    throw error;
  }
};

/**
 * Add or update checklist items
 * @param {string} id - Task ID
 * @param {Array} checklist - Array of checklist items
 * @returns {Promise} Response from the API
 */
export const updateTaskChecklist = async (id, checklist) => {
  try {
    const response = await axios.put(
      `${API_URL}/tasks/${id}/checklist`,
      { checklist },
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating task checklist:", error);
    throw error;
  }
};

/**
 * Toggle checklist item completion
 * @param {string} taskId - Task ID
 * @param {string} itemId - Checklist item ID
 * @param {boolean} completed - Completion status
 * @returns {Promise} Response from the API
 */
export const toggleChecklistItem = async (taskId, itemId, completed) => {
  try {
    const response = await axios.put(
      `${API_URL}/tasks/${taskId}/checklist/${itemId}/toggle`,
      { completed },
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    throw error;
  }
};

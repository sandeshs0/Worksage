import { createApiInstance } from './apiConfig';

const api = createApiInstance();

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
    if (taskData.description) formData.append("description", taskData.description);
    if (taskData.dueDate) formData.append("dueDate", taskData.dueDate.toISOString());
    if (taskData.priority) formData.append("priority", taskData.priority);

    // Handle assignedTo - append each ID individually
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      taskData.assignedTo.forEach((userId) => {
        formData.append("assignedTo[]", userId);
      });
    } else {
      formData.append("assignedTo", "[]");
    }

    if (taskData.labels && taskData.labels.length > 0) {
      formData.append("labels", JSON.stringify(taskData.labels));
    }

    if (taskData.subtasks && taskData.subtasks.length > 0) {
      formData.append("subtasks", JSON.stringify(taskData.subtasks));
    }

    // Handle file attachments
    if (taskData.attachments && taskData.attachments.length > 0) {
      taskData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await api.post('/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get a task by ID
 * @param {string} id - Task ID
 * @returns {Promise} Response from the API
 */
export const getTask = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error.response?.data || error;
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

    // Add basic fields if they exist
    if (taskData.title) formData.append("title", taskData.title);
    if (taskData.description !== undefined) formData.append("description", taskData.description);
    if (taskData.dueDate) formData.append("dueDate", taskData.dueDate.toISOString());
    if (taskData.priority) formData.append("priority", taskData.priority);
    if (taskData.status) formData.append("status", taskData.status);

    // Handle assignedTo
    if (taskData.assignedTo !== undefined) {
      if (taskData.assignedTo.length > 0) {
        taskData.assignedTo.forEach((userId) => {
          formData.append("assignedTo[]", userId);
        });
      } else {
        formData.append("assignedTo", "[]");
      }
    }

    if (taskData.labels !== undefined) {
      formData.append("labels", JSON.stringify(taskData.labels));
    }

    if (taskData.subtasks !== undefined) {
      formData.append("subtasks", JSON.stringify(taskData.subtasks));
    }

    // Handle new file attachments
    if (taskData.newAttachments && taskData.newAttachments.length > 0) {
      taskData.newAttachments.forEach((file) => {
        formData.append(`attachments`, file);
      });
    }

    // Handle removed attachments
    if (taskData.removedAttachments && taskData.removedAttachments.length > 0) {
      formData.append("removedAttachments", JSON.stringify(taskData.removedAttachments));
    }

    const response = await api.put(`/tasks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a task
 * @param {string} id - Task ID
 * @returns {Promise} Response from the API
 */
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error.response?.data || error;
  }
};

/**
 * Move a task to a different column/position
 * @param {string} id - Task ID
 * @param {string} columnId - Target column ID
 * @param {number} position - New position in the column
 * @returns {Promise} Response from the API
 */
export const moveTask = async (id, columnId, position) => {
  try {
    const response = await api.put(`/tasks/${id}/move`, {
      columnId,
      position
    });
    return response.data.data;
  } catch (error) {
    console.error("Error moving task:", error);
    throw error.response?.data || error;
  }
};

/**
 * Assign users to a task
 * @param {string} id - Task ID
 * @param {Array} userIds - Array of user IDs to assign
 * @returns {Promise} Response from the API
 */
export const assignTask = async (id, userIds) => {
  try {
    const response = await api.patch(`/tasks/${id}/assign`, {
      assignedTo: userIds
    });
    return response.data.data;
  } catch (error) {
    console.error("Error assigning task:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update task checklist/subtasks
 * @param {string} id - Task ID
 * @param {Array} checklist - Updated checklist items
 * @returns {Promise} Response from the API
 */
export const updateTaskChecklist = async (id, checklist) => {
  try {
    const response = await api.patch(`/tasks/${id}/checklist`, {
      subtasks: checklist
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating task checklist:", error);
    throw error.response?.data || error;
  }
};

/**
 * Toggle completion status of a checklist item
 * @param {string} taskId - Task ID
 * @param {string} itemId - Checklist item ID
 * @param {boolean} completed - Completion status
 * @returns {Promise} Response from the API
 */
export const toggleChecklistItem = async (taskId, itemId, completed) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/checklist/${itemId}`, {
      completed
    });
    return response.data.data;
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    throw error.response?.data || error;
  }
};

export default {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
  updateTaskChecklist,
  toggleChecklistItem
};

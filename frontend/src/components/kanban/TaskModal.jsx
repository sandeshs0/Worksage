import {
  Calendar,
  CheckSquare,
  Image,
  Plus,
  Tag,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { createTask, updateTask } from "../../services/taskService"; // Adjust the import path as needed

const TaskModal = ({
  task = null,
  columnId,
  boardId,
  onClose,
  onSave,
  onTaskCreated,
  columns = {},
  users = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: null,
    priority: "medium",
    assignedTo: [],
    columnId: columnId,
    subtasks: [],
    labels: [],
    coverImage: null,
  });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newLabel, setNewLabel] = useState({ text: "", color: "#3b82f6" });
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (task) {
      // Transform existing data if needed
      const subtasks = task.subtasks || [];

      setFormData({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority || "medium",
        assignedTo: task.assignedTo?.map((user) => user._id || user) || [],
        columnId: task.columnId || columnId,
        subtasks: subtasks,
        labels: task.labels || [],
        coverImage: null, // Reset file input, but keep preview
      });

      // Set image preview if task has coverImage URL
      if (task.coverImage) {
        setCoverImagePreview(task.coverImage);
      } else {
        setCoverImagePreview("");
      }
    } else {
      setFormData({
        ...formData,
        columnId: columnId,
      });
      setCoverImagePreview("");
    }
  }, [task, columnId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDueDateChange = (date) => {
    setFormData({
      ...formData,
      dueDate: date,
    });
  };

  // Handle file selection for cover image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        coverImage: file,
      });

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
    }
  };

  // Remove cover image
  const handleRemoveCoverImage = () => {
    setFormData({
      ...formData,
      coverImage: null,
    });
    setCoverImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newItem = {
        title: newSubtaskTitle.trim(),
        isCompleted: false,
      };
      setFormData({
        ...formData,
        subtasks: [...formData.subtasks, newItem],
      });
      setNewSubtaskTitle("");
    }
  };

  const toggleSubtaskCompletion = (index) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks[index] = {
      ...updatedSubtasks[index],
      isCompleted: !updatedSubtasks[index].isCompleted,
    };

    setFormData({
      ...formData,
      subtasks: updatedSubtasks,
    });
  };

  const removeSubtask = (index) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks.splice(index, 1);

    setFormData({
      ...formData,
      subtasks: updatedSubtasks,
    });
  };

  const handleAddLabel = () => {
    if (newLabel.text.trim()) {
      const labelId = newLabel.text.toLowerCase().replace(/\s+/g, "-");
      const newLabelObj = {
        id: labelId,
        text: newLabel.text.trim(),
        color: newLabel.color,
      };

      setFormData({
        ...formData,
        labels: [...formData.labels, newLabelObj],
      });
      setNewLabel({ text: "", color: "#3b82f6" });
    }
  };

  const removeLabel = (labelId) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter((label) => label.id !== labelId),
    });
  };

  const toggleAssignUser = (userId) => {
    if (formData.assignedTo.includes(userId)) {
      setFormData({
        ...formData,
        assignedTo: formData.assignedTo.filter((id) => id !== userId),
      });
    } else {
      setFormData({
        ...formData,
        assignedTo: [...formData.assignedTo, userId],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        columnId: formData.columnId,
        boardId: boardId,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        // Only include these fields if they have values
        ...(formData.assignedTo.length > 0 && {
          assignedTo: formData.assignedTo,
        }),
        ...(formData.labels.length > 0 && { labels: formData.labels }),
        ...(formData.subtasks.length > 0 && { subtasks: formData.subtasks }),
        ...(formData.coverImage && { coverImage: formData.coverImage }),
      };

      if (task) {
        // For updates, we might want to send empty arrays to clear fields
        const updateData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          assignedTo: formData.assignedTo, // Always send for updates
          labels: formData.labels, // Always send for updates
          subtasks: formData.subtasks, // Always send for updates
          ...(formData.columnId !== task.columnId && {
            columnId: formData.columnId,
          }),
          ...(formData.coverImage && { coverImage: formData.coverImage }),
        };

        await updateTask(task._id, updateData);
        toast.success("Task updated successfully");
      } else {
        await createTask(taskData);
        toast.success("Task created successfully");
      }

      onClose();
      onTaskCreated?.();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(task ? "Failed to update task" : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {task ? "Edit Task" : "Create Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 bg-[#f5f5f5] hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Title Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Task title"
                required
              />
            </div>

            {/* Cover Image Field */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                <Image size={16} className="mr-2" />
                Cover Image
              </label>

              {coverImagePreview ? (
                <div className="relative">
                  <img
                    src={coverImagePreview}
                    alt="Cover Preview"
                    className="w-full h-40 object-cover rounded-md mb-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x150?text=Invalid+Image";
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 right-2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-100"
                  >
                    <XCircle size={20} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-32">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center py-4 px-6 text-gray-500 hover:text-gray-600"
                  >
                    <Image size={32} className="mb-2" />
                    <span>Click to upload a cover image</span>
                    <span className="text-xs text-gray-400 mt-1">
                      JPG, PNG, GIF or WEBP (Max 5MB)
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Add a more detailed description..."
                rows="3"
              />
            </div>

            {/* Due Date and Column Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.dueDate}
                    onChange={handleDueDateChange}
                    dateFormat="MMM d, yyyy"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholderText="Select a date"
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3 top-3 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Column
                </label>
                <select
                  name="columnId"
                  value={formData.columnId || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {columns &&
                  typeof columns === "object" &&
                  Object.keys(columns).length > 0
                    ? Object.values(columns).map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                      ))
                    : null}
                </select>
              </div>
            </div>

            {/* Priority Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["low", "medium", "high", "critical"].map((priority) => (
                  <label
                    key={priority}
                    className={`flex items-center justify-center p-2 border rounded cursor-pointer transition-colors ${
                      formData.priority === priority
                        ? getPriorityActiveClass(priority)
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="capitalize">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Labels Field */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                <Tag size={16} className="mr-1" />
                Labels
              </label>

              {/* Display existing labels */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: `${label.color}20`,
                      borderColor: label.color,
                      color: label.color,
                    }}
                  >
                    <span>{label.text}</span>
                    <button
                      type="button"
                      onClick={() => removeLabel(label.id)}
                      className="ml-2 text-current hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new label */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLabel.text}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, text: e.target.value })
                  }
                  placeholder="Add a label"
                  className="flex-1 p-2 border border-gray-300 rounded"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                />
                <input
                  type="color"
                  value={newLabel.color}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, color: e.target.value })
                  }
                  className="w-10 h-10 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="p-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Assigned Users Field */}
            {users.length > 0 && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Assigned To
                </label>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleAssignUser(user._id)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${
                        formData.assignedTo.includes(user._id)
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      <User size={14} className="mr-1" />
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks Field */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                <CheckSquare size={16} className="mr-1" />
                Subtasks
              </label>
              <div className="space-y-2">
                {formData.subtasks.map((subtask, index) => (
                  <div key={subtask._id || index} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={subtask.isCompleted}
                      onChange={() => toggleSubtaskCompletion(index)}
                      className="mr-2 rounded text-blue-500"
                    />
                    <span
                      className={
                        subtask.isCompleted ? "line-through text-gray-500" : ""
                      }
                    >
                      {subtask.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="ml-auto text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex mt-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask"
                    className="flex-1 p-2 border border-gray-300 rounded-l"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="bg-gray-100 border border-l-0 border-gray-300 px-3 rounded-r hover:bg-gray-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#18cb96] text-white rounded-md hover:bg-[#034e5d]"
                disabled={loading}
              >
                {loading ? "Saving..." : task ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to get priority colors
const getPriorityActiveClass = (priority) => {
  switch (priority) {
    case "low":
      return "border-green-500 bg-green-50 text-green-700";
    case "medium":
      return "border-blue-500 bg-blue-50 text-blue-700";
    case "high":
      return "border-orange-500 bg-orange-50 text-orange-700";
    case "critical":
      return "border-red-500 bg-red-50 text-red-700";
    default:
      return "border-blue-500 bg-blue-50 text-blue-700";
  }
};

export default TaskModal;

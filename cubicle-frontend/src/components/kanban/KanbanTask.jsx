import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckSquare,
  Clock,
  Edit,
  GripVertical,
  MoreHorizontal,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "../dashboard/tiptap.css";

function KanbanTask({
  task,
  columnId,
  onDelete,
  formatDueDate,
  isOverdue = () => false,
  onEdit,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task: { ...task, columnId },
    },
  });

  // Style with proper transform
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to get appropriate priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCompletedSubtasksCount = () => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    return `${task.subtasks.filter((item) => item.isCompleted).length}/${
      task.subtasks.length
    }`;
  };

  const subtasksCount = getCompletedSubtasksCount();

  // Handle opening the task modal on click
  const handleCardClick = (e) => {
    // Don't open task if clicking on menu or drag handle
    if (
      e.target.closest(".task-menu-container") ||
      e.target.closest(".drag-handle")
    ) {
      return;
    }
    onEdit(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-md shadow-sm mb-2 border border-gray-100 flex flex-col
        hover:shadow-md transition-all ${
          isDragging ? "shadow-md ring-2 ring-blue-300" : ""
        }`}
    >
      {/* Cover image if it exists */}
      {task.coverImage && (
        <div className="w-full h-24 overflow-hidden rounded-t-md">
          <img
            src={task.coverImage}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Task content with drag handle */}
      <div className="flex flex-1">
        {/* Drag handle area */}
        <div
          className="drag-handle w-8 flex items-center justify-center cursor-grab border-r border-gray-100 hover:bg-gray-50 rounded-l-md"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>

        {/* Card content - clickable to open modal */}
        <div className="p-3 flex-1 cursor-pointer" onClick={handleCardClick}>
          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    borderColor: label.color,
                  }}
                >
                  {label.text}
                </span>
              ))}
            </div>
          )}

          {/* Title and menu */}
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-800 break-all pr-6">
              {task.title}
            </h3>
            <div className="relative task-menu-container" ref={menuRef}>
              <button
                className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreHorizontal size={14} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(task);
                      }}
                    >
                      <Edit size={14} className="mr-2" />
                      Edit Task
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete();
                      }}
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description - only show if it exists */}
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Progress bar for completion */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${
                      task.completion ||
                      (task.subtasks.filter((s) => s.isCompleted).length /
                        task.subtasks.length) *
                        100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Task metadata */}
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Priority tag */}
            {task.priority && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span
                className={`text-xs px-2 py-1 rounded-full flex items-center 
                  ${
                    isOverdue(task.dueDate)
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                <Clock size={12} className="mr-1" />
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {/* Subtasks counter */}
            {subtasksCount && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center">
                <CheckSquare size={12} className="mr-1" />
                {subtasksCount}
              </span>
            )}
          </div>

          {/* Assigned Users */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="mt-3 flex -space-x-2 overflow-hidden">
              {task.assignedTo.slice(0, 3).map((user, index) => (
                <div
                  key={index}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border border-white"
                  title={user.name || "Team member"}
                >
                  <User size={12} className="text-gray-600" />
                </div>
              ))}
              {task.assignedTo.length > 3 && (
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border border-white text-xs font-medium text-gray-600">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KanbanTask;

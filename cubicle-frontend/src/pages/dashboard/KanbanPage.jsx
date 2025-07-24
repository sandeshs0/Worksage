import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Calendar, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { v4 as uuidv4 } from "uuid";
import KanbanColumn from "../../components/kanban/KanbanColumn";
import TaskModal from "../../components/kanban/TaskModal";

function KanbanPage() {
  const [columns, setColumns] = useState({
    backlog: {
      id: "backlog",
      title: "Backlog",
      tasks: [],
    },
    inProgress: {
      id: "inProgress",
      title: "In-Progress",
      tasks: [],
    },
    done: {
      id: "done",
      title: "Done",
      tasks: [],
    },
  });

  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    columnId: "backlog",
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("kanbanColumns");
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    } else {
      // Set up example task for first-time users
      setColumns({
        ...columns,
        backlog: {
          ...columns.backlog,
          tasks: [
            {
              id: uuidv4(),
              title: "Complete Backend of Nepmeds",
              description: "Write business logic for Nepmeds API",
              dueDate: "2025-06-12",
            },
          ],
        },
      });
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("kanbanColumns", JSON.stringify(columns));
  }, [columns]);

  function findContainerAndIndex(id) {
    const columnId = Object.keys(columns).find((columnId) => {
      return columns[columnId].tasks.some((task) => task.id === id);
    });

    if (!columnId) return { containerId: null, index: -1 };

    const index = columns[columnId].tasks.findIndex((task) => task.id === id);
    return { containerId: columnId, index };
  }

  function handleDragStart(event) {
    const { active } = event;
    const { containerId } = findContainerAndIndex(active.id);

    if (containerId) {
      const taskIndex = columns[containerId].tasks.findIndex(
        (task) => task.id === active.id
      );
      setActiveTask(columns[containerId].tasks[taskIndex]);
    }

    setActiveId(active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;

    // No over target (dragging outside valid drop areas)
    if (!over) return;

    // Find source and destination containers
    const { containerId: sourceContainerId } = findContainerAndIndex(active.id);

    // Check if over a column rather than a task
    const isOverContainer = over.id in columns;
    const targetContainerId = isOverContainer
      ? over.id
      : Object.keys(columns).find((columnId) => {
          return columns[columnId].tasks.some((task) => task.id === over.id);
        });

    // No change needed
    if (sourceContainerId === targetContainerId) return;

    // Move task between containers
    if (sourceContainerId && targetContainerId) {
      setColumns((prev) => {
        const sourceTaskIndex = prev[sourceContainerId].tasks.findIndex(
          (task) => task.id === active.id
        );
        const sourceTask = prev[sourceContainerId].tasks[sourceTaskIndex];

        return {
          ...prev,
          [sourceContainerId]: {
            ...prev[sourceContainerId],
            tasks: prev[sourceContainerId].tasks.filter(
              (task) => task.id !== active.id
            ),
          },
          [targetContainerId]: {
            ...prev[targetContainerId],
            tasks: [...prev[targetContainerId].tasks, sourceTask],
          },
        };
      });
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    const { containerId: sourceContainerId, index: sourceIndex } =
      findContainerAndIndex(active.id);

    // If over a column directly
    if (over.id in columns) {
      const targetContainerId = over.id;

      if (sourceContainerId !== targetContainerId) {
        setColumns((prev) => {
          const sourceTask = prev[sourceContainerId].tasks[sourceIndex];
          return {
            ...prev,
            [sourceContainerId]: {
              ...prev[sourceContainerId],
              tasks: prev[sourceContainerId].tasks.filter(
                (task) => task.id !== active.id
              ),
            },
            [targetContainerId]: {
              ...prev[targetContainerId],
              tasks: [...prev[targetContainerId].tasks, sourceTask],
            },
          };
        });

        toast.success(`Task moved to ${columns[targetContainerId].title}`);
      }
    }
    // If over another task
    else {
      const { containerId: targetContainerId, index: targetIndex } =
        findContainerAndIndex(over.id);

      if (
        sourceContainerId === targetContainerId &&
        sourceIndex !== targetIndex
      ) {
        // Reorder within same container
        setColumns((prev) => {
          const updatedTasks = [...prev[sourceContainerId].tasks];
          const [removed] = updatedTasks.splice(sourceIndex, 1);
          updatedTasks.splice(targetIndex, 0, removed);

          return {
            ...prev,
            [sourceContainerId]: {
              ...prev[sourceContainerId],
              tasks: updatedTasks,
            },
          };
        });
      } else if (sourceContainerId !== targetContainerId) {
        // Move between containers
        setColumns((prev) => {
          const sourceTask = prev[sourceContainerId].tasks[sourceIndex];
          return {
            ...prev,
            [sourceContainerId]: {
              ...prev[sourceContainerId],
              tasks: prev[sourceContainerId].tasks.filter(
                (task) => task.id !== active.id
              ),
            },
            [targetContainerId]: {
              ...prev[targetContainerId],
              tasks: [
                ...prev[targetContainerId].tasks.slice(0, targetIndex),
                sourceTask,
                ...prev[targetContainerId].tasks.slice(targetIndex),
              ],
            },
          };
        });

        toast.success(`Task moved to ${columns[targetContainerId].title}`);
      }
    }

    setActiveId(null);
    setActiveTask(null);
  }

  // Add a new task
  const handleAddTask = () => {
    setSelectedTask(null); // Ensure we're creating a new task
    setShowTaskModal(true);
  };

  // Edit an existing task
  const handleEditTask = (task) => {
    // Add columnId to the task for the edit modal
    const columnId = Object.keys(columns).find((colId) =>
      columns[colId].tasks.some((t) => t.id === task.id)
    );
    setSelectedTask({ ...task, columnId });
    setShowTaskModal(true);
  };

  // Save task (add or update)
  const handleSaveTask = (taskData) => {
    // If task has an id, it's an existing task being edited
    if (taskData.id) {
      // Get the original column the task was in
      const originalColumnId = Object.keys(columns).find((colId) =>
        columns[colId].tasks.some((t) => t.id === taskData.id)
      );

      const targetColumnId = taskData.columnId;

      // If column changed, move the task between columns
      if (originalColumnId !== targetColumnId) {
        setColumns((prev) => {
          // Remove from original column
          const updatedOriginalTasks = prev[originalColumnId].tasks.filter(
            (t) => t.id !== taskData.id
          );

          // Add to new column with updated data
          const updatedTargetTasks = [
            ...prev[targetColumnId].tasks,
            {
              ...taskData,
              // Remove columnId as it's just used for the form
              columnId: undefined,
            },
          ];

          return {
            ...prev,
            [originalColumnId]: {
              ...prev[originalColumnId],
              tasks: updatedOriginalTasks,
            },
            [targetColumnId]: {
              ...prev[targetColumnId],
              tasks: updatedTargetTasks,
            },
          };
        });
      } else {
        // Update task in the same column
        setColumns((prev) => {
          const updatedTasks = prev[targetColumnId].tasks.map((task) =>
            task.id === taskData.id
              ? {
                  ...taskData,
                  // Remove columnId as it's just used for the form
                  columnId: undefined,
                }
              : task
          );

          return {
            ...prev,
            [targetColumnId]: {
              ...prev[targetColumnId],
              tasks: updatedTasks,
            },
          };
        });
      }

      toast.success("Task updated successfully");
    } else {
      // It's a new task
      const task = {
        id: uuidv4(),
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        checklist: taskData.checklist,
        image: taskData.image,
      };

      const columnId = taskData.columnId || "backlog";
      const column = columns[columnId];
      const updatedTasks = [...column.tasks, task];

      setColumns({
        ...columns,
        [columnId]: {
          ...column,
          tasks: updatedTasks,
        },
      });

      toast.success("New task added", {
        description: task.title,
      });
    }

    // Reset form and close modal
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  // Delete a task
  const deleteTask = (columnId, taskId) => {
    const column = columns[columnId];
    const updatedTasks = column.tasks.filter((task) => task.id !== taskId);

    setColumns({
      ...columns,
      [columnId]: {
        ...column,
        tasks: updatedTasks,
      },
    });

    toast.success("Task deleted");
  };

  // Format due date for display
  const formatDueDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `Due ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  // Determine if a task is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset hours to compare dates only
    return dueDate < today;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[80vh]">
      <div className="flex items-center text-lg text-gray-500 mb-4">
        <Link to="/dashboard/boards" className="hover:text-[#007991]">
          Kanban Boards
        </Link>
        <ChevronRight size={20} className="mx-2" />
        <span className="text-gray-700 font-medium"></span>
      </div>

      <h2 className="text-xl font-medium mb-2">Kanban Board</h2>
      <p className="text-gray-500 mb-6">
        Manage your tasks. Improve your productivity.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
          {Object.values(columns).map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              deleteTask={deleteTask}
              formatDueDate={formatDueDate}
              isOverdue={isOverdue}
              showAddTaskButton={column.id === "backlog"}
              onAddTaskClick={handleAddTask}
              onEditTask={handleEditTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && activeTask ? (
            <div className="bg-white rounded-md p-4 shadow-lg border border-gray-200 w-64">
              <h4 className="font-medium mb-1">{activeTask.title}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {activeTask.description}
              </p>
              {activeTask.dueDate && (
                <div
                  className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                    isOverdue(activeTask.dueDate)
                      ? "bg-red-100 text-red-800"
                      : "bg-pink-100 text-pink-800"
                  }`}
                >
                  <Calendar size={12} className="mr-1" />
                  {formatDueDate(activeTask.dueDate)}
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Replace the old form modal with the new TaskModal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        task={selectedTask}
        columns={columns}
      />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default KanbanPage;

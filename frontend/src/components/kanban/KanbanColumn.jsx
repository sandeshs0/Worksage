import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import ColumnHeader from "./ColumnHeader";
import KanbanTask from "./KanbanTask";

function KanbanColumn({
  column,
  deleteTask,
  formatDueDate,
  isOverdue,
  onAddTaskClick,
  onEditTask,
  onEditColumn,
  onDeleteColumn,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`column-drop-target bg-[#18cb96]/20 border-2 border-[#18cb96]/20 rounded-lg p-3 flex-shrink-0 min-w-[280px] max-w-[280px] transition-colors
        ${isOver ? "is-over ring-1 ring-blue-300" : ""}`}
    >
      <ColumnHeader
        title={column.title}
        onAddClick={onAddTaskClick}
        onEdit={(title) => onEditColumn(title)}
        onDelete={onDeleteColumn}
      />
      <hr className="my-2 border-gray-400" />
      <div className="mt-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
              columnId={column.id}
              onDelete={() => deleteTask(column.id, task.id)}
              formatDueDate={formatDueDate}
              isOverdue={isOverdue}
              onEdit={() => onEditTask(task)}
            />
          ))}
        </SortableContext>

        <button
          onClick={onAddTaskClick}
          className="w-full mt-2 p-2 bg-white border border-dashed border-gray-300 rounded-md text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Add Task
        </button>
      </div>
    </div>
  );
}

export default KanbanColumn;

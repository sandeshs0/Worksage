import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

const SortableLineItem = ({ item, onChange, onRemove, canRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (amount) => {
    return (
      "Rs. " +
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(amount)
    );
  };

  const calculateTotal = () => {
    return item.quantity * item.unitPrice;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50"
    >
      {/* Drag Handle */}
      <div className="col-span-1 flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {/* Description */}
      <div className="col-span-5">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onChange(item.id, "description", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Item description..."
          required
        />
      </div>

      {/* Quantity */}
      <div className="col-span-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.quantity}
          onChange={(e) =>
            onChange(item.id, "quantity", parseFloat(e.target.value) || 0)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Qty"
          required
        />
      </div>

      {/* Unit Price */}
      <div className="col-span-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice}
          onChange={(e) =>
            onChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Price"
          required
        />
      </div>

      {/* Total */}
      <div className="col-span-1 text-right">
        <span className="font-medium text-gray-900">
          {formatCurrency(calculateTotal())}
        </span>
      </div>

      {/* Remove Button */}
      <div className="col-span-1 flex justify-end">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SortableLineItem;

import { Check, Edit2, MoreHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ColumnHeader = ({ title, onAddClick, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setNewTitle(title);
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = () => {
    if (newTitle.trim() !== "") {
      onEdit(newTitle.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setNewTitle(title);
    }
  };

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    onDelete();
  };

  return (
    <div className="flex justify-between items-center mb-2 group">
      {isEditing ? (
        <div className="flex items-center w-full">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            className="ml-1 p-1 text-green-500 hover:text-green-600"
            onClick={handleSaveEdit}
          >
            <Check size={16} />
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-600"
            onClick={() => {
              setIsEditing(false);
              setNewTitle(title);
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className="relative" ref={menuRef}>
            <button
              className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Column menu"
            >
              <MoreHorizontal size={16} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleEditClick}
                  >
                    <Edit2 size={14} className="mr-2" />
                    Edit Column
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ColumnHeader;

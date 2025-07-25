import {
  AlertCircle,
  Edit,
  Grid,
  Loader,
  PlusCircle,
  Trash2,
  Calendar,
  Users,
  MoreVertical,
  Star,
  Archive
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createBoard,
  deleteBoard,
  getUserBoards,
} from "../services/boardService";

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [newBoard, setNewBoard] = useState({
    title: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await getUserBoards();
      setBoards(data);
      setError(null);
    } catch (err) {
      setError("Failed to load boards. Please try again.");
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoard.title) {
      toast.error("Board title is required");
      return;
    }

    try {
      setIsCreating(true);
      const createdBoard = await createBoard(newBoard);
      setBoards([createdBoard, ...boards]);
      setShowCreateModal(false);
      setNewBoard({ title: "", description: "" });
      toast.success("Board created successfully");
    } catch (err) {
      toast.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        await deleteBoard(id);
        setBoards(boards.filter((board) => board._id !== id));
        toast.success("Board deleted successfully");
      } catch (err) {
        toast.error("Failed to delete board");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const BoardCard = ({ board }) => (
    <div className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:border-[#18cb96]/30 transition-all duration-300 transform hover:-translate-y-1">
      {/* Card Header with Gradient */}
      <div className="h-20 bg-gradient-to-br from-[#18cb96] to-[#14a085] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-3 right-3">
          <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100">
            <MoreVertical size={16} className="text-white" />
          </button>
        </div>
        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute -top-2 -left-2 w-12 h-12 bg-white/5 rounded-full"></div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#18cb96] transition-colors line-clamp-1">
            {board.title}
          </h3>
          <Star size={16} className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {board.description || "No description provided"}
        </p>

        {/* Board Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{board.members?.length || 1} member{board.members?.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Created {formatDate(board.createdAt)}</span>
          </div>
        </div>

        {/* Created By */}
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded-full bg-[#18cb96] flex items-center justify-center text-xs text-white font-medium">
            {board.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            Created by <span className="font-medium text-gray-800">{board.createdBy?.name || "Unknown"}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/dashboard/boards/${board._id}`)}
            className="flex-1 bg-[#18cb96] hover:bg-[#14a085] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 mr-2"
          >
            Open Board
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setNewBoard({
                  title: board.title,
                  description: board.description || "",
                });
                // Implement edit functionality
              }}
              className="p-2.5 text-gray-400 hover:text-[#18cb96] hover:bg-[#18cb96]/5 rounded-lg transition-colors"
              title="Edit board"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleDeleteBoard(board._id)}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete board"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="bg-gradient-to-br from-[#18cb96]/10 to-[#14a085]/5 rounded-full p-8 mb-6">
        <Grid className="text-[#18cb96]" size={48} />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        No boards yet
      </h3>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Get started by creating your first board. Organize your projects and collaborate with your team.
      </p>
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-[#18cb96] hover:bg-[#14a085] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
      >
        <PlusCircle size={20} />
        Create Your First Board
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Boards</h1>
              <p className="text-gray-600">Manage and organize your project boards</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-[#18cb96] shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-[#18cb96] shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Archive size={18} />
                </button>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#18cb96] hover:bg-[#14a085] text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusCircle size={20} />
                Create Board
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#18cb96]/20 border-t-[#18cb96] rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading your boards...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <div>
              <h3 className="font-medium">Error loading boards</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            {boards.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#18cb96]">{boards.length}</div>
                    <div className="text-sm text-gray-600">Total Boards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#18cb96]">
                      {boards.filter(board => board.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                    </div>
                    <div className="text-sm text-gray-600">Created This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#18cb96]">
                      {boards.reduce((acc, board) => acc + (board.members?.length || 1), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Members</div>
                  </div>
                </div>
              </div>
            )}

            {/* Boards Grid */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {boards.length === 0 ? (
                <EmptyState />
              ) : (
                boards.map((board) => <BoardCard key={board._id} board={board} />)
              )}
            </div>
          </>
        )}
      </div>

      {/* Enhanced Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#18cb96] to-[#14a085] px-6 py-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Board</h2>
                  <p className="text-[#18cb96]/80 text-sm mt-1">Start organizing your project</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/80 hover:text-white text-2xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateBoard} className="p-6">
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Board Title
                </label>
                <input
                  type="text"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#18cb96] focus:border-transparent transition-all"
                  placeholder="Enter a descriptive board title"
                  value={newBoard.title}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, title: e.target.value })
                  }
                  required
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#18cb96] focus:border-transparent transition-all resize-none"
                  placeholder="What's this board about?"
                  value={newBoard.description}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, description: e.target.value })
                  }
                  rows="4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#18cb96] text-white rounded-xl hover:bg-[#14a085] font-medium flex items-center justify-center gap-2 transition-colors shadow-lg"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      Create Board
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardsPage;

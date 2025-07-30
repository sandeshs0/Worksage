import { ClipboardList, Clock, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProjectFilter from "../../components/ProjectFilter";
import ProjectForm from "../../components/ProjectForm";
import ProjectList from "../../components/ProjectList";
import projectService from "../../services/projectService";

function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    pendingAmount: 0,
  });

  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    clientId: "",
  });

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all projects
  useEffect(() => {
    async function fetchProjects() {
      //console.log("Starting to fetch projects...");
      try {
        setIsLoading(true);
        //console.log("Calling projectService.getAllProjects()");
        const data = await projectService.getAllProjects();
        //console.log("API response received:", data);

        // Store projects and set filtered projects initially to all projects
        setProjects(data);
        setFilteredProjects(data);

        // Calculate stats
        calculateStats(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Apply filters when filters change or projects change
  useEffect(() => {
    if (!projects.length) return;

    let result = [...projects];

    // Apply search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(term) ||
          project.description?.toLowerCase().includes(term) ||
          project.client?.name?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((project) => project.status === filters.status);
    }

    // Apply client filter
    if (filters.clientId) {
      result = result.filter(
        (project) => project.client?._id === filters.clientId
      );
    }

    setFilteredProjects(result);
  }, [filters, projects]);

  // Calculate stats from projects data
  const calculateStats = (projectsData) => {
    const total = projectsData.length;
    const ongoing = projectsData.filter(
      (p) => p.status === "in progress"
    ).length;
    const completed = projectsData.filter(
      (p) => p.status === "completed"
    ).length;

    // Calculate total expected revenue from incomplete projects
    const pendingAmount = projectsData
      .filter((p) => p.status !== "completed")
      .reduce((sum, p) => sum + (p.expectedRevenue || 0), 0);

    setStats({
      total,
      ongoing,
      completed,
      pendingAmount,
    });
  };

  // Handle filter changes from FilterComponent
  const handleFilterChange = (newFilters) => {
    // Prevent unnecessary state updates by comparing values
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters);
    }
  };

  // Handle creating a new project
  const handleCreateProject = async (projectData) => {
    try {
      setIsSubmitting(true);
      const newProject = await projectService.createProject(projectData);

      // Update projects list
      setProjects((prevProjects) => [...prevProjects, newProject]);

      // Close modal and show success message
      setShowNewProjectModal(false);
      toast.success("Project created successfully");

      // Navigate to the new project
      navigate(`/dashboard/projects/${newProject._id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Projects</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Projects */}
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <ClipboardList className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {stats.total || 0}
            </h2>
            <p className="text-gray-500 text-sm">Total Projects</p>
          </div>
        </div>

        {/* Ongoing Projects */}
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-orange-100 p-3 rounded-lg mr-4">
            <Clock className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {stats.ongoing || 0}
            </h2>
            <p className="text-gray-500 text-sm">Ongoing</p>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <div className="rounded-full h-6 w-6 bg-green-500 flex justify-center items-center text-white">
              ✓
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {stats.completed || 0}
            </h2>
            <p className="text-gray-500 text-sm">Completed</p>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-red-100 p-3 rounded-lg mr-4">
            <div className="rounded-full h-6 w-6 bg-red-500 flex justify-center items-center text-white">
              ×
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {formatCurrency(stats.pendingAmount || 0)}
            </h2>
            <p className="text-gray-500 text-sm">Pending Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ProjectFilter onFilterChange={handleFilterChange} />

      {/* Projects List */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Projects</h2>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-[#18cb96] hover:bg-opacity-90 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" /> Add New
          </button>
        </div>

        <ProjectList projects={filteredProjects} isLoading={isLoading} />
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-medium text-center w-full">
                Create New Project
              </h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-gray-500 hover:text-gray-700 absolute right-4"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <ProjectForm
                onSubmit={handleCreateProject}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;

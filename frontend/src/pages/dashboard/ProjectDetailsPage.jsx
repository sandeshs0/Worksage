import {
  Camera,
  ChevronRight,
  Edit,
  Loader,
  Mail,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import projectService from "../../services/projectService";

// Import tab components
import ActivityTab from "../../components/dashboard/ActivityTab";
import FilesTab from "../../components/dashboard/FilesTab";
import InvoiceTab from "../../components/dashboard/InvoiceTab";

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [coverImageModalOpen, setCoverImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("Activity");

  // Move these useState hooks UP here, before any conditional logic or effects
  const [activities] = useState([]);
  const [files] = useState([]);
  const [invoices] = useState([]);

  // Form state for editing
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    description: "",
    category: "",
    client: "",
    startDate: "",
    endDate: "",
    status: "ongoing",
  });

  useEffect(() => {
    async function fetchProjectData() {
      try {
        setIsLoading(true);

        // If we're not on the "new" route, fetch project data
        if (projectId !== "new") {
          const projectData = await projectService.getProjectById(projectId);
          setProject(projectData);

          // Set form data for editing
          setProjectFormData({
            name: projectData.name,
            description: projectData.description || "",
            category: projectData.category || "",
            client: projectData.client || "",
            startDate: projectData.startDate
              ? new Date(projectData.startDate).toISOString().split("T")[0]
              : "",
            endDate: projectData.endDate
              ? new Date(projectData.endDate).toISOString().split("T")[0]
              : "",
            status: projectData.status || "ongoing",
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectData();
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectFormData({
      ...projectFormData,
      [name]: value,
    });
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!projectFormData.name) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (projectId === "new") {
        // Create new project
        const newProject = await projectService.createProject(projectFormData);
        toast.success("Project created successfully");
        navigate(`/dashboard/projects/${newProject._id}`);
      } else {
        // Update existing project
        const updatedProject = await projectService.updateProject(
          projectId,
          projectFormData
        );
        setProject(updatedProject);
        toast.success("Project updated successfully");
        setEditModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving project:", err);
      toast.error(
        projectId === "new"
          ? "Failed to create project"
          : "Failed to update project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectService.deleteProject(projectId);
      toast.success("Project deleted successfully");
      navigate("/dashboard/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  // Add this function to handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add this function to handle image upload
  const handleCoverImageUpload = async () => {
    if (!selectedImage) return;

    setIsImageUploading(true);

    try {
      const result = await projectService.updateProjectCover(
        projectId,
        selectedImage
      );

      // Update the project state with new cover image
      setProject({
        ...project,
        coverImage: result.coverImage,
      });

      toast.success("Cover image updated successfully");
      setCoverImageModalOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast.error("Failed to update cover image");
    } finally {
      setIsImageUploading(false);
    }
  };

  // Create dummy project data to match the screenshot
  const dummyProject = {
    name: "NepMeds: E-Commerce Site for Medical Goods",
    description: "An e-commerce platform for medical products and supplies.",
    category: "Web Development",
    startDate: "2023-06-21T00:00:00.000Z",
    endDate: "2025-06-21T00:00:00.000Z",
    client: {
      name: "Nirmal Karki",
      location: "Sanepa Heights, Lalitpur",
      phone: "+977 9812345678",
      email: "nirmalkarki@gmail.com",
    },
    payment: {
      totalContract: 140000,
      receivedAmount: 60000,
      remainingAmount: 80000,
      receivedPercentage: 60,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: "#18cb96" }}
        ></div>
      </div>
    );
  }

  // For demo/display, use the dummy data or actual project data
  const displayProject = project || dummyProject;

  // Render tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Activity":
        return (
          <ActivityTab
            activities={activities}
            client={displayProject.client} // Make sure this is being passed correctly
            project={displayProject}
          />
        );
      case "Files":
        return <FilesTab files={files} />;
      case "Invoices":
        // return <InvoicesTab invoices={invoices} />;
        return (
          <InvoiceTab project={displayProject} client={displayProject.client} />
        );
      default:
        return (
          <ActivityTab
            activities={activities}
            client={displayProject.client} // Make sure this is being passed correctly
            project={displayProject}
          />
        );
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="flex items-center text-lg text-gray-500 mb-4">
        <Link to="/dashboard/projects" className="hover:text-[#18cb96]">
          Projects
        </Link>
        <ChevronRight size={20} className="mx-2" />
        <span className="text-gray-700 font-medium">{displayProject.name}</span>
      </div>

      {/* Hero banner with project title */}
      <div
        className="bg-gray-900 text-white bg-opacity-90 relative"
        style={{
          backgroundImage: displayProject.coverImage
            ? `url(${displayProject.coverImage})`
            : "url('/src/assets/hero.png')",
          backgroundSize: "cover",
          height: "270px",

          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        {/* Title container positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-black/70 to-transparent">
          <h1 className="text-2xl md:text-3xl font-bold">
            {displayProject.name}
          </h1>
          <p className="mt-1 text-gray-300">{displayProject.category}</p>
        </div>

        {/* Edit button for image - Updated to open the modal */}
        <button
          onClick={() => setCoverImageModalOpen(true)}
          className="absolute bottom-3 z-10 right-3 bg-black bg-opacity-50 p-2 rounded-md hover:bg-opacity-70 transition-all"
        >
          <Edit size={18} className="text-white" />
        </button>
      </div>

      {/* Three-column information cards */}
      <div className="px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Client Information Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-medium text-gray-700 mb-4 text-lg">
            Client Information
          </h3>

          <div className="flex items-start">
            <div className="mr-3 mt-1">
              {displayProject.client?.profileImage ? (
                <img
                  src={displayProject.client.profileImage}
                  alt={displayProject.client?.name || "Client"}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.outerHTML = `<div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      ${displayProject.client?.name?.charAt(0) || "?"}
                    </div>`;
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {displayProject.client?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>

            <div>
              <p className="font-medium">
                {displayProject.client?.name || "No Client Name"}
              </p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                {displayProject.client?.location || "No Location"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {displayProject.client?.phone || "No Phone"}
              </p>
              <p className="text-sm text-gray-500">
                {displayProject.client?.email || "No Email"}
              </p>
            </div>
          </div>
        </div>

        {/* Project Timeline Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-medium text-gray-700 mb-8 text-lg">
            Project Timeline
          </h3>

          <div className="flex flex-col h-[140px] justify-between">
            {/* Timeline visual with dots and line */}
            <div className="relative flex items-center justify-between px-4">
              {/* Start dot */}
              <div className="w-5 h-5 bg-[#21295c] rounded-full z-10"></div>

              {/* Simple wavy line that matches the image */}
              <svg
                className="absolute top-1/2 left-8 right-8 w-[calc(100%-64px)] h-4 -translate-y-1/2"
                viewBox="0 0 200 10"
              >
                <path
                  d="M0,5 C40,2 80,8 120,5 C160,2 180,8 200,5"
                  fill="none"
                  stroke="#21295c"
                  strokeWidth="2"
                />
              </svg>

              {/* End dot */}
              <div className="w-5 h-5 bg-[#21295c] rounded-full z-10"></div>
            </div>

            {/* Date labels - updated to match the format in the image */}
            <div className="flex justify-between mt-12 text-md font-medium text-gray-700 px-1">
              <div>
                {/* Format: Month Day, Year */}
                {new Date(displayProject.startDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </div>

              <div>
                {new Date(displayProject.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Payments Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-medium text-gray-700 mb-4  text-lg">Payments</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Contract:</span>
              <span className="font-medium">
                Rs. {displayProject?.payment?.totalContract.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Received Amount:</span>
              <span className="font-medium text-green-600">
                Rs. {displayProject?.payment?.receivedAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Remaining Amount:</span>
              <span className="font-medium text-red-600">
                Rs. {displayProject?.payment?.remainingAmount.toLocaleString()}
              </span>
            </div>

            <div className="pt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{
                    width: `${displayProject?.payment?.receivedPercentage}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-right mt-1">
                {displayProject?.payment?.receivedPercentage}% Received
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="px-4 mb-16">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              {["Activity", "Files", "Invoices"].map((tab) => (
                <button
                  key={tab}
                  className={`py-3 px-8 font-medium text-lg border-b-2 ${
                    activeTab === tab
                      ? "border-[#21295c] text-[#21295c]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content area - render the appropriate component */}
          {renderTabContent()}
        </div>
      </div>

      {/* Only show the fixed Send Email button on mobile and when not on the Activity tab */}
      {activeTab !== "Activity" && (
        <div className="fixed bottom-8 right-8 md:hidden">
          <button className="bg-[#18cb96] text-white px-4 py-3 rounded-md shadow-lg flex items-center">
            <Mail size={16} className="mr-2" />
            Send Email
          </button>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-medium text-center w-full">
                Edit Project
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 absolute right-4"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter Project Name"
                    value={projectFormData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Project description"
                    value={projectFormData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      placeholder="e.g. Web Development"
                      value={projectFormData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      name="client"
                      placeholder="Client name"
                      value={projectFormData.client}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={projectFormData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={projectFormData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={projectFormData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center"
                  style={{ backgroundColor: "#18cb96" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Confirm Delete
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <strong>{displayProject.name}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the Cover Image Upload Modal */}
      {coverImageModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-medium">Update Cover Image</h3>
              <button
                onClick={() => {
                  setCoverImageModalOpen(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Image preview */}
              {imagePreview ? (
                <div className="relative mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 p-1 rounded-full text-white hover:bg-opacity-80"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg mb-4 flex flex-col items-center justify-center h-48 bg-gray-50">
                  <Camera size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 text-center">
                    Select an image to upload
                  </p>
                </div>
              )}

              {/* File input */}
              <div className="flex items-center justify-center mb-6">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center">
                  <Upload size={16} className="mr-2" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageModalOpen(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCoverImageUpload}
                  disabled={!selectedImage || isImageUploading}
                  className={`px-4 py-2 rounded-md text-white flex items-center ${
                    !selectedImage
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#18cb96] hover:bg-[#006680]"
                  }`}
                >
                  {isImageUploading ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailsPage;

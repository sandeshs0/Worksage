import {
  Briefcase,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  Loader,
  Mail,
  Pencil,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import clientService from "../../services/clientService";

function ClientDetailsPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [clientData, setClientData] = useState(null);
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Add states for editing
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    organisation: "",
    profileImage: null,
    remarks: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchClientData() {
      try {
        setIsLoading(true);

        // Fetch client details
        const data = await clientService.getClientById(clientId);
        setClientData(data);
        setClient(data.client);
        setProjects(data.projects || []);
        setInvoices(data.invoices || []);

        // Setup form data for potential editing
        if (data.client) {
          setClientFormData({
            name: data.client.name,
            email: data.client.email,
            contactNumber: data.client.contactNumber,
            address: data.client.address || "",
            organisation: data.client.organisation || "",
            profileImage: null,
            remarks: data.client.remarks || "",
          });

          setImagePreview(data.client.profileImage);
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast.error("Failed to load client information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchClientData();
  }, [clientId]);

  // Handle edit modal functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientFormData({
      ...clientFormData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError("Please select a valid image file (JPG, JPEG, PNG, WEBP)");
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size must be less than 5MB");
      return;
    }

    // Set the file in form data
    setClientFormData({
      ...clientFormData,
      profileImage: file,
    });

    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmitClient = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !clientFormData.name ||
      !clientFormData.email ||
      !clientFormData.contactNumber
    ) {
      toast.error("Name, email and contact number are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const formData = new FormData();

      // Add text fields
      formData.append("name", clientFormData.name);
      formData.append("email", clientFormData.email);
      formData.append("contactNumber", clientFormData.contactNumber);

      if (clientFormData.address)
        formData.append("address", clientFormData.address);
      if (clientFormData.organisation)
        formData.append("organisation", clientFormData.organisation);
      if (clientFormData.remarks)
        formData.append("remarks", clientFormData.remarks);

      // Add file if selected
      if (clientFormData.profileImage) {
        formData.append("profileImage", clientFormData.profileImage);
      }

      // Update client
      const response = await clientService.updateClient(clientId, formData);

      // Update the client state
      if (response && response.client) {
        setClient(response.client);
        setClientData(response);
        setProjects(response.projects || []);
        setInvoices(response.invoices || []);
      } else {
        setClient(response);
      }

      toast.success("Client updated successfully");
      setEditModalOpen(false);
    } catch (err) {
      console.error("Error updating client:", err);
      toast.error("Failed to update client");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "Rs. ");
  };

  // Delete function
  const handleDeleteClient = async () => {
    try {
      await clientService.deleteClient(clientId);
      toast.success("Client deleted successfully");
      navigate("/dashboard/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007991]"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-700 mb-2">
          Client Not Found
        </h2>
        <p className="text-lg text-gray-500 mb-6">
          The client you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/dashboard/clients"
          className="inline-flex items-center px-4 py-2 bg-[#007991] text-white rounded-md hover:bg-[#005f73] text-lg"
        >
          Return to Clients
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-lg text-gray-500 mb-4">
        <Link to="/dashboard/clients" className="hover:text-[#007991]">
          Clients
        </Link>
        <ChevronRight size={20} className="mx-2" />
        <span className="text-gray-700 font-medium">{client.name}</span>
      </div>

      {/* Client Header Section */}
      <div className="rounded-lg overflow-hidden mb-8">
        {/* Teal header background */}
        <div className="bg-[#007991] h-40"></div>

        {/* Client info card */}
        <div className="bg-white rounded-b-lg shadow-sm px-8 pt-0 pb-8 relative">
          {/* Profile image - LARGER */}
          <div className="absolute -top-20 left-10">
            <div className="w-40 h-40 rounded-full border-4 border-[#007991] overflow-hidden shadow-lg">
              {client.profileImage ? (
                <img
                  src={client.profileImage}
                  alt={client.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#f0f9ff] flex items-center justify-center text-[#007991] text-5xl font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 pt-24 items-start">
            {/* Left: Name and address - LARGER TEXT */}
            <div className="pl-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {client.name}
              </h1>
              <p className="text-lg text-gray-500 mt-2">
                {client.address || "No address provided"}
              </p>
            </div>

            {/* Right: Contact details - ALIGNED RIGHT */}
            <div className="mt-4 md:mt-0 space-y-3 md:text-right">
              {client.organisation && (
                <div className="flex items-center md:justify-end text-lg">
                  <Briefcase size={20} className="text-gray-500 mr-2" />
                  <span className="text-gray-700">{client.organisation}</span>
                </div>
              )}

              <div className="flex items-center md:justify-end text-lg">
                <Mail size={20} className="text-gray-500 mr-2" />
                <span className="text-gray-700">{client.email}</span>
              </div>

              <div className="flex items-center md:justify-end text-lg">
                <Phone size={20} className="text-gray-500 mr-2" />
                <span className="text-gray-700">{client.contactNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-lg text-gray-500">
              No projects found for this client.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link
                to={`/dashboard/projects/${project._id}`}
                key={project._id}
                className="block"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap justify-between">
                    <div className="w-full md:w-3/4">
                      <h3 className="font-medium text-xl text-gray-900">
                        {project.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center text-base text-gray-500">
                        <span className="bg-gray-100 rounded px-3 py-1 mr-4 mb-2 font-medium">
                          {project.category}
                        </span>

                        <div className="flex items-center mb-2">
                          <Clock size={18} className="mr-1" />
                          <span>
                            {project.endDate
                              ? `Due: ${new Date(
                                  project.endDate
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}`
                              : `Started: ${new Date(
                                  project.startDate
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-1/4 flex justify-end items-center mt-4 md:mt-0">
                      <div className="relative h-20 w-20">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#e6e6e6"
                            strokeWidth="2"
                          ></circle>
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#009688"
                            strokeWidth="2"
                            strokeDasharray={`${
                              (project.completionRate * 3.14 * 16) / 100
                            } 100`}
                            strokeDashoffset="0"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <text
                            x="50%"
                            y="50%"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill="#009688"
                          >
                            {`${project.completionRate}%`}
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <div className="mt-3 text-gray-600">
                      <p className="line-clamp-2">{project.description}</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "in progress"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "on hold"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Invoices Sent</h2>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-lg text-gray-500">
              No invoices found for this client.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              // Calculate payments total
              const totalPayments =
                invoice.payments?.reduce(
                  (sum, payment) => sum + payment.amount + (payment.tip || 0),
                  0
                ) || 0;
              const projectName =
                projects.find((p) => p._id === invoice.project)?.name || "N/A";

              return (
                <div
                  key={invoice._id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="w-full sm:w-auto mb-3 sm:mb-0">
                      <h3 className="font-medium text-lg text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <div className="text-base text-gray-500 mt-1">
                        <span>
                          {formatTimeAgo(new Date(invoice.createdAt))}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>Project: {projectName}</span>
                      </div>
                    </div>

                    <div className="flex items-center mt-2 sm:mt-0">
                      <span
                        className={`px-4 py-1 rounded-full text-sm ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "paid-partially"
                            ? "bg-blue-100 text-blue-800"
                            : invoice.status === "sent"
                            ? "bg-yellow-100 text-yellow-800"
                            : invoice.status === "viewed"
                            ? "bg-purple-100 text-purple-800"
                            : invoice.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getPaymentStatus(invoice)}
                      </span>
                    </div>

                    <div className="mt-3 sm:mt-0 text-right">
                      <div>
                        <span className="text-base text-gray-500">Total:</span>
                        <span className="ml-1 font-semibold text-lg text-gray-900">
                          Rs. {invoice.total.toLocaleString()}
                        </span>
                      </div>
                      {invoice.payments && invoice.payments.length > 0 && (
                        <div>
                          <span className="text-base text-gray-500">
                            Received:
                          </span>
                          <span className="ml-1 font-semibold text-lg text-green-600">
                            Rs. {totalPayments.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-full sm:w-auto mt-3 sm:mt-0 flex space-x-2">
                      <Link
                        to={`/dashboard/invoices/${invoice._id}`}
                        className="p-2 text-gray-600 hover:text-[#007991] hover:bg-gray-100 rounded-md"
                        title="View Invoice"
                      >
                        <Eye size={20} />
                      </Link>

                      {invoice.status !== "paid" && (
                        <>
                          <button
                            className="p-2 text-gray-600 hover:text-[#007991] hover:bg-gray-100 rounded-md"
                            title="Send Invoice"
                          >
                            <Send size={20} />
                          </button>

                          <button
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md"
                            title="Record Payment"
                          >
                            <CreditCard size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions Section - Title left, buttons right */}
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Actions</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-5 py-2 bg-[#007991] text-white text-base rounded-md hover:bg-[#005f73] focus:outline-none focus:ring-2 focus:ring-[#007991] focus:ring-offset-2"
          >
            Edit Client
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-5 py-2 bg-red-600 text-white text-base rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete this Client
          </button>
        </div>
      </div>

      {/* Edit Client Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-medium text-center w-full">
                Edit Client
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 absolute right-4"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitClient} className="p-6">
              {/* Profile Image Upload - Circular with edit icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Profile image */}
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-300 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-3xl">
                        {clientFormData.name
                          ? clientFormData.name.charAt(0).toUpperCase()
                          : "C"}
                      </div>
                    )}
                  </div>

                  {/* Edit icon overlay */}
                  <div
                    className="absolute bottom-0 right-0 bg-[#005f73] rounded-full p-1 cursor-pointer hover:bg-[#004a5c]"
                    onClick={triggerFileInput}
                  >
                    <Pencil size={16} className="text-white" />
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* File error message */}
              {fileError && (
                <p className="text-center text-sm text-red-600 mb-4">
                  {fileError}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter Client's Name"
                    value={clientFormData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="client@example.com"
                    value={clientFormData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    required
                    placeholder="+977 98XXXXXXXX"
                    value={clientFormData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  />
                </div>

                {/* Two column layout for Address and Organisation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Hattiban, Lalitpur"
                      value={clientFormData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Organisation
                    </label>
                    <input
                      type="text"
                      name="organisation"
                      placeholder="ABC Enterprises"
                      value={clientFormData.organisation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    placeholder="Additional notes about the client"
                    value={clientFormData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  ></textarea>
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
                  className="bg-teal-600 text-white px-8 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Client</span>
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
                Are you sure you want to delete <strong>{client.name}</strong>?
                This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClient}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format dates as "X time ago"
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);

    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return "just now";
}

// Helper function to get payment status from an invoice
function getPaymentStatus(invoice) {
  if (!invoice) return "";

  if (invoice.status === "paid") return "Paid";
  if (invoice.status === "paid-partially") return "Partially Paid";
  if (invoice.status === "sent") return "Sent";
  if (invoice.status === "viewed") return "Viewed";
  if (invoice.status === "overdue") return "Overdue";

  return invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
}

export default ClientDetailsPage;

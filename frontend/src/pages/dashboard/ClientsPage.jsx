import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Loader,
  Plus,
  Search,
  Pencil,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import clientService from "../../services/clientService";

function ClientsPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    revenueMin: "",
    revenueMax: "",
  });

  // Client data
  const [allClients, setAllClients] = useState([]);

  // For client form/modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    organisation: "",
    profileImage: null,
    remarks: "",
  });
  const [formMode, setFormMode] = useState("create"); // create or edit
  const [currentClientId, setCurrentClientId] = useState(null);

  // For delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Add a file input ref
  const fileInputRef = useRef(null);

  // Add state for file preview and validation
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Add the loading state variable
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all clients when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientService.getAllClients();

      // Transform API data to match our expected format
      const formattedClients = data.map((client) => ({
        id: client._id,
        name: client.name,
        email: client.email || "",
        contactNumber: client.contactNumber,
        address: client.address || "",
        organisation: client.organisation || "",
        profileImage:
          client.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            client.name
          )}&background=random`,
        remarks: client.remarks || "",
        revenue: client.revenue
          ? `Rs. ${formatNumber(client.revenue)}`
          : "Rs. 0",
        revenueNumber: client.revenue || 0,
      }));

      setAllClients(formattedClients);
    } catch (err) {
      setError("Failed to load clients. Please try again.");
      console.error("Error fetching clients:", err);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientFormData({
      ...clientFormData,
      [name]: value,
    });
  };

  // Handle file input change
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

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Clear the file input
  const clearFileInput = () => {
    setClientFormData({
      ...clientFormData,
      profileImage: null,
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open modal for creating a new client
  const handleAddClient = () => {
    setFormMode("create");
    setClientFormData({
      name: "",
      email: "",
      contactNumber: "",
      address: "",
      organisation: "",
      profileImage: null,
      remarks: "",
    });
    setImagePreview(null);
    setFileError(null);
    setShowClientModal(true);
  };

  // Open modal for editing a client - update to handle file preview
  const handleEditClient = (client) => {
    setFormMode("edit");
    setCurrentClientId(client.id);

    // Reset file preview and error
    setImagePreview(client.profileImage || null);
    setFileError(null);

    setClientFormData({
      name: client.name,
      email: client.email,
      contactNumber: client.contactNumber || "",
      address: client.address || "",
      organisation: client.organisation || "",
      profileImage: null, // We'll set the actual file when/if they upload a new one
      remarks: client.remarks || "",
    });

    setShowClientModal(true);
  };

  // Show delete confirmation
  const handleDeletePrompt = (client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  // Perform actual client deletion
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      await clientService.deleteClient(clientToDelete.id);
      setAllClients(
        allClients.filter((client) => client.id !== clientToDelete.id)
      );
      toast.success("Client deleted successfully");
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting client:", err);
      toast.error("Failed to delete client");
    }
  };

  // Submit client form (create or edit) - update to handle file upload
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

    setIsSubmitting(true); // Start loading

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();

      // Add text fields to FormData
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

      if (formMode === "create") {
        // Create new client with FormData
        const newClient = await clientService.createClient(formData);

        // Add the new client to the state
        const formattedNewClient = {
          id: newClient._id,
          name: newClient.name,
          email: newClient.email,
          contactNumber: newClient.contactNumber,
          address: newClient.address || "",
          organisation: newClient.organisation || "",
          profileImage:
            newClient.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              newClient.name
            )}&background=random`,
          remarks: newClient.remarks || "",
          revenue: "Rs. 0",
          revenueNumber: 0,
        };

        setAllClients([...allClients, formattedNewClient]);
        toast.success("Client created successfully");
      } else {
        // Update existing client with FormData
        const updatedClient = await clientService.updateClient(
          currentClientId,
          formData
        );

        // Update the client in state
        setAllClients(
          allClients.map((client) => {
            if (client.id === currentClientId) {
              return {
                ...client,
                name: updatedClient.name,
                email: updatedClient.email,
                contactNumber: updatedClient.contactNumber,
                address: updatedClient.address || "",
                organisation: updatedClient.organisation || "",
                profileImage: updatedClient.profileImage || client.profileImage,
                remarks: updatedClient.remarks || "",
              };
            }
            return client;
          })
        );

        toast.success("Client updated successfully");
      }

      // Close the modal
      setShowClientModal(false);
    } catch (err) {
      console.error("Error saving client:", err);
      toast.error(
        formMode === "create"
          ? "Failed to create client"
          : "Failed to update client"
      );
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    // First apply search
    let result = [...allClients].filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply revenue filters if set
      const matchesRevenueMin =
        !filters.revenueMin ||
        client.revenueNumber >= parseInt(filters.revenueMin);
      const matchesRevenueMax =
        !filters.revenueMax ||
        client.revenueNumber <= parseInt(filters.revenueMax);

      return matchesSearch && matchesRevenueMin && matchesRevenueMax;
    });

    // Then sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valueA, valueB;

        if (sortConfig.key === "revenue") {
          valueA = a.revenueNumber;
          valueB = b.revenueNumber;
        } else {
          valueA = a[sortConfig.key]?.toLowerCase() || "";
          valueB = b[sortConfig.key]?.toLowerCase() || "";
        }

        if (valueA < valueB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [allClients, searchTerm, sortConfig, filters]);

  // Get current page items
  const indexOfLastClient = currentPage * itemsPerPage;
  const indexOfFirstClient = indexOfLastClient - itemsPerPage;
  const currentClients = filteredAndSortedClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Render sorting icon
  const getSortIcon = (name) => {
    if (sortConfig.key === name) {
      return sortConfig.direction === "asc" ? (
        <ChevronUp size={16} className="inline ml-1" />
      ) : (
        <ChevronDown size={16} className="inline ml-1" />
      );
    }
    return null;
  };

  // Handle client row click
  const handleClientClick = (clientId) => {
    navigate(`/dashboard/clients/${clientId}`);
  };

  return (
    <div>
      {/* Header with title and add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Manage Clients</h1>
        <button
          onClick={handleAddClient}
          className="bg-[#18cb96] hover:bg-[#14a085] text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Plus size={18} className="mr-1" /> Add New
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchClients}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Search and filter section */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients by name or email"
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#18cb96] focus:border-[#18cb96]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center hover:bg-gray-50"
          >
            <Filter size={16} className="mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp size={16} className="ml-2" />
            ) : (
              <ChevronDown size={16} className="ml-2" />
            )}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-sm font-medium mb-2">Revenue Range (Rs.)</div>
            <div className="flex flex-wrap gap-3">
              <div className="w-full sm:w-auto">
                <input
                  type="number"
                  name="revenueMin"
                  placeholder="Min"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  value={filters.revenueMin}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="w-full sm:w-auto">
                <input
                  type="number"
                  name="revenueMax"
                  placeholder="Max"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  value={filters.revenueMax}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => setFilters({ revenueMin: "", revenueMax: "" })}
                  className="px-3 py-2 text-sm text-[#18cb96] hover:text-[#14a085]"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          // Loading state
          <div className="animate-pulse">
            <div className="flex border-b border-gray-200 p-4">
              <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
              <div className="w-1/3 h-8 bg-gray-200 rounded mx-4"></div>
              <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex border-b border-gray-200 p-4">
                <div className="flex items-center w-1/3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-1/3 h-5 bg-gray-200 rounded my-auto mx-4"></div>
                <div className="w-1/3 h-5 bg-gray-200 rounded my-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedClients.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm || filters.revenueMin || filters.revenueMax ? (
              <div>
                <p>No clients found matching your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ revenueMin: "", revenueMax: "" });
                  }}
                  className="mt-2 text-sm text-[#18cb96] hover:text-[#14a085] underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                <p>You haven't added any clients yet.</p>
                <button
                  onClick={handleAddClient}
                  className="mt-2 px-4 py-2 bg-[#18cb96] hover:bg-[#14a085] text-white rounded-md flex items-center transition-colors mx-auto"
                >
                  <Plus size={18} className="mr-1" /> Add New Client
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th
                      className="px-6 py-4 text-lg text-left text-gray-800 font-semibold w-1/3 border-r border-gray-200 cursor-pointer"
                      onClick={() => requestSort("name")}
                    >
                      Name {getSortIcon("name")}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-lg text-gray-800 font-semibold w-1/3 border-r border-gray-200 cursor-pointer"
                      onClick={() => requestSort("email")}
                    >
                      Email {getSortIcon("email")}
                    </th>
                    <th
                      className="px-6 py-4 text-left text-lg text-gray-800 font-semibold w-1/3 cursor-pointer"
                      onClick={() => requestSort("revenue")}
                    >
                      Revenue generated {getSortIcon("revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleClientClick(client.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="flex items-center">
                          <img
                            src={client.profileImage}
                            alt={client.name}
                            className="w-12 h-12 rounded-full mr-4 object-cover"
                          />
                          <div className="text-md font-medium text-gray-900">
                            {client.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-700 border-r border-gray-200">
                        {client.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-  md font-medium">
                        {client.revenue}
                      </td>
                    </tr>
                  ))}

                  {/* Empty rows to fill the table if needed */}
                  {currentClients.length < itemsPerPage &&
                    Array.from({
                      length: itemsPerPage - currentClients.length,
                    }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td className="px-6 py-10 border-r border-gray-200">
                          &nbsp;
                        </td>
                        <td className="px-6 py-10 border-r border-gray-200">
                          &nbsp;
                        </td>
                        <td className="px-6 py-10">&nbsp;</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstClient + 1} to{" "}
                  {Math.min(indexOfLastClient, filteredAndSortedClients.length)}{" "}
                  of {filteredAndSortedClients.length} clients
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      // Create a simple pagination that shows current page and nearby pages
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      if (pageNumber <= totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md ${
                              currentPage === pageNumber
                                ? "bg-[#18cb96] text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    }
                  )}

                  <button
                    onClick={() =>
                      paginate(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Client Modal with improved design */}
      {showClientModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-medium text-center w-full">
                {formMode === "create" ? "Add a Client" : "Edit Client"}
              </h3>
              <button
                onClick={() => setShowClientModal(false)}
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
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-300 flex items-center justify-center">
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
                    className="absolute bottom-0 right-0 bg-[#14a085] rounded-full p-1 cursor-pointer hover:bg-[#004a5c]"
                    onClick={triggerFileInput}
                  >
                    <Pencil size={14} className="text-white" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Client's Address"
                      value={clientFormData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organisation
                    </label>
                    <input
                      type="text"
                      name="organisation"
                      placeholder="Company Name"
                      value={clientFormData.organisation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  onClick={() => setShowClientModal(false)}
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
                    <span>{formMode === "create" ? "Add" : "Update"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;

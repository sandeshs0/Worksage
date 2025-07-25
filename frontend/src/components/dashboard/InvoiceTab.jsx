import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  MoreVertical,
  // Money,
  Plus,
  PlusCircleIcon,
  Search,
  Send,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { toast } from "sonner";
import {
  deleteInvoice,
  getInvoices,
  getInvoiceStats,
  logPayment,
} from "../../services/invoiceService";
import InvoiceModal from "./InvoiceModal";
import InvoiceSuccessDialog from "./InvoiceSuccessDialog";
import PaymentModal from "./PaymentModal";
import SendInvoiceModal from "./SendInvoiceModal";
import StatCard from "./StatCard";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const InvoiceTab = ({ project, client }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newlyCreatedInvoice, setNewlyCreatedInvoice] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // New state for tab switching
  const [openMenuId, setOpenMenuId] = useState(null); // Track which dropdown menu is open
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchInvoices();
    fetchInvoiceStats();
  }, [project._id, filters]);

  // Keyboard shortcut for creating new invoice (Ctrl + I)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl + I (or Cmd + I on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "i") {
        event.preventDefault();
        handleCreateInvoice();
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const queryFilters = {
        project: project._id,
        ...filters,
        page: pagination.currentPage,
        limit: 10,
      };

      const response = await getInvoices(queryFilters);
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      const stats = await getInvoiceStats();
      setInvoiceStats(stats);
    } catch (error) {
      console.error("Failed to fetch invoice stats:", error);
      setInvoiceStats(null);
    }
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceModal(true);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await deleteInvoice(invoiceId);
      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const handleSendInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowSendModal(true);
  };

  const handleLogPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentLogged = async (paymentData) => {
    try {
      await logPayment(selectedInvoice._id, paymentData);
      toast.success("Payment logged successfully");
      fetchInvoices(); // Refresh the invoice list
    } catch (error) {
      toast.error("Failed to log payment");
      throw error;
    }
  };

  // Toggle the dropdown menu for a specific invoice
  const toggleMenu = (invoiceId) => {
    setOpenMenuId(openMenuId === invoiceId ? null : invoiceId);
  };

  // Close all dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuElements = document.querySelectorAll(".invoice-action-menu");
      let clickedInsideMenu = false;

      menuElements.forEach((menu) => {
        if (menu.contains(event.target)) {
          clickedInsideMenu = true;
        }
      });

      if (!clickedInsideMenu) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInvoiceSaved = (savedInvoice, isNew = false) => {
    if (isNew) {
      setNewlyCreatedInvoice(savedInvoice);
      setShowSuccessDialog(true);
    } else {
      setShowInvoiceModal(false);
      fetchInvoices();
    }
    // Refresh invoice stats when an invoice is saved
    fetchInvoiceStats();
  };

  const handleSendNow = () => {
    setShowSuccessDialog(false);
    setShowInvoiceModal(false);
    setSelectedInvoice(newlyCreatedInvoice);
    setShowSendModal(true);
  };

  const handleSendLater = () => {
    setShowSuccessDialog(false);
    setShowInvoiceModal(false);
    fetchInvoices();
    fetchInvoiceStats();
  };

  const handleInvoiceSent = () => {
    setShowSendModal(false);
    fetchInvoices();
    toast.success("Invoice sent successfully");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-700", icon: FileText },
      sent: { color: "bg-blue-100 text-blue-700", icon: Send },
      viewed: { color: "bg-yellow-100 text-yellow-700", icon: Eye },
      paid: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      "paid-partially": {
        color: "bg-orange-100 text-orange-700",
        icon: DollarSign,
      },
      overdue: { color: "bg-red-100 text-red-700", icon: AlertCircle },
      cancelled: { color: "bg-gray-100 text-gray-700", icon: Trash2 },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    const displayStatus =
      status === "paid-partially"
        ? "Partially Paid"
        : status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon size={12} className="mr-1" />
        {displayStatus}
      </span>
    );
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">
            Manage invoices for {project.name}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <span>Quick create:</span>
            <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg">
              Ctrl
            </kbd>
            <span className="mx-1">+</span>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg">
              I
            </kbd>
          </div>
          <button
            onClick={handleCreateInvoice}
            className="bg-[#18cb96] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#005f67] transition-colors"
            title="Create Invoice (Ctrl + I)"
          >
            <Plus size={16} className="mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "list"
              ? "bg-white text-[#18cb96] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("list")}
        >
          <FileText size={16} className="mr-2" />
          Invoice List
        </button>
        <button
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "insights"
              ? "bg-white text-[#18cb96] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("insights")}
        >
          <BarChart3 size={16} className="mr-2" />
          Invoice Insights
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        /* Invoice List Content */
        <div>
          {/* Mini Stats for Invoice List */}
          {invoiceStats && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Invoices
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {invoiceStats.data.totalInvoices}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        Rs.{" "}
                        {invoiceStats.data.totalRevenue?.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paid</p>
                      <p className="text-xl font-bold text-gray-900">
                        Rs.{" "}
                        {invoiceStats.data.totalPaid?.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Outstanding
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        Rs.{" "}
                        {invoiceStats.data.totalOutstanding?.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#18cb96]"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="paid">Paid</option>
                  <option value="paid-partially">Partially Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#18cb96]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#18cb96]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#18cb96]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18cb96]"></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No invoices yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first invoice to get started
                </p>
                <button
                  onClick={handleCreateInvoice}
                  className="bg-[#18cb96] text-white px-4 py-2 rounded-lg hover:bg-[#005f67] transition-colors"
                  title="Create Invoice (Ctrl + I)"
                >
                  Create Invoice
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.items?.length || 0} items
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invoice.issueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              {/* Primary Actions - Send and Log Payment */}
                              <button
                                onClick={() => handleSendInvoice(invoice)}
                                className="flex items-center px-2 py-1 text-white bg-[#18cb96] rounded hover:bg-blue-700"
                                title="Send Invoice"
                              >
                                <Send size={15} className="mr-1" />
                                <span className="text-md">Send</span>
                              </button>

                              {(invoice.status === "sent" ||
                                invoice.status === "viewed" ||
                                invoice.status === "overdue" ||
                                invoice.status === "paid-partially") && (
                                <button
                                  onClick={() => handleLogPayment(invoice)}
                                  className="flex items-center px-2 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                                  title="Log Payment"
                                >
                                  <PlusCircleIcon size={14} className="mr-1" />
                                  <span>Log Payment</span>
                                </button>
                              )}

                              {/* Three-dot menu */}
                              <div className="relative invoice-action-menu">
                                <button
                                  onClick={() => toggleMenu(invoice._id)}
                                  className="p-1.5 rounded-full hover:bg-gray-200"
                                  title="More Options"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {openMenuId === invoice._id && (
                                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
                                    <button
                                      onClick={() => {
                                        handleEditInvoice(invoice);
                                        setOpenMenuId(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <div className="flex items-center">
                                        <Edit
                                          size={14}
                                          className="mr-2 text-gray-600"
                                        />
                                        Edit
                                      </div>
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteInvoice(invoice._id);
                                        setOpenMenuId(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                      <div className="flex items-center">
                                        <Trash2 size={14} className="mr-2" />
                                        Delete
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                        {Math.min(
                          pagination.currentPage * 10,
                          pagination.total
                        )}{" "}
                        of {pagination.total} invoices
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setPagination({
                              ...pagination,
                              currentPage: pagination.currentPage - 1,
                            })
                          }
                          disabled={!pagination.hasPreviousPage}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setPagination({
                              ...pagination,
                              currentPage: pagination.currentPage + 1,
                            })
                          }
                          disabled={!pagination.hasNextPage}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        /* Invoice Insights */
        <div>
          {invoiceStats ? (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Invoices"
                  value={invoiceStats.data.totalInvoices?.toString() || "0"}
                  icon={FileText}
                />
                <StatCard
                  title="Total Revenue"
                  value={`Rs. ${
                    invoiceStats.data.totalRevenue?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    }) || "0"
                  }`}
                  subtitle="All time revenue"
                  icon={TrendingUp}
                />
                <StatCard
                  title="Amount Paid"
                  value={`Rs. ${
                    invoiceStats.data.totalPaid?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    }) || "0"
                  }`}
                  subtitle="Successfully collected"
                  icon={CheckCircle}
                />
                <StatCard
                  title="Outstanding"
                  value={`Rs. ${
                    invoiceStats.data.totalOutstanding?.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    ) || "0"
                  }`}
                  subtitle="Pending payment"
                  icon={Clock}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Status Doughnut Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Invoice Status Distribution
                  </h4>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: [
                          "Draft",
                          "Sent",
                          "Viewed",
                          "Paid",
                          "Overdue",
                          "Cancelled",
                        ],
                        datasets: [
                          {
                            data: [
                              invoiceStats.data.byStatus.draft || 0,
                              invoiceStats.data.byStatus.sent || 0,
                              invoiceStats.data.byStatus.viewed || 0,
                              invoiceStats.data.byStatus.paid || 0,
                              invoiceStats.data.byStatus.overdue || 0,
                              invoiceStats.data.byStatus.cancelled || 0,
                            ],
                            backgroundColor: [
                              "#9CA3AF", // Gray for draft
                              "#3B82F6", // Blue for sent
                              "#F59E0B", // Yellow for viewed
                              "#10B981", // Green for paid
                              "#EF4444", // Red for overdue
                              "#6B7280", // Dark gray for cancelled
                            ],
                            borderWidth: 2,
                            borderColor: "#ffffff",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                const label = context.label || "";
                                const value = context.parsed;
                                const total = context.dataset.data.reduce(
                                  (a, b) => a + b,
                                  0
                                );
                                const percentage =
                                  total > 0
                                    ? Math.round((value / total) * 100)
                                    : 0;
                                return `${label}: ${value} (${percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Revenue vs Outstanding Bar Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Financial Overview
                  </h4>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ["Revenue", "Paid", "Outstanding"],
                        datasets: [
                          {
                            label: "Amount (Rs.)",
                            data: [
                              invoiceStats.data.totalRevenue || 0,
                              invoiceStats.data.totalPaid || 0,
                              invoiceStats.data.totalOutstanding || 0,
                            ],
                            backgroundColor: ["#18cb96", "#10B981", "#F59E0B"],
                            borderColor: ["#14a085", "#059669", "#D97706"],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `${
                                  context.label
                                }: Rs. ${context.parsed.y.toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 2 }
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value) {
                                return "Rs. " + value.toLocaleString();
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-3">
                  Performance Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Collection Rate
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {invoiceStats.data.totalRevenue > 0
                            ? Math.round(
                                (invoiceStats.data.totalPaid /
                                  invoiceStats.data.totalRevenue) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Outstanding Rate
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {invoiceStats.data.totalRevenue > 0
                            ? Math.round(
                                (invoiceStats.data.totalOutstanding /
                                  invoiceStats.data.totalRevenue) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Average Invoice
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          Rs.
                          {invoiceStats.data.totalInvoices > 0
                            ? (
                                invoiceStats.data.totalRevenue /
                                invoiceStats.data.totalInvoices
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : "0"}
                        </p>
                      </div>
                      {/* <Money className="h-8 w-8 text-blue-200" /> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-3">
                  Status Breakdown
                </h4>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Draft</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {invoiceStats.data.byStatus.draft || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sent</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {invoiceStats.data.byStatus.sent || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Viewed</p>
                      <p className="text-lg font-semibold text-yellow-600">
                        {invoiceStats.data.byStatus.viewed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        {invoiceStats.data.byStatus.paid || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Overdue</p>
                      <p className="text-lg font-semibold text-red-600">
                        {invoiceStats.data.byStatus.overdue || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cancelled</p>
                      <p className="text-lg font-semibold text-gray-600">
                        {invoiceStats.data.byStatus.cancelled || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18cb96] mx-auto mb-2"></div>
                <p className="text-gray-500">Loading invoice insights...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showInvoiceModal && (
        <InvoiceModal
          invoice={selectedInvoice}
          project={project}
          client={client}
          onClose={() => setShowInvoiceModal(false)}
          onSave={handleInvoiceSaved}
        />
      )}

      {showSendModal && selectedInvoice && (
        <SendInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setShowSendModal(false)}
          onSent={handleInvoiceSent}
        />
      )}

      {showPaymentModal && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setShowPaymentModal(false)}
          onPaymentLogged={handlePaymentLogged}
        />
      )}

      {showSuccessDialog && newlyCreatedInvoice && (
        <InvoiceSuccessDialog
          invoice={newlyCreatedInvoice}
          onSendNow={handleSendNow}
          onClose={handleSendLater}
        />
      )}
    </div>
  );
};

export default InvoiceTab;

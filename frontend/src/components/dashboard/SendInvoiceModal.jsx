import { Eye, EyeOff, Mail, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { sendInvoice } from "../../services/invoiceService";
import { generateInvoiceHTML } from "../../utils/generateInvoiceHTML";

const SendInvoiceModal = ({ invoice, onClose, onSent }) => {
  const [formData, setFormData] = useState({
    email: invoice.client?.email || "",
    subject: `Invoice ${invoice.invoiceNumber} from ${
      invoice.project?.name || "Your Company"
    }`,
    message: `Dear ${invoice.client?.name || "Valued Client"},

Please find attached your invoice for the services rendered. The payment is due by ${new Date(
      invoice.dueDate
    ).toLocaleDateString()}.

If you have any questions about this invoice, please don't hesitate to reach out.

Thank you for your business!

Best regards,
Your Team`,
  });

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef(null);

  // Generate HTML content if not already present
  const htmlContent =
    invoice.htmlContent ||
    generateInvoiceHTML(
      {
        ...invoice,
        client: invoice.client,
        project: invoice.project,
      },
      invoice.invoiceNumber
    );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await sendInvoice(invoice._id, {
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      toast.success("Invoice sent successfully!");
      onSent();
    } catch (error) {
      toast.error("Failed to send invoice");
      console.error("Error sending invoice:", error);
      setLoading(false);
    }
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Mail className="mr-2 h-5 w-5 text-[#007991]" />
              Send Invoice to Client
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content area - conditional layout based on preview state */}
          {showPreview ? (
            // Preview Mode - Full width layout
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-white p-6">
                <div className="mx-auto max-w-4xl">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-[#007991]" />
                    Invoice Preview
                  </h3>

                  {/* Preview container with proper styling */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
                    <div
                      ref={contentRef}
                      className="invoice-preview-container"
                      style={{
                        height: "600px",
                        overflowY: "auto",
                        backgroundColor: "#fff",
                        padding: "20px 0",
                      }}
                    >
                      <div
                        className="max-w-3xl mx-auto"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Form Mode - Original layout
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="bg-[#007991]/10 border-l-4 border-[#007991] p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Mail className="h-5 w-5 text-[#007991]" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-[#007991]">
                        This invoice will be sent to the client via email. You
                        can customize the message below.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form content */}
                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                      placeholder="client@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                      placeholder="Invoice subject..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      rows={8}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                      placeholder="Email message..."
                      required
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Invoice Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Invoice Number:</span>
                        <span className="ml-2 font-medium">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Client:</span>
                        <span className="ml-2">{invoice.client?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Date:</span>
                        <span className="ml-2">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Fixed Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center px-3 py-2 border rounded-md transition-colors text-sm ${
                  showPreview
                    ? "bg-[#007991]/10 text-[#007991] border-[#007991] hover:bg-[#007991]/20"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Edit Message
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Invoice
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[#007991] text-white rounded-md hover:bg-[#007991]/80 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendInvoiceModal;

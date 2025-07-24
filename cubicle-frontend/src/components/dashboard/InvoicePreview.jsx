import { Download, Edit, X } from "lucide-react";
import { useState } from "react";
import { generateInvoiceHTML } from "../../utils/generateInvoiceHTML";

const InvoicePreview = ({ invoiceData, onClose, onEdit }) => {
  const [viewMode, setViewMode] = useState("styled"); // 'styled' or 'html'

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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShowHTML = () => {
    setViewMode(viewMode === "styled" ? "html" : "styled");
  };

  const generatedHTML = generateInvoiceHTML(invoiceData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            Invoice Preview
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleShowHTML}
              className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {viewMode === "styled" ? "View HTML" : "View Styled"}
            </button>
            <button
              onClick={onEdit}
              className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <Download size={16} className="mr-2" />
              Print/PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === "html" ? (
            <div className="p-4">
              <div className="bg-gray-100 border border-gray-300 rounded p-4">
                <h3 className="text-lg font-medium mb-3">
                  Generated HTML Content:
                </h3>
                <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
                  <code>{generatedHTML}</code>
                </pre>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-3">HTML Preview:</h3>
                <div
                  className="border border-gray-300 rounded"
                  dangerouslySetInnerHTML={{ __html: generatedHTML }}
                />
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white">
              <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      INVOICE
                    </h1>
                    <div className="text-gray-600">
                      <p className="text-lg font-medium">
                        {invoiceData.project?.name || "Your Company"}
                      </p>
                    
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h2 className="text-xl font-semibold text-blue-800 mb-2">
                        Invoice #INV-{new Date().getFullYear()}-001
                      </h2>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Issue Date:</span>{" "}
                          {formatDate(invoiceData.issueDate)}
                        </p>
                        <p>
                          <span className="font-medium">Due Date:</span>{" "}
                          {formatDate(invoiceData.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill To Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Bill To:
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      {invoiceData.client?.name}
                    </p>
                    <p className="text-gray-600">{invoiceData.client?.email}</p>
                    {invoiceData.client?.address && (
                      <>
                        <p className="text-gray-600">
                          {invoiceData.client.address}
                        </p>
                        <p className="text-gray-600">
                          {invoiceData.client.city}, {invoiceData.client.state}{" "}
                          {invoiceData.client.zipCode}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Project Information */}
                {invoiceData.project && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Project:
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="font-medium text-blue-900">
                        {invoiceData.project.name}
                      </p>
                      {invoiceData.project.description && (
                        <p className="text-blue-700 text-sm mt-1">
                          {invoiceData.project.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Line Items */}
                <div className="mb-8">
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoiceData.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                  <div className="w-72">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(invoiceData.subtotal)}
                        </span>
                      </div>

                      {invoiceData.taxAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Tax (
                            {invoiceData.taxType === "percentage"
                              ? `${invoiceData.taxRate}%`
                              : "Fixed"}
                            ):
                          </span>
                          <span className="font-medium">
                            {formatCurrency(invoiceData.taxAmount)}
                          </span>
                        </div>
                      )}

                      {invoiceData.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Discount (
                            {invoiceData.discountType === "percentage"
                              ? `${invoiceData.discountValue}%`
                              : "Fixed"}
                            ):
                          </span>
                          <span className="font-medium text-red-600">
                            -{formatCurrency(invoiceData.discountAmount)}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            Total:
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(invoiceData.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {invoiceData.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Notes:
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {invoiceData.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Terms Section */}
                {invoiceData.terms && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Terms & Conditions:
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {invoiceData.terms}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Instructions */}
                {invoiceData.paymentInstructions && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Payment Instructions:
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-700 whitespace-pre-wrap">
                        {invoiceData.paymentInstructions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-6">
                  <p>Thank you for your business!</p>
                 
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .fixed {
            position: static !important;
          }
          .bg-black {
            background: transparent !important;
          }
          .bg-opacity-50 {
            background: transparent !important;
          }
          .rounded-lg {
            border-radius: 0 !important;
          }
          .shadow-xl {
            box-shadow: none !important;
          }
          .overflow-hidden {
            overflow: visible !important;
          }
          .max-h-\[90vh\] {
            max-height: none !important;
          }
          .p-4 {
            padding: 0 !important;
          }
          .border-b {
            border-bottom: none !important;
          }
          .bg-gray-50 {
            background: transparent !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;

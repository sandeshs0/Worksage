import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Calculator, Eye, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createInvoice, updateInvoice } from "../../services/invoiceService";
import { generateInvoiceHTML } from "../../utils/generateInvoiceHTML";
import InvoicePreview from "./InvoicePreview";
import SortableLineItem from "./SortabeLineItem";

const InvoiceModal = ({ invoice, project, client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    items: [
      {
        id: "1",
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
    taxType: "percentage",
    taxRate: 0,
    discountType: "percentage",
    discountValue: 0,
    notes: "",
    terms: "Payment due within 30 days",
    paymentInstructions: "",
    htmlContent: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (invoice) {
      setFormData({
        issueDate: new Date(invoice.issueDate).toISOString().split("T")[0],
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        items: invoice.items.map((item, index) => ({
          id: String(index + 1),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        taxType: invoice.taxType || "percentage",
        taxRate: invoice.taxRate || 0,
        discountType: invoice.discountType || "percentage",
        discountValue: invoice.discountValue || 0,
        notes: invoice.notes || "",
        terms: invoice.terms || "Payment due within 30 days",
        paymentInstructions: invoice.paymentInstructions || "",
        htmlContent: invoice.htmlContent || "",
      });
    }
  }, [invoice]);

  useEffect(() => {
    calculateTotals();
  }, [
    formData.items,
    formData.taxType,
    formData.taxRate,
    formData.discountType,
    formData.discountValue,
  ]);

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    let taxAmount = 0;
    if (formData.taxType === "percentage") {
      taxAmount = (subtotal * formData.taxRate) / 100;
    } else {
      taxAmount = formData.taxRate;
    }

    let discountAmount = 0;
    if (formData.discountType === "percentage") {
      discountAmount = (subtotal * formData.discountValue) / 100;
    } else {
      discountAmount = formData.discountValue;
    }

    const total = subtotal + taxAmount - discountAmount;

    setCalculations({
      subtotal,
      taxAmount,
      discountAmount,
      total,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    const newItem = {
      id: String(Date.now()),
      description: "",
      quantity: 1,
      unitPrice: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (id) => {
    if (formData.items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.items.findIndex((item) => item.id === active.id);
        const newIndex = prev.items.findIndex((item) => item.id === over.id);

        return {
          ...prev,
          items: arrayMove(prev.items, oldIndex, newIndex),
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate the HTML content for the invoice
      const invoiceHtmlContent = generateInvoiceHTML({
        ...formData,
        ...calculations,
        client,
        project,
      });

      const payload = {
        client: client._id,
        project: project._id,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: formData.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        taxType: formData.taxType,
        taxRate: Number(formData.taxRate),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        notes: formData.notes,
        terms: formData.terms,
        paymentInstructions: formData.paymentInstructions,
        htmlContent: invoiceHtmlContent, // Add the generated HTML content
      };

      let savedInvoice;

      if (invoice) {
        const response = await updateInvoice(invoice._id, payload);
        savedInvoice = response.data;
        toast.success("Invoice updated successfully");
      } else {
        const response = await createInvoice(payload);
        savedInvoice = response.data;
        toast.success("Invoice created successfully");
      }

      // Pass the saved invoice and whether it's new to the parent component
      onSave(savedInvoice, invoice === null); // null means it's a new invoice
    } catch (error) {
      toast.error(
        invoice ? "Failed to update invoice" : "Failed to create invoice"
      );
      console.error("Error saving invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  if (showPreview) {
    return (
      <InvoicePreview
        invoiceData={{ ...formData, ...calculations, client, project }}
        onClose={() => setShowPreview(false)}
        onEdit={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Form Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {invoice ? "Edit Invoice" : "Create Invoice"}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client & Project Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Invoice Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <span className="ml-2 font-medium">{client.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Project:</span>
                    <span className="ml-2 font-medium">{project.name}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                    required
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Line Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center px-3 py-2 text-[#007991] border border-[#007991] rounded-md hover:bg-[#007991]/10"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                    <div className="col-span-1"></div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-2">Total</div>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={formData.items}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="divide-y divide-gray-200">
                        {formData.items.map((item) => (
                          <SortableLineItem
                            key={item.id}
                            item={item}
                            onChange={handleItemChange}
                            onRemove={removeItem}
                            canRemove={formData.items.length > 1}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {/* Tax and Discount */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tax</h4>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select
                        value={formData.taxType}
                        onChange={(e) =>
                          handleInputChange("taxType", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) =>
                          handleInputChange("taxRate", e.target.value)
                        }
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                        placeholder={
                          formData.taxType === "percentage"
                            ? "Tax %"
                            : "Tax Amount"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Discount</h4>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select
                        value={formData.discountType}
                        onChange={(e) =>
                          handleInputChange("discountType", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) =>
                          handleInputChange("discountValue", e.target.value)
                        }
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                        placeholder={
                          formData.discountType === "percentage"
                            ? "Discount %"
                            : "Discount Amount"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                    placeholder="Additional notes for the invoice..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => handleInputChange("terms", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                    placeholder="Terms and conditions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Instructions
                  </label>
                  <textarea
                    value={formData.paymentInstructions}
                    onChange={(e) =>
                      handleInputChange("paymentInstructions", e.target.value)
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007991]"
                    placeholder="Payment instructions..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#007991] text-white rounded-md hover:bg-[#007991]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Saving..."
                    : invoice
                    ? "Update Invoice"
                    : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Calculations Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calculator size={18} className="mr-2" />
            Calculations
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(calculations.subtotal)}
              </span>
            </div>

            {calculations.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Tax (
                  {formData.taxType === "percentage"
                    ? `${formData.taxRate}%`
                    : "Fixed"}
                  ):
                </span>
                <span className="font-medium">
                  {formatCurrency(calculations.taxAmount)}
                </span>
              </div>
            )}

            {calculations.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Discount (
                  {formData.discountType === "percentage"
                    ? `${formData.discountValue}%`
                    : "Fixed"}
                  ):
                </span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(calculations.discountAmount)}
                </span>
              </div>
            )}

            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculations.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span>{formData.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span>{new Date(formData.issueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span>{new Date(formData.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;

import { DollarSign, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PaymentModal = ({ invoice, onClose, onPaymentLogged }) => {
  const [formData, setFormData] = useState({
    amount: "",
    tip: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (parseFloat(formData.amount) > invoice.total) {
      toast.error("Payment amount cannot exceed invoice total");
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        amount: parseFloat(formData.amount),
        ...(formData.tip && { tip: parseFloat(formData.tip) }),
        ...(formData.note && { note: formData.note }),
      };

      await onPaymentLogged(paymentData);
      onClose();
    } catch (error) {
      console.error("Error logging payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const remainingAmount = invoice.total - (invoice.totalReceived || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-[#007991] p-2 rounded-lg mr-3">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Log Payment
              </h2>
              <p className="text-sm text-gray-600">
                Invoice #{invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Invoice Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Invoice Total:</span>
              <div className="font-semibold">
                {formatCurrency(invoice.total)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Already Received:</span>
              <div className="font-semibold text-green-600">
                {formatCurrency(invoice.totalReceived || 0)}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Remaining Amount:</span>
              <div className="font-semibold text-[#007991]">
                {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">Rs.</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007991] focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(remainingAmount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tip Amount (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">Rs.</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.tip}
                onChange={(e) => handleInputChange("tip", e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007991] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Note (Optional)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007991] focus:border-transparent"
              placeholder="e.g., Paid via bank transfer, Cash payment, etc."
              rows="3"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.amount}
              className="flex-1 px-4 py-2 bg-[#007991] text-white rounded-md hover:bg-[#005f67] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Logging..." : "Log Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;

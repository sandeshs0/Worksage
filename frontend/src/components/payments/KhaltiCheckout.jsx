import { useState } from "react";
import { toast } from "sonner";

const KhaltiCheckout = ({
  planType,
  onSuccess,
  onFailed,
  disabled = false,
  children,
  className = "",
  onInitiatePayment,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const initiatePayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      if (onInitiatePayment) {
        await onInitiatePayment(planType);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
      if (onFailed) {
        onFailed(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={initiatePayment}
      disabled={disabled || isLoading}
      className={`relative ${className} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={isLoading ? "opacity-0" : ""}>
        {isLoading ? "Initiating..." : children || "Pay with Khalti"}
      </span>
    </button>
  );
};

export default KhaltiCheckout;

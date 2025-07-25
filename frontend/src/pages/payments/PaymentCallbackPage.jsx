import { AlertCircle, CheckCircle, Loader, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import planService from "../../services/planService";

function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [verificationMessage, setVerificationMessage] = useState(
    "Verifying your payment..."
  );
  
  // Use refs to prevent infinite loops - these persist across re-renders
  const hasProcessed = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Absolutely prevent multiple executions with multiple checks
    if (hasProcessed.current) {
      console.log("Payment verification already processed, skipping...");
      return;
    }
    
    if (isProcessingRef.current) {
      console.log("Payment verification currently processing, skipping...");
      return;
    }

    console.log("Starting payment verification process...");
    
    // Mark as processed and processing immediately
    hasProcessed.current = true;
    isProcessingRef.current = true;
    
    // Start processing
    processPayment();
  }, []); // Intentionally empty dependency array

  const processPayment = async () => {
    try {
      console.log("Starting payment verification...");
      
      // Get URL parameters
      const status = searchParams.get("status");
      const pidx = searchParams.get("pidx");
      const transactionId = searchParams.get("transaction_id");
      const amount = searchParams.get("amount");

      console.log("Payment callback parameters:", {
        status,
        pidx,
        transactionId,
        amount,
      });

      // Validate required parameters
      if (!status || !pidx || !transactionId || !amount) {
        console.error("Missing required payment parameters");
        handleVerificationFailure(
          "Payment details are incomplete. Please contact support.",
          "Missing payment details in URL."
        );
        return;
      }

      // Check if payment was completed
      if (status !== "Completed") {
        console.log("Payment not completed, status:", status);
        const failMsg =
          status === "User canceled"
            ? "Payment was canceled by user"
            : `Payment failed with status: ${status}`;
        
        handleVerificationFailure(
          failMsg,
          "Payment not completed",
          status === "User canceled"
            ? "You canceled the payment"
            : "Payment was not successful"
        );
        return;
      }

      // Update status to show we're verifying
      setVerificationMessage("Verifying payment with server...");

      // Verify payment with backend
      console.log("Calling backend verification for pidx:", pidx);
      const response = await planService.verifyPlanUpgrade(pidx);

      if (response?.success) {
        console.log("Payment verification successful:", response);
        handleVerificationSuccess(response);
      } else {
        console.log("Payment verification failed:", response);
        handleVerificationFailure(
          "Payment verification failed. Please contact support.",
          "Payment verification failed",
          response?.message || "Please contact support for assistance"
        );
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      handleVerificationFailure(
        "An error occurred while verifying payment. Please contact support.",
        "Verification error",
        error.message || "Please contact support for assistance"
      );
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleVerificationSuccess = (response) => {
    console.log("Setting verification status to success...");
    setVerificationStatus("success");
    setVerificationMessage(
      "Payment verified successfully! Your plan has been upgraded."
    );

    toast.success("Plan upgraded successfully!", {
      description: `Welcome to your new ${
        response.planUpgrade?.toPlan || response.planDetails?.toPlan || "plan"
      }!`,
    });

    console.log("Redirecting to settings in 3 seconds...");
    setTimeout(() => {
      console.log("Executing redirect...");
      navigate("/dashboard/settings?tab=billing");
    }, 3000);
  };

  const handleVerificationFailure = (message, toastTitle, toastDescription) => {
    console.log("Setting verification status to failed...");
    setVerificationStatus("failed");
    setVerificationMessage(message);

    toast.error(toastTitle, {
      description: toastDescription || message,
    });

    console.log("Redirecting to settings in 4 seconds...");
    setTimeout(() => {
      console.log("Executing redirect...");
      navigate("/dashboard/settings?tab=billing");
    }, 4000);
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "verifying":
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "failed":
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "verifying":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const handleManualNavigation = () => {
    console.log("Manual navigation triggered");
    navigate("/dashboard/settings?tab=billing");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">{getStatusIcon()}</div>
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {verificationStatus === "verifying" && "Processing Payment"}
          {verificationStatus === "success" && "Payment Successful!"}
          {verificationStatus === "failed" && "Payment Failed"}
        </h1>
        <p className="text-gray-600 mb-6">{verificationMessage}</p>

        {verificationStatus === "verifying" && (
          <div className="text-sm text-gray-500">
            Please wait while we verify your payment...
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-sm text-gray-500">
            Redirecting you back to settings...
          </div>
        )}

        {verificationStatus === "failed" && (
          <div className="space-y-3">
            <button
              onClick={handleManualNavigation}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Settings
            </button>
            <div className="text-sm text-gray-500">
              If you believe this is an error, please contact support
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentCallbackPage;

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import authService from "../services/authService";

function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUserData, setOAuthProcessing } = useUser();

  //console.log("🔗 GoogleAuthCallback component mounted");
  //console.log("🔍 Current URL:", window.location.href);
  //console.log("🔍 Search params:", Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    //console.log("🚀 GoogleAuthCallback useEffect triggered");

    const handleCallback = async () => {
      try {
        // Set OAuth processing flag to prevent UserContext interference
        setOAuthProcessing(true);
        //console.log("🔄 Set OAuth processing flag to true");

        // Get token from URL params (should already be stored by pre-processor)
        const accessToken = searchParams.get("accessToken");
        const isNewUser = searchParams.get("isNewUser") === "true";

        //console.log("🔗 OAuth callback received:", {
          accessToken: accessToken ? "Present" : "Missing",
          isNewUser,
        });

        // Verify token is stored (pre-processor should have done this)
        const storedToken = localStorage.getItem("accessToken");
        //console.log("💾 Token check:", {
          fromURL: accessToken ? "Present" : "Missing",
          fromStorage: storedToken ? "Present" : "Missing",
        });

        if (!storedToken && accessToken) {
          //console.log("💾 Pre-processor missed token, storing now...");
          localStorage.setItem("accessToken", accessToken);
        }

        if (!accessToken && !storedToken) {
          throw new Error("No access token received from OAuth");
        }

        const tokenToUse = accessToken || storedToken;

        //console.log("🚀 Calling authService.handleOAuthCallback...");
        const result = await authService.handleOAuthCallback(
          tokenToUse,
          isNewUser
        );
        //console.log("✅ OAuth callback result:", result);

        if (result.success) {
          // Clear OAuth processing flags
          sessionStorage.removeItem("oauthInProgress");
          sessionStorage.removeItem("oauthIsNewUser");
          //console.log("🧹 Cleared OAuth processing flags");

          //console.log("🔄 Refreshing user data...");
          await refreshUserData(); // Refresh user context

          if (isNewUser) {
            //console.log("➡️ Redirecting to onboarding...");
            navigate("/dashboard/onboarding");
          } else {
            //console.log("➡️ Redirecting to dashboard...");
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("❌ OAuth callback error:", error);
        // Clean up on error
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("oauthInProgress");
        sessionStorage.removeItem("oauthIsNewUser");
        navigate("/login?error=oauth_failed");
      } finally {
        // Clear OAuth processing flag
        setOAuthProcessing(false);
        //console.log("🔄 Set OAuth processing flag to false");
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUserData, setOAuthProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-block w-16 h-16">
          <svg
            className="animate-spin h-16 w-16 text-teal-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="mt-4 text-lg text-gray-700">
          Authenticating with Google...
        </p>
      </motion.div>
    </div>
  );
}

export default GoogleAuthCallback;

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  console.log("Google auth token from URL:", token);
  useEffect(() => {
    console.log("Google auth token received:", token);
    if (token) {
      console.log("Google auth token received:", token);
      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Check if user is new (needs onboarding) or existing
      // This could be determined by additional info from the backend
      const isNewUser = searchParams.get("isNewUser") === "true";

      // Redirect to appropriate page
      if (isNewUser) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } else {
      document.alert("No token found in URL parameters");
      // No token found, redirect to login with error
      navigate("/signup", {
        state: { error: "Google authentication failed. Please try again." },
      });
    }
  }, [token, navigate, searchParams]);

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

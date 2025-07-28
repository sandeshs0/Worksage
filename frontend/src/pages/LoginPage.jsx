import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MFALoginModal from "../components/auth/MFALoginModal";
import { useUser } from "../context/UserContext";
import authService from "../services/authService";
import { useXSSProtection } from "../utils/xssHOC.jsx";
import { validateXSS } from "../utils/xssProtection";

function LoginPage() {
  // XSS Protection Hook
  const { protectInput, securityLog, hasSecurityWarnings } = useXSSProtection({
    enableValidation: true,
    logAttempts: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  
  // MFA state
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [mfaUserData, setMfaUserData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, user, refreshUserData } =
    useUser();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user?.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Sanitize input for XSS protection
    const sanitizedValue = protectInput(value, name);

    // Validate for potential XSS attempts
    const validation = validateXSS(value);
    if (!validation.isValid) {
      console.warn(`XSS attempt detected in ${name}:`, validation.threats);
    }

    setFormData({
      ...formData,
      [name]: sanitizedValue,
    });

    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() && !isRateLimited) {
      try {
        setIsSubmitting(true);
        setApiError("");

        // Attempt login using UserContext
        const response = await login({
          email: formData.email,
          password: formData.password,
        });

        // Check if MFA is required
        if (response && response.requiresMFA) {
          setMfaUserData(response);
          setShowMFAModal(true);
          return;
        }

        // Regular login successful - refresh user data to ensure context is up-to-date
        await refreshUserData();

        // Use the latest user context for redirect
        const updatedUser = authService.getCurrentUser();
        if (updatedUser?.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Login error:", error);

        // Handle different error types
        if (error.response?.status === 429) {
          // Rate limit error
          const retryAfter = error.response?.data?.retryAfter;
          const errorMessage =
            error.response?.data?.error || "Too many requests from this IP";

          setIsRateLimited(true);

          if (retryAfter) {
            const currentTime = Math.floor(Date.now() / 1000);
            const waitTime = retryAfter - currentTime;
            setRetryCountdown(Math.max(waitTime, 0));

            const minutes = Math.ceil(waitTime / 60);
            setApiError(`${errorMessage} Try again in ${minutes} minutes.`);
          } else {
            setApiError(errorMessage);
            setRetryCountdown(900); // Default to 15 minutes
          }
        } else if (error.response?.status === 400) {
          // Invalid credentials
          const errorMessage =
            error.response?.data?.msg || error.response?.data?.message;
          if (errorMessage === "Invalid credentials") {
            setApiError(
              "Invalid email or password. Please check your credentials and try again."
            );
          } else {
            setApiError(
              errorMessage || "Login failed. Please check your credentials."
            );
          }
        } else if (error.response?.status >= 500) {
          // Server errors
          setApiError("Server error occurred. Please try again later.");
        } else {
          // Other errors
          setApiError(
            error.response?.data?.message ||
              error.response?.data?.msg ||
              "Login failed. Please check your credentials."
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleMFAComplete = async (loginData) => {
    try {
      // Update UserContext with the successful login
      await refreshUserData();
      
      // Navigate based on user role
      const user = loginData.user;
      if (user?.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      
      setShowMFAModal(false);
      setMfaUserData(null);
    } catch (error) {
      console.error("Error completing MFA login:", error);
      setApiError("Login completed but failed to load user data");
    }
  };

  const handleMFACancel = () => {
    setShowMFAModal(false);
    setMfaUserData(null);
    setApiError("");
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = authService.getGoogleLoginUrl();
  };

  useEffect(() => {
    // Check for error message from redirect
    if (location.state?.error) {
      setApiError(location.state.error);
    }

    // Clear API error when form data changes
    if (apiError && (formData.email || formData.password)) {
      setApiError("");
    }
  }, [formData, location.state]);

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (retryCountdown > 0) {
      interval = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            setApiError("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [retryCountdown]);

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const formVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row-reverse font-sans"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      {/* Right side - Form */}
      <motion.div
        className="w-full md:flex-1 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 bg-white py-8 md:py-0"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <motion.div
            className="flex items-center mb-8 md:mb-12 justify-center md:justify-start"
            variants={formItemVariants}
          >
            <div className="w-18 h-18 rounded-lg flex items-center justify-center mr-3">
              <img
                src="src/assets/logo.png"
                alt="Cubicle Logo"
                className="w-10 h-10 md:w-14 md:h-14"
              />
            </div>
            <span className="text-xl md:text-2xl font-semibold text-gray-900">
              Cubicle
            </span>
          </motion.div>

          {/* Form */}
          <div>
            <motion.h1
              className="text-2xl md:text-3xl text-center font-bold text-gray-900 mb-6 md:mb-8"
              variants={formItemVariants}
            >
              Login
            </motion.h1>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {/* Email */}
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="email"
                  className="block text-md font-medium text-gray-700 mb-1 md:mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                  className={`w-full px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={formItemVariants}>
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <label
                    htmlFor="password"
                    className="block text-md font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#007991] hover:text-[#005f73]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors pr-12 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </motion.div>

              {/* Remember Me */}
              <motion.div
                className="flex items-center"
                variants={formItemVariants}
              >
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-[#007991] focus:ring-[#007991] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </motion.div>

              {/* Login Button */}
              <motion.button
                type="submit"
                className={`w-full py-2.5 md:py-3 px-4 rounded-full font-bold transition-colors duration-200 mt-6 md:mt-8 ${
                  isRateLimited
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#007991] text-white hover:bg-[#005f73]"
                }`}
                variants={formItemVariants}
                whileTap={!isRateLimited ? { scale: 0.97 } : {}}
                whileHover={
                  !isRateLimited
                    ? {
                        backgroundColor: "#0f766e",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }
                    : {}
                }
                disabled={isSubmitting || isRateLimited}
              >
                {isRateLimited
                  ? `Try again in ${Math.floor(retryCountdown / 60)}:${(
                      retryCountdown % 60
                    )
                      .toString()
                      .padStart(2, "0")}`
                  : isSubmitting
                  ? "Logging in..."
                  : "Login"}
              </motion.button>

              {apiError && (
                <motion.div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                  variants={formItemVariants}
                >
                  {apiError}
                </motion.div>
              )}
            </form>

            {/* Sign Up Link */}
            <motion.p
              className="mt-6 text-center text-gray-600"
              variants={formItemVariants}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#007991] hover:text-[#005f73] font-medium"
              >
                Sign up
              </Link>
            </motion.p>

            {/* Google login button */}
            <motion.div className="mt-6" variants={formItemVariants}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <motion.a
                onClick={handleGoogleLogin}
                className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                variants={formItemVariants}
                whileHover={{ backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24px"
                  height="24px"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                Sign in with Google
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Left side - Hero Section (hidden on small screens) */}
      <motion.div
        className="hidden md:flex flex-1 bg-[#222E50] flex-col text-center justify-center items-center p-8 text-white m-4 rounded-xl"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-lg">
          {/* 3D Character Illustration */}
          <motion.img
            src="src/assets/login-illus.png"
            alt="Hero Illustration"
            className="w-full h-auto mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </div>
        {/* Text content */}
        <motion.h2
          className="text-3xl lg:text-4xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Unleash Your Productivity!
        </motion.h2>
        <motion.p
          className="text-lg lg:text-xl indigo-200"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          The Ultimate CRM and Project Management tool.
        </motion.p>
      </motion.div>

      {/* MFA Login Modal */}
      <MFALoginModal
        isOpen={showMFAModal}
        onClose={handleMFACancel}
        onComplete={handleMFAComplete}
        userData={mfaUserData}
      />
    </motion.div>
  );
}

export default LoginPage;

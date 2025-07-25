import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const evaluatePasswordStrength = (password) => {
    if (!password) {
      return {
        score: 0,
        message: "",
        color: "",
        requirements: getPasswordRequirements(),
      };
    }

    let score = 0;
    const requirements = getPasswordRequirements();

    // Length checks (enhanced)
    if (password.length >= 12) {
      score += 2;
      requirements.length.met = true;
    } else if (password.length >= 8) {
      score += 1;
    }

    // Complexity checks
    if (/[A-Z]/.test(password)) {
      score += 1;
      requirements.uppercase.met = true;
    }
    if (/[a-z]/.test(password)) {
      score += 1;
      requirements.lowercase.met = true;
    }
    if (/[0-9]/.test(password)) {
      score += 1;
      requirements.number.met = true;
    }
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 2;
      requirements.special.met = true;
    }

    // Bonus for character variety
    if (
      requirements.uppercase.met &&
      requirements.lowercase.met &&
      requirements.number.met &&
      requirements.special.met
    ) {
      score += 1;
    }

    // Common password check (basic patterns)
    const commonPatterns = ["password", "123456", "qwerty", "admin", "abc123"];
    if (
      commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))
    ) {
      score -= 2;
      requirements.noCommon.met = false;
    } else {
      requirements.noCommon.met = true;
    }

    // Sequential patterns penalty
    if (/123|abc|qwe/i.test(password) || /(.)\1{2,}/.test(password)) {
      score -= 1;
    }

    // Personal info check (basic)
    const name = formData.fullName.toLowerCase();
    const email = formData.email.toLowerCase().split("@")[0];
    if (
      (name && password.toLowerCase().includes(name)) ||
      (email && email.length > 2 && password.toLowerCase().includes(email))
    ) {
      score -= 1;
      requirements.noPersonal.met = false;
    } else {
      requirements.noPersonal.met = true;
    }

    let message = "";
    let color = "";

    if (score <= 1) {
      message = "Very weak";
      color = "bg-red-600";
    } else if (score <= 3) {
      message = "Weak";
      color = "bg-red-500";
    } else if (score <= 5) {
      message = "Medium";
      color = "bg-yellow-500";
    } else if (score <= 7) {
      message = "Strong";
      color = "bg-green-500";
    } else {
      message = "Very strong";
      color = "bg-green-600";
    }

    return { score, message, color, requirements };
  };

  const getPasswordRequirements = () => ({
    length: { text: "At least 12 characters", met: false },
    uppercase: { text: "At least one uppercase letter (A-Z)", met: false },
    lowercase: { text: "At least one lowercase letter (a-z)", met: false },
    number: { text: "At least one number (0-9)", met: false },
    special: { text: "At least one special character (!@#$%^&*)", met: false },
    noCommon: { text: "Not a common password", met: false },
    noPersonal: { text: "Does not contain personal information", met: false },
  });

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(evaluatePasswordStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
      isValid = false;
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password with enhanced requirements
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else {
      const passwordValidation = evaluatePasswordStrength(formData.password);

      // Check minimum requirements
      const requirements = passwordValidation.requirements;
      const unmetRequirements = Object.values(requirements).filter(
        (req) => !req.met
      );

      if (formData.password.length < 12) {
        newErrors.password = "Password must be at least 12 characters";
        isValid = false;
      } else if (unmetRequirements.length > 0) {
        newErrors.password = "Password does not meet all security requirements";
        isValid = false;
      } else if (passwordValidation.score < 5) {
        newErrors.password =
          "Password is too weak. Please create a stronger password";
        isValid = false;
      }
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setApiError("");

        await authService.register({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        });

        // Navigate to OTP verification with email context
        navigate("/verify", { state: { email: formData.email } });
      } catch (error) {
        console.error("Registration error:", error);
        setApiError(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
      transition: {
        duration: 0.25,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
      },
    },
  };

  const formVariants = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
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
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    // Clear API error when form data changes
    if (apiError) {
      setApiError("");
    }
  }, [formData]);

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row font-sans"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      {/* Left side - Form */}
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
              className="text-2xl md:text-3xl text-center font-semibold text-gray-900 mb-6 md:mb-8"
              variants={formItemVariants}
            >
              Create an Account
            </motion.h1>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {/* Full Name */}
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="fullName"
                  className="block text-md font-medium text-gray-700 mb-1 md:mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter Your Full Name"
                  className={`w-full px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </motion.div>

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
                <label
                  htmlFor="password"
                  className="block text-md font-medium text-gray-700 mb-1 md:mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Choose a Strong Password"
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

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${passwordStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(passwordStrength.score / 8) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </div>
                      <span className="text-md text-gray-600">
                        {passwordStrength.message}
                      </span>
                    </div>

                    {/* Password requirements checklist */}
                    {passwordStrength.requirements && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Password Requirements:
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {Object.entries(passwordStrength.requirements).map(
                            ([key, req]) => (
                              <div
                                key={key}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    req.met ? "bg-green-500" : "bg-gray-300"
                                  }`}
                                >
                                  {req.met && (
                                    <svg
                                      className="w-2.5 h-2.5 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={`text-sm ${
                                    req.met ? "text-green-600" : "text-gray-600"
                                  }`}
                                >
                                  {req.text}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="confirmPassword"
                  className="block text-md font-medium text-gray-700 mb-1 md:mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter the password"
                    className={`w-full px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors pr-12 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </motion.div>

              {/* Error message from API */}
              {apiError && (
                <motion.div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                  variants={formItemVariants}
                >
                  {apiError}
                </motion.div>
              )}

              {/* Register Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#007991] text-white py-2.5 md:py-3 px-4 rounded-full font-bold hover:bg-[#005f73] transition-colors duration-200 mt-6 md:mt-8"
                variants={formItemVariants}
                whileTap={{ scale: 0.97 }}
                whileHover={{
                  backgroundColor: "#0f766e",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                {isSubmitting ? "Creating Account..." : "Register"}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <motion.p
              className="mt-2 text-center text-gray-600"
              variants={formItemVariants}
            >
              Already Have an Account?{" "}
              <Link
                to="/login"
                className="text-[#007991] hover:text-[#005f73] font-medium"
              >
                Sign in
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Right side - Hero Section (hidden on small screens) */}
      <motion.div
        className="hidden md:flex flex-1 bg-[#222E50] flex-col justify-center items-center text-white relative overflow-hidden m-4 rounded-xl"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main illustration area */}
        <div className="relative z-10 max-w-lg">
          {/* 3D Character Illustration */}
          <motion.img
            src="src/assets/hero.png"
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
          Your Freelancing Buddy!
        </motion.h2>
        <motion.p
          className="text-lg lg:text-xl text-indigo-200"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          The Ultimate CRM and Project Management tool.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default SignupPage;

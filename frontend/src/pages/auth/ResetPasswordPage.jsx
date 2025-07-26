import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import authService from "../../services/authService";
import { checkPasswordStrength, handleAuthError } from "../../utils/authUtils";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/login");
    }
  }, [token, navigate]);

  const validatePassword = (password) => {
    return checkPasswordStrength(password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const { password, confirmPassword } = formData;

    // Validation
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    if (!confirmPassword) {
      setErrors({ confirmPassword: "Please confirm your password" });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors({
        password: "Password does not meet security requirements",
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(token, password);

      if (response.success) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Reset password error:", error);

      const errorResponse = handleAuthError(error, "reset password");

      if (error.message?.includes("Invalid or expired token")) {
        setErrors({
          general:
            "This reset link has expired or is invalid. Please request a new one.",
        });
        toast.error("Reset link has expired");
      } else {
        setErrors({
          general: errorResponse.general,
          password: errorResponse.field,
        });
        toast.error(errorResponse.toast);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>

            <Link
              to="/login"
              className="inline-block w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below. Make sure it meets all security
            requirements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">
                {errors.general}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors pr-12 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errors.password}</p>
              </div>
            )}

            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Password must contain:
                </p>
                <div className="space-y-1">
                  <div
                    className={`flex items-center text-xs ${
                      passwordValidation.minLength
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        passwordValidation.minLength
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center text-xs ${
                      passwordValidation.hasUpperCase
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        passwordValidation.hasUpperCase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    One uppercase letter (A-Z)
                  </div>
                  <div
                    className={`flex items-center text-xs ${
                      passwordValidation.hasLowerCase
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        passwordValidation.hasLowerCase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    One lowercase letter (a-z)
                  </div>
                  <div
                    className={`flex items-center text-xs ${
                      passwordValidation.hasNumbers
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        passwordValidation.hasNumbers
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    One number (0-9)
                  </div>
                  <div
                    className={`flex items-center text-xs ${
                      passwordValidation.hasSpecialChar
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        passwordValidation.hasSpecialChar
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    One special character (!@#$%^&*)
                  </div>
                  <div
                    className={`flex items-center text-xs ${
                      passwordValidation.notCommon
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        passwordValidation.notCommon
                          ? "bg-green-500"
                          : "bg-red-300"
                      }`}
                    ></div>
                    Not a common password
                  </div>
                </div>

                {/* Password strength indicator */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Strength:</span>
                    <span
                      className={`font-medium ${
                        passwordValidation.score >= 6
                          ? "text-green-600"
                          : passwordValidation.score >= 4
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordValidation.score >= 6
                        ? "Strong"
                        : passwordValidation.score >= 4
                        ? "Medium"
                        : "Weak"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordValidation.score >= 6
                          ? "bg-green-500"
                          : passwordValidation.score >= 4
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(passwordValidation.score / 6) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors pr-12 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
          </div>

          <button
            type="submit"
            disabled={isLoading || !passwordValidation.isValid}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resetting Password...
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;

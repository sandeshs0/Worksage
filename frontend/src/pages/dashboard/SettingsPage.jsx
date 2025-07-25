import {
  AlertCircle,
  Camera,
  ChevronRight,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
  Moon,
  Save,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import EmailAccountModal from "../../components/settings/EmailAccountModal";
import MFASettings from "../../components/settings/MFASettings";
import ProfilePictureModal from "../../components/settings/ProfilePictureModal";
import { useUser } from "../../context/UserContext";
import authService from "../../services/authService";
import planService from "../../services/planService";
import settingsService from "../../services/settingsService";

function SettingsPage() {
  const { user, isLoading: userLoading, refreshUserData } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // User data state - now populated from context
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    company: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile picture modal state
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);

  // Email accounts state
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);

  // Plans and payment state
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [upgradeHistory, setUpgradeHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [newEmailAccount, setNewEmailAccount] = useState({
    email: "",
    displayName: "",
    smtp: {
      host: "",
      port: 587,
      secure: false,
    },
    auth: {
      user: "",
      pass: "",
    },
  });
  const [emailFormErrors, setEmailFormErrors] = useState({});

  // Update local state when user data changes in the context
  useEffect(() => {
    if (user) {
      setUserData({
        fullName: user.fullName || "User",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        company: user.company || "",
      });

      setFormData({
        fullName: user.fullName || "User",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        company: user.company || "",
      });

      // Set profile image if available
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      }

      // Set dark mode preference if available
      if (user.preferences && user.preferences.darkMode !== undefined) {
        setDarkMode(user.preferences.darkMode);
      }
    }
  }, [user]);

  // Fetch email accounts from the server
  const fetchEmailAccounts = async () => {
    try {
      setIsLoadingEmails(true);
      const accounts = await settingsService.getEmailAccounts();
      console.log("API response for email accounts:", accounts);

      // If accounts is an object with a data property
      if (accounts && accounts.data) {
        setEmailAccounts(accounts.data);
      }
      // If accounts is directly the array
      else if (Array.isArray(accounts)) {
        setEmailAccounts(accounts);
      }
      // If accounts is not an array, set empty array
      else {
        setEmailAccounts([]);
      }
    } catch (error) {
      console.error("Failed to fetch email accounts:", error);
      toast.error("Failed to load email accounts", {
        description: error.message || "Please try again later",
      });
      setEmailAccounts([]);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Load email accounts when the component mounts or when activeTab changes
  useEffect(() => {
    if (activeTab === "email") {
      fetchEmailAccounts();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update the handleSubmit function to match the API format
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      setIsLoading(true);
      // Call API to update user profile with the expected format
      await authService.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        role: formData.role,
      });

      setUserData(formData);
      setIsEditing(false);

      // Refresh user data in the context
      await refreshUserData();

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        // Preview image locally
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);

      try {
        // Upload image to server
        setIsLoading(true);
        const formData = new FormData();
        formData.append("profileImage", file);
        await settingsService.uploadAvatar(formData);

        // Refresh user data in the context so all components get updated
        await refreshUserData();
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    try {
      // Save preference to server
      // TODO: Implement user preferences endpoint
      // await authService.updateUserPreferences({ darkMode: newDarkMode });
      toast.success(`${newDarkMode ? "Dark" : "Light"} mode enabled`);
    } catch (error) {
      console.error("Error updating dark mode preference:", error);
      toast.error("Failed to update theme preference");
      // Revert the state if API call fails
      setDarkMode(!newDarkMode);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!userData.fullName) return "U";
    return userData.fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get plan badge styles and text
  const getPlanBadge = (plan = "free") => {
    switch (plan.toLowerCase()) {
      case "pro":
        return {
          text: "Pro",
          bgColor: "bg-indigo-600",
          textColor: "text-white",
        };
      case "vantage":
        return {
          text: "Vantage",
          bgColor: "bg-purple-600",
          textColor: "text-white",
        };
      case "free":
      default:
        return {
          text: "Free Plan",
          bgColor: "bg-gray-200",
          textColor: "text-gray-700",
        };
    }
  };

  // Enhanced password validation
  const validatePassword = (password) => {
    const errors = {};

    if (password.length < 12) {
      errors.length = "Password must be at least 12 characters long";
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.lowercase = "Password must contain at least one lowercase letter";
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.uppercase = "Password must contain at least one uppercase letter";
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.number = "Password must contain at least one number";
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.special =
        "Password must contain at least one special character (@$!%*?&)";
    }

    // Check for common weak patterns
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123456|abcdef|qwerty/i, // Common sequences
      /password|admin|user/i, // Common words
    ];

    if (commonPatterns.some((pattern) => pattern.test(password))) {
      errors.pattern = "Password contains common patterns and is too weak";
    }

    return errors;
  };

  // Enhanced password submit handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    // Basic input validation
    if (!passwordData.currentPassword) {
      setPasswordErrors({ currentPassword: "Current password is required" });
      setPasswordLoading(false);
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordErrors({ general: "New password is required" });
      setPasswordLoading(false);
      return;
    }

    if (!passwordData.confirmPassword) {
      setPasswordErrors({ confirm: "Password confirmation is required" });
      setPasswordLoading(false);
      return;
    }

    // Validate new password complexity
    const passwordValidationErrors = validatePassword(passwordData.newPassword);
    if (Object.keys(passwordValidationErrors).length > 0) {
      setPasswordErrors(passwordValidationErrors);
      setPasswordLoading(false);
      return;
    }

    // Check password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirm: "Passwords do not match" });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Hide password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      // Refresh user data to get new password expiry date
      await refreshUserData();

      toast.success(
        "Password updated successfully! Your new password will expire in 90 days."
      );
    } catch (error) {
      console.error("Password update error:", error);

      // Handle specific error cases
      if (error.code === "PASSWORD_REUSED") {
        setPasswordErrors({
          general:
            "Cannot reuse your current password or any of your last 5 passwords",
        });
      } else if (error.errors) {
        // Handle validation errors from backend
        const errorMap = {};
        error.errors.forEach((err) => {
          errorMap[err.field || "general"] = err.message;
        });
        setPasswordErrors(errorMap);
      } else if (error.response?.data?.message) {
        setPasswordErrors({
          general: error.response.data.message,
        });
      } else {
        setPasswordErrors({
          general: error.message || "Failed to update password",
        });
      }

      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle password input changes with real-time validation
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear previous errors for this field
    setPasswordErrors((prev) => {
      const newErrors = { ...prev };
      if (name === "currentPassword") {
        delete newErrors.currentPassword;
      }
      if (name === "newPassword") {
        // Clear all password complexity errors
        delete newErrors.length;
        delete newErrors.lowercase;
        delete newErrors.uppercase;
        delete newErrors.number;
        delete newErrors.special;
        delete newErrors.pattern;
      }
      if (name === "confirmPassword") {
        delete newErrors.confirm;
      }
      return newErrors;
    });

    // Real-time validation for new password
    if (name === "newPassword" && value) {
      const validationErrors = validatePassword(value);
      if (Object.keys(validationErrors).length > 0) {
        setPasswordErrors((prev) => ({ ...prev, ...validationErrors }));
      }
    }

    // Real-time validation for password confirmation
    if (name === "confirmPassword" && value && passwordData.newPassword) {
      if (value !== passwordData.newPassword) {
        setPasswordErrors((prev) => ({
          ...prev,
          confirm: "Passwords do not match",
        }));
      }
    }
  };

  // Handle profile picture upload from the modal
  const handleProfilePictureUpload = async (imageBlob) => {
    try {
      setIsLoading(true);
      const result = await settingsService.uploadAvatar(imageBlob);

      if (result.profileImage) {
        setProfileImage(result.profileImage);
      }

      // Refresh user data in the context so all components get updated
      await refreshUserData();

      toast.success("Profile picture updated successfully");
      return result;
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      toast.error("Failed to update profile picture", {
        description: error.message || "Please try again",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle input changes for the email account form
  const handleEmailInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNewEmailAccount((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setNewEmailAccount((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear errors when user types
    if (emailFormErrors[name]) {
      setEmailFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Add this function to set an email account as default
  const handleSetDefaultEmail = async (id) => {
    try {
      setIsLoading(true);
      await settingsService.setDefaultEmailAccount(id);
      toast.success("Default email account updated");
      fetchEmailAccounts();
    } catch (error) {
      console.error("Failed to set default email:", error);
      toast.error("Failed to update default email", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to delete an email account
  const handleDeleteEmailAccount = async (id) => {
    if (!confirm("Are you sure you want to delete this email account?")) return;

    try {
      setIsLoading(true);
      await settingsService.deleteEmailAccount(id);
      toast.success("Email account removed successfully");
      fetchEmailAccounts();
    } catch (error) {
      console.error("Failed to delete email account:", error);
      toast.error("Failed to remove email account", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Plan and payment functions
  const fetchPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const data = await planService.getPlans();
      setPlans(data.plans || []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Failed to load plans");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const fetchUpgradeHistory = async () => {
    try {
      console.log("🔄 Fetching upgrade history...");
      setIsLoadingHistory(true);
      const data = await planService.getPlanUpgradeHistory();
      console.log("📋 Upgrade history response:", data);
      setUpgradeHistory(data.upgrades || []);
      console.log("✅ Upgrade history set:", data.upgrades || []);
    } catch (error) {
      console.error("❌ Failed to fetch upgrade history:", error);
      toast.error("Failed to load upgrade history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePlanUpgrade = async (planType) => {
    try {
      setPaymentLoading(true);
      const response = await planService.initiatePlanUpgrade(planType);

      if (response.success && response.khaltiPayment?.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = response.khaltiPayment.payment_url;
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Plan upgrade failed:", error);
      toast.error("Failed to initiate plan upgrade", {
        description: error.message || "Please try again",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Load plans when billing tab is active
  useEffect(() => {
    if (activeTab === "billing" || activeTab === "plans") {
      console.log("📋 Active tab changed to billing/plans, fetching data...");
      fetchPlans();
      fetchUpgradeHistory();
    }
  }, [activeTab]);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (
      tabParam &&
      ["profile", "email", "password", "security", "billing", "plans"].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam);
    }
  }, []);

  // Update loading state to consider both local loading and context loading
  const isPageLoading = isLoading || userLoading;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[80vh]">
      <h2 className="text-xl font-medium mb-4">Settings</h2>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <button
              className={`flex items-center w-full px-4 py-3 text-left rounded-md ${
                activeTab === "profile"
                  ? "bg-[#18cb96] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} className="mr-3" />
              <span>Profile</span>
              <ChevronRight size={18} className="ml-auto" />
            </button>

            <button
              className={`flex items-center w-full px-4 py-3 text-left rounded-md ${
                activeTab === "email"
                  ? "bg-[#18cb96] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("email")}
            >
              <Mail size={18} className="mr-3" />
              <span>Email Configuration</span>
              <ChevronRight size={18} className="ml-auto" />
            </button>

            <button
              className={`flex items-center w-full px-4 py-3 text-left rounded-md ${
                activeTab === "password"
                  ? "bg-[#18cb96] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("password")}
            >
              <Lock size={18} className="mr-3" />
              <span>Change Password</span>
              <ChevronRight size={18} className="ml-auto" />
            </button>

            <button
              className={`flex items-center w-full px-4 py-3 text-left rounded-md ${
                activeTab === "security"
                  ? "bg-[#18cb96] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={18} className="mr-3" />
              <span>Two-Factor Authentication</span>
              <ChevronRight size={18} className="ml-auto" />
            </button>

            {/* <button
              className={`flex items-center w-full px-4 py-3 text-left rounded-md ${
                activeTab === "preferences"
                  ? "bg-[#18cb96] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <SettingsIcon size={18} className="mr-3" />
              <span>Preferences</span>
              <ChevronRight size={18} className="ml-auto" />
            </button> */}

            <button
              className={`flex items-center w-full px-4 py-3 text-left rounded-md ${
                activeTab === "plans"
                  ? "bg-[#18cb96] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("plans")}
            >
              <CreditCard size={18} className="mr-3" />
              <span>Plans & Billing</span>
              <ChevronRight size={18} className="ml-auto" />
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium">Profile Settings</h3>
                <button
                  onClick={() =>
                    isEditing ? handleSubmit() : setIsEditing(true)
                  }
                  className="flex items-center px-4 py-2 bg-[#18cb96] text-white rounded-md hover:bg-[#14a085]"
                  disabled={isPageLoading}
                >
                  {isPageLoading ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                    {isPageLoading ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    ) : profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, remove the src to trigger the fallback
                          e.target.onerror = null;
                          e.target.src = "";
                          // Force a re-render to show the initials
                          setProfileImage(null);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#18172a] text-white flex items-center justify-center text-2xl font-medium">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-[#18cb96] text-white p-2 rounded-full cursor-pointer hover:bg-[#14a085] transition-colors"
                    disabled={isPageLoading}
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div className="flex-1">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        {isPageLoading ? (
                          <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
                        ) : (
                          <input
                            type="text"
                            name="fullName"
                            value={
                              isEditing ? formData.fullName : userData.fullName
                            }
                            onChange={handleChange}
                            disabled={!isEditing || isPageLoading}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#18cb96] focus:border-[#18cb96] disabled:bg-gray-50"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        {isPageLoading ? (
                          <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
                        ) : (
                          <input
                            type="email"
                            name="email"
                            value={isEditing ? formData.email : userData.email}
                            onChange={handleChange}
                            disabled={true}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#18cb96] focus:border-[#18cb96] disabled:bg-gray-50"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        {isPageLoading ? (
                          <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
                        ) : (
                          <input
                            type="text"
                            name="role"
                            value={isEditing ? formData.role : userData.role}
                            onChange={handleChange}
                            disabled={!isEditing || isPageLoading}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#18cb96] focus:border-[#18cb96] disabled:bg-gray-50"
                          />
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Email Configuration */}
          {activeTab === "email" && (
            <div>
              <h3 className="text-xl font-medium mb-6">Email Configuration</h3>

              <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mb-6">
                <div className="flex items-start">
                  <AlertCircle
                    size={20}
                    className="text-blue-500 mt-0.5 mr-2"
                  />
                  <p className="text-sm text-gray-600">
                    Configure your sender email address to send communications
                    from WorkSage directly through your own email account.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Primary Email */}
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Primary Email
                      </h4>
                      {isPageLoading ? (
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mt-1"></div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {userData.email}
                        </p>
                      )}
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified
                    </div>
                  </div>
                </div>

                {/* Email Accounts */}
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Sender Emails
                      </h4>
                      <p className="text-sm text-gray-500">
                        Add email accounts to send communications from
                      </p>
                    </div>
                    <button
                      className="bg-[#18cb96] text-white px-4 py-2 rounded-md text-sm hover:bg-[#14a085]"
                      onClick={() => setShowAddEmailModal(true)}
                    >
                      Add Email
                    </button>
                  </div>

                  {isLoadingEmails ? (
                    <div className="flex justify-center py-8">
                      <Loader className="animate-spin text-gray-400" />
                    </div>
                  ) : !emailAccounts ||
                    !Array.isArray(emailAccounts) ||
                    emailAccounts.length === 0 ? (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
                      <p className="text-blue-800">
                        You haven't added any sender email accounts yet. Emails
                        will be sent from comm@cubicle.app.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emailAccounts.map((account) => (
                        <div
                          key={account._id}
                          className="border border-gray-200 rounded-md p-3 flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">
                                {account.displayName}
                              </p>
                              {account.isDefault && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                              {!account.verified && (
                                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                                  Unverified
                                </span>
                              )}
                              {account.verified && (
                                <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {account.email}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {!account.isDefault && account.isVerified && (
                              <button
                                onClick={() =>
                                  handleSetDefaultEmail(account._id)
                                }
                                className="text-gray-600 hover:text-[#18cb96] text-sm"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteEmailAccount(account._id)
                              }
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Account Modal */}
              <EmailAccountModal
                isOpen={showAddEmailModal}
                onClose={() => setShowAddEmailModal(false)}
                onSuccess={fetchEmailAccounts} // Pass fetchEmailAccounts as the success callback
              />
            </div>
          )}

          {/* Password Settings */}
          {activeTab === "password" && (
            <div>
              <h3 className="text-xl font-medium mb-6">Change Password</h3>

              {/* Password Security Info */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-6">
                <div className="flex items-start">
                  <AlertCircle
                    size={20}
                    className="text-blue-500 mt-0.5 mr-2"
                  />
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Password Security Policy
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• Passwords expire every 90 days</li>
                      <li>• Cannot reuse your last 5 passwords</li>
                      <li>• Must be at least 12 characters long</li>
                      <li>
                        • Must contain uppercase, lowercase, numbers, and
                        special characters
                      </li>
                    </ul>
                    {user?.passwordExpiresAt && (
                      <p className="text-xs mt-2">
                        <strong>Current password expires:</strong>{" "}
                        {new Date(user.passwordExpiresAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-6 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Password changed successfully! Your new password will expire
                  in 90 days.
                </div>
              )}

              {passwordErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-6 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {passwordErrors.general}
                </div>
              )}

              <form className="max-w-lg" onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full p-2 pr-10 border ${
                          passwordErrors.currentPassword
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md focus:ring-[#18cb96] focus:border-[#18cb96]`}
                        placeholder="Enter your current password"
                        disabled={passwordLoading}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full p-2 pr-10 border ${
                          Object.keys(passwordErrors).some(
                            (key) =>
                              key !== "general" &&
                              key !== "confirm" &&
                              key !== "currentPassword"
                          )
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md focus:ring-[#18cb96] focus:border-[#18cb96]`}
                        placeholder="Enter new password"
                        disabled={passwordLoading}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Password Requirements and Validation */}
                    {Object.keys(passwordErrors).length > 0 &&
                    Object.keys(passwordErrors).some(
                      (key) =>
                        key !== "general" &&
                        key !== "confirm" &&
                        key !== "currentPassword"
                    ) ? (
                      <div className="text-red-500 text-xs mt-1 space-y-1">
                        <p className="font-medium">
                          Password requirements not met:
                        </p>
                        {Object.entries(passwordErrors).map(
                          ([key, error]) =>
                            key !== "general" &&
                            key !== "confirm" &&
                            key !== "currentPassword" && (
                              <p key={key}>• {error}</p>
                            )
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <p className="font-medium">
                          Password must meet the following requirements:
                        </p>
                        <p>• At least 12 characters long</p>
                        <p>• Include uppercase and lowercase letters</p>
                        <p>
                          • Include numbers and special characters (@$!%*?&)
                        </p>
                        <p>• Cannot reuse your last 5 passwords</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full p-2 pr-10 border ${
                          passwordErrors.confirm
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md focus:ring-[#18cb96] focus:border-[#18cb96]`}
                        placeholder="Confirm new password"
                        disabled={passwordLoading}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirm && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.confirm}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full bg-[#18cb96] text-white p-2 rounded-md hover:bg-[#14a085] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <Loader size={16} className="mr-2 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Security (MFA) Settings */}
          {activeTab === "security" && (
            <div>
              <h3 className="text-xl font-medium mb-6">Security Settings</h3>
              <MFASettings />
            </div>
          )}

          {/* App Preferences */}
          {activeTab === "preferences" && (
            <div>
              <h3 className="text-xl font-medium mb-6">App Preferences</h3>

              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div>
                    <h4 className="font-medium text-gray-800">Dark Mode</h4>
                    <p className="text-sm text-gray-500">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative p-2 rounded-full ${
                      darkMode ? "bg-gray-800" : "bg-[#18cb96]"
                    }`}
                  >
                    {darkMode ? (
                      <Moon size={20} className="text-yellow-300" />
                    ) : (
                      <Sun size={20} className="text-yellow-300" />
                    )}
                  </button>
                </div>

                {/* Language Preference */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div>
                    <h4 className="font-medium text-gray-800">Language</h4>
                    <p className="text-sm text-gray-500">
                      Select your preferred language
                    </p>
                  </div>
                  <select className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-[#18cb96] focus:border-[#18cb96]">
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                {/* Time Zone */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div>
                    <h4 className="font-medium text-gray-800">Time Zone</h4>
                    <p className="text-sm text-gray-500">
                      Set your local time zone
                    </p>
                  </div>
                  <select className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-[#18cb96] focus:border-[#18cb96]">
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (US & Canada)</option>
                    <option value="CST">Central Time (US & Canada)</option>
                    <option value="PST">Pacific Time (US & Canada)</option>
                    <option value="IST">India Standard Time</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Billing & Plans */}
          {activeTab === "plans" && (
            <div>
              <h3 className="text-xl font-medium mb-6">Plans & Billing</h3>

              {/* Current Plan */}
              <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">Current Plan</h4>
                    {isPageLoading ? (
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#18cb96]">
                          {userData.plan === "pro"
                            ? "Pro Plan"
                            : userData.plan === "vantage"
                            ? "Vantage Plan"
                            : "Free Plan"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {userData.plan === "free"
                            ? "Your plan includes basic features with limits"
                            : "Your plan includes premium features"}
                        </p>
                      </>
                    )}
                  </div>
                  <div>
                    {isPageLoading ? (
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    ) : (
                      <span
                        className={`text-xs font-medium ${
                          getPlanBadge(userData.plan).bgColor
                        } ${
                          getPlanBadge(userData.plan).textColor
                        } px-2 py-1 rounded-full`}
                      >
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Plans */}
              <h4 className="font-medium text-gray-700 mb-4">
                Available Plans
              </h4>

              {isLoadingPlans ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4 animate-pulse"
                    >
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded mb-3"></div>
                      <div className="space-y-2 mb-4">
                        {[1, 2, 3, 4].map((j) => (
                          <div
                            key={j}
                            className="h-4 bg-gray-200 rounded"
                          ></div>
                        ))}
                      </div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Free Plan */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-800">Free</h5>
                      {user?.plan === "free" && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl font-bold">Rs. 0</span>
                      <span className="text-gray-500">/month</span>
                    </div>

                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Up to 3 projects
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Basic email features
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        5 GB storage
                      </li>
                    </ul>

                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 cursor-not-allowed p-2 rounded-md"
                    >
                      {user?.plan === "free"
                        ? "Current Plan"
                        : "Downgrade Not Available"}
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div
                    className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow relative ${
                      user?.plan === "pro"
                        ? "border-green-500"
                        : "border-[#18cb96]"
                    }`}
                  >
                    {user?.plan !== "pro" && (
                      <div className="absolute -top-3 -right-3 bg-[#18cb96] text-white text-xs px-2 py-1 rounded-md">
                        Popular
                      </div>
                    )}
                    {user?.plan === "pro" && (
                      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                        Current
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-800">Pro</h5>
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl font-bold">Rs. 3,000</span>
                      <span className="text-gray-500">/month</span>
                    </div>

                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Unlimited projects
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Advanced email features
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        50 GB storage
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        AI assistant features
                      </li>
                    </ul>

                    {user?.plan === "pro" ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed p-2 rounded-md"
                      >
                        Current Plan
                      </button>
                    ) : user?.plan === "vantage" ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed p-2 rounded-md"
                      >
                        Downgrade Not Available
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlanUpgrade("pro")}
                        disabled={paymentLoading}
                        className="w-full bg-[#18cb96] text-white p-2 rounded-md hover:bg-[#14a085] disabled:opacity-50"
                      >
                        {paymentLoading ? "Processing..." : "Upgrade to Pro"}
                      </button>
                    )}
                  </div>

                  {/* Vantage Plan */}
                  <div
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow relative ${
                      user?.plan === "vantage"
                        ? "border-2 border-green-500"
                        : "border border-gray-200"
                    }`}
                  >
                    {user?.plan === "vantage" && (
                      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                        Current
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-800">Vantage</h5>
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl font-bold">Rs. 6,000</span>
                      <span className="text-gray-500">/month</span>
                    </div>

                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Unlimited everything
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Premium support
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        500 GB storage
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Advanced analytics
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        White labeling
                      </li>
                    </ul>

                    {user?.plan === "vantage" ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed p-2 rounded-md"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlanUpgrade("vantage")}
                        disabled={paymentLoading}
                        className="w-full border border-[#18cb96] text-[#18cb96] p-2 rounded-md hover:bg-[#18cb96] hover:text-white transition-colors disabled:opacity-50"
                      >
                        {paymentLoading
                          ? "Processing..."
                          : "Upgrade to Vantage"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Upgrade History */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4">
                  Upgrade History
                </h4>
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-4 animate-pulse"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-48 mt-2"></div>
                      </div>
                    ))}
                  </div>
                ) : upgradeHistory.length > 0 ? (
                  <div className="space-y-3">
                    {upgradeHistory.map((upgrade) => (
                      <div
                        key={upgrade._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              Upgraded to{" "}
                              {upgrade.toPlan
                                ? upgrade.toPlan.charAt(0).toUpperCase() +
                                  upgrade.toPlan.slice(1)
                                : "Unknown Plan"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(upgrade.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              Rs. {(upgrade.amount / 100).toLocaleString()}
                            </p>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                upgrade.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : upgrade.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {upgrade.status
                                ? upgrade.status.charAt(0).toUpperCase() +
                                  upgrade.status.slice(1)
                                : "Unknown Status"}
                            </span>
                          </div>
                        </div>
                        {upgrade.khaltiTransactionId && (
                          <p className="text-xs text-gray-400 mt-2">
                            Transaction ID: {upgrade.khaltiTransactionId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upgrade history yet</p>
                    <p className="text-sm text-gray-400">
                      Upgrade to a paid plan to see your transaction history
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-4">
                For custom enterprise plans, please contact our sales team at{" "}
                <a href="mailto:sales@cubicle.app" className="text-[#18cb96]">
                  sales@cubicle.app
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        onSave={handleProfilePictureUpload}
      />

      {/* Add the Toaster component */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default SettingsPage;

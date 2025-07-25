import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Trello,
  UsersRound,
  Shield, // New icon for sessions
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import authService from "../services/authService";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function DashboardLayout() {
  const { user, isLoading, logout, logoutAll } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    profileImage: "",
    plan: "free",
    role: "unassigned",
    isVerified: false,
    isActive: true,
    googleId: null,
    createdAt: null,
    _id: ""
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    // Add click outside listener to close dropdowns
    const handleClickOutside = (event) => {
      const notificationArea = document.getElementById("notification-area");
      const profileArea = document.getElementById("profile-area");

      if (notificationArea && !notificationArea.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }

      if (profileArea && !profileArea.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user profile
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoadingProfile(true);
        const response = await authService.getUserProfile();
        
        // Handle the new API response structure
        const userData = response.success ? response.data : response;
        
        setUserProfile({
          fullName: userData.fullName || userData.name || user?.name || "User",
          email: userData.email || user?.email || "",
          profileImage: userData.profileImage || user?.profileImage || "",
          plan: userData.plan || user?.plan || "free",
          role: userData.role || user?.role || "unassigned",
          isVerified: userData.isVerified ?? user?.isVerified ?? false,
          isActive: userData.isActive ?? user?.isActive ?? true,
          googleId: userData.googleId || user?.googleId || null,
          createdAt: userData.createdAt || user?.createdAt || null,
          _id: userData._id || userData.id || user?.id || user?._id || ""
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        
        // Fallback to user context data if profile fetch fails
        if (user) {
          setUserProfile({
            fullName: user.fullName || user.name || "User",
            email: user.email || "",
            profileImage: user.profileImage || "",
            plan: user.plan || "free",
            role: user.role || "unassigned",
            isVerified: user.isVerified ?? false,
            isActive: user.isActive ?? true,
            googleId: user.googleId || null,
            createdAt: user.createdAt || null,
            _id: user._id || user.id || ""
          });
        }
        
        // Handle error - maybe redirect to login if unauthorized
        if (error.response && error.response.status === 401) {
          authService.logout();
          navigate("/login");
        }
      } finally {
        setIsLoadingProfile(false);
      }
    }

    // Only fetch if user is available (to avoid unnecessary API calls during loading)
    if (user || !isLoading) {
      fetchUserProfile();
    }
  }, [navigate, user, isLoading]);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setNotificationLoading(true);
        const response = await getNotifications({ limit: 10, skip: 0 });
        if (response.success && response.data) {
          setNotifications(response.data);
          // Calculate unread count
          const unread = response.data.filter((item) => !item.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setNotificationLoading(false);
      }
    }

    fetchNotifications();

    // Set up polling for notifications every 2 minutes
    const interval = setInterval(() => {
      fetchNotifications();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  // Load active sessions
  const loadSessions = async () => {
    try {
      const response = await authService.getSessions();
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  // Handle logout from all devices
  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      toast.success('Logged out from all devices');
      navigate('/login');
    } catch (error) {
      console.error('Logout all error:', error);
      toast.error('Error during logout');
    }
  };

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "dashboard") return "Overview";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Handle marking a single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const response = await markNotificationAsRead(id);
      if (response.success) {
        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.success) {
        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Format notification date to relative time (e.g., "2 hours ago")
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment_logged":
        return <FileText size={16} className="text-green-600" />;
      case "invoice_viewed":
        return <FileText size={16} className="text-blue-600" />;
      case "email_opened":
        return <Mail size={16} className="text-purple-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  // Plan badge styles and text
  const getPlanBadge = () => {
    switch (userProfile.plan.toLowerCase()) {
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

  // Navigation items
  const navItems = [
    {
      name: "Overview",
      path: "/dashboard/overview",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Clients",
      path: "/dashboard/clients",
      icon: <UsersRound size={20} />,
    },
    {
      name: "Projects",
      path: "/dashboard/projects",
      icon: <Briefcase size={20} />,
    },
    // {
    //   name: "Inbox",
    //   path: "/dashboard/inbox",
    //   icon: <MessageSquare size={20} />,
    // },
    { name: "Kanban", path: "/dashboard/boards", icon: <Trello size={20} /> },
    {
      name: "Help Center",
      path: "/dashboard/help",
      icon: <HelpCircle size={20} />,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: <Settings size={20} />,
    },
  ];

  const planBadge = getPlanBadge();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left section: Menu button and logo */}
          <div className="flex items-center p-4">
            {/* Mobile hamburger menu button */}
            <button
              className="lg:hidden mr-2 text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Logo - hidden on mobile, visible on larger screens */}
            <div className="hidden lg:flex items-center">
              <img
                src="/src/assets/logo.png"
                alt="Cubicle Logo"
                className="h-12 w-12"
              />
              <span
                className={`ml-2 text-xl font-semibold text-gray-800 ${
                  !sidebarOpen && "lg:hidden"
                }`}
              >
                Cubicle
              </span>
            </div>

            {/* Collapse sidebar button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md ml-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-[#007991] transition-all hover:shadow-sm"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          </div>

          {/* Right section: notifications, profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" id="notification-area">
              <button
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
                onClick={() => {
                  setNotificationDropdownOpen(!notificationDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
              >
                <Bell size={25} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-[#007991] hover:text-[#005f73] font-medium flex items-center"
                      >
                        <Check size={12} className="mr-1" />
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificationLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007991]"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <Bell
                          size={24}
                          className="mx-auto mb-2 text-gray-400"
                        />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 flex ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="mr-3 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                              {!notification.read && (
                                <button
                                  onClick={() =>
                                    handleMarkAsRead(notification._id)
                                  }
                                  className="text-xs text-[#007991] hover:text-[#005f73] font-medium"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" id="profile-area">
              <button
                className="flex items-center space-x-2"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationDropdownOpen(false);
                }}
              >
                {isLoadingProfile ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                ) : userProfile.profileImage ? (
                  <img
                    src={userProfile.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#222E50] text-white flex items-center justify-center font-medium">
                    {userProfile.fullName
                      .split(" ")
                      .map((name) => name.charAt(0))
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium">
                  {isLoadingProfile ? (
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    userProfile.fullName
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className="hidden md:block text-gray-600"
                />
              </button>

              {/* Profile dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border py-2 w-72 z-50">
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center space-x-3">
                      {userProfile.profileImage ? (
                        <img
                          src={userProfile.profileImage}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                          {userProfile.fullName
                            .split(" ")
                            .map((name) => name.charAt(0))
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{userProfile.fullName}</p>
                        <p className="text-sm text-gray-500">{userProfile.email}</p>
                      </div>
                    </div>
                    
                    {/* User Status Indicators */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        userProfile.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userProfile.isVerified ? '✓ Verified' : '⚠ Unverified'}
                      </span>
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        userProfile.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userProfile.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1)} Plan
                      </span>
                      
                      {userProfile.role && userProfile.role !== 'unassigned' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                        </span>
                      )}
                      
                      {userProfile.googleId && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Google Account
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <NavLink
                    to="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </NavLink>
                  
                  {/* New Sessions option */}
                  <button
                    onClick={() => {
                      loadSessions();
                      setShowSessionsModal(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Active Sessions
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          className={`bg-white shadow-sm z-20 relative ${
            sidebarOpen ? "block" : "hidden"
          } lg:block`}
          initial={{ width: isMobile ? 0 : 256 }}
          animate={{ width: sidebarOpen ? 256 : isMobile ? 0 : 72 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Logo for sidebar - always visible, but text only when expanded */}
          <div className="flex items-center p-4 lg:hidden">
            <div className="flex items-center">
              <img
                src="/src/assets/logo.png"
                alt="Cubicle Logo"
                className={`${sidebarOpen ? "h-10 w-10" : "h-8 w-8"}`}
              />
              {sidebarOpen && (
                <span className="ml-2 text-xl font-semibold text-gray-800">
                  Cubicle
                </span>
              )}
            </div>
          </div>

          <div
            className="h-full flex flex-col"
            style={{ width: sidebarOpen ? 256 : 72 }}
          >
            <div className="overflow-y-auto pb-4 lg:mt-16 flex flex-col justify-between h-full">
              {/* Navigation Links */}
              <nav className="space-y-1">
                {/* Navigation items start here */}
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center px-5 py-3.5 transition-colors bg-gradient-to-r from-[#005667]/20 from-1% via-[#005667]/5 to-[#FFFFFF] text-[#005667] font-bold"
                        : "flex items-center px-5 py-3.5 transition-colors text-gray-700 hover:bg-gray-100"
                    }
                  >
                    <div className="flex items-center">
                      <span className="w-6">{item.icon}</span>
                      {sidebarOpen && (
                        <span className="ml-3 font-medium">{item.name}</span>
                      )}
                    </div>

                    {/* Show indicator for active page */}
                    {({ isActive }) =>
                      isActive && (
                        <div className="ml-auto">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#222E50]"></div>
                        </div>
                      )
                    }
                  </NavLink>
                ))}
              </nav>

              {/* User profile card */}
              <div className="px-3 py-4 mt-auto">
                {isLoadingProfile ? (
                  <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ) : sidebarOpen ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      {userProfile.profileImage ? (
                        <img
                          src={userProfile.profileImage}
                          alt="Profile"
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#222E50] text-white flex items-center justify-center font-medium text-lg">
                          {userProfile.fullName
                            .split(" ")
                            .map((name) => name.charAt(0))
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {userProfile.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {userProfile.role === 'unassigned' ? 'No role assigned' : 
                           userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${planBadge.bgColor} ${planBadge.textColor}`}
                      >
                        {planBadge.text}
                      </span>

                      {userProfile.plan.toLowerCase() === "free" && (
                        <button
                          className="text-xs font-medium text-[#007991] py-1 px-2 flex items-center hover:bg-[#f0f9ff] rounded"
                          onClick={() => navigate("/dashboard/settings")}
                        >
                          Upgrade <ArrowUpRight size={12} className="ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    {userProfile.profileImage ? (
                      <img
                        src={userProfile.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#222E50] text-white flex items-center justify-center font-medium">
                        {userProfile.fullName
                          .split(" ")
                          .map((name) => name.charAt(0))
                          .join("")
                          .toUpperCase()
                          .substring(0, 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* Page heading */}
          <div className="mb-4">
            {/* <h1 className="text-2xl font-bold text-gray-800">
              {getPageTitle()}
            </h1> */}
          </div>

          {/* Page content from child routes */}
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-[5]"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {session.ipAddress} 
                        {session.ipAddress === window.location.hostname && (
                          <span className="text-green-600 text-sm ml-2">(Current)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{session.userAgent}</p>
                      <p className="text-xs text-gray-500">
                        Last accessed: {new Date(session.lastAccessedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleLogoutAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout All Devices
              </button>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;

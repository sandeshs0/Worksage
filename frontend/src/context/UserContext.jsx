import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOAuthProcessing, setIsOAuthProcessing] = useState(false);

  const refreshUserData = async () => {
    try {
      console.log("🔄 UserContext: Starting user data refresh...");
      console.log("📍 Current path:", window.location.pathname);
      console.log("🔗 Current URL:", window.location.href);

      setIsLoading(true);

      // Skip refresh if OAuth is being processed
      if (isOAuthProcessing) {
        console.log(
          "⏸️ UserContext: Skipping refresh while OAuth is processing"
        );
        setIsLoading(false);
        return;
      }

      // Skip refresh if we're on OAuth callback page (let that handle the token)
      if (window.location.pathname === "/OAuthCallback") {
        console.log("⏸️ UserContext: Skipping refresh on OAuth callback page");
        setIsLoading(false);
        return;
      }

      // Additional check for OAuth URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("accessToken")) {
        console.log(
          "⏸️ UserContext: Found accessToken in URL, skipping refresh"
        );
        setIsLoading(false);
        return;
      }

      // Check if we have an access token
      if (!authService.isAuthenticated()) {
        console.log("❌ UserContext: No access token found");
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      console.log("✅ UserContext: Access token found, fetching profile...");
      // Try to get user profile
      const profileData = await authService.getUserProfile();
      console.log("📋 UserContext: Profile data received:", profileData);

      // Handle different response structures
      const userData = profileData.data || profileData.user || profileData;
      console.log("👤 UserContext: Setting user data:", userData);
      setUser(userData);
      setIsAuthenticated(true);

      // Update localStorage user data
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("💾 UserContext: User data stored in localStorage");
    } catch (error) {
      console.error("❌ UserContext: Failed to fetch user data:", error);

      // Handle token expiration or unauthorized errors
      if (error.response?.status === 401) {
        console.log("🔄 UserContext: Token expired, attempting refresh...");
        // Try to refresh token first
        try {
          await authService.refreshToken();
          console.log(
            "✅ UserContext: Token refreshed successfully, retrying profile fetch..."
          );
          // Retry getting user profile
          const profileData = await authService.getUserProfile();
          const userData = profileData.data || profileData.user || profileData;
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(userData));
          console.log(
            "✅ UserContext: Profile fetch successful after token refresh"
          );
        } catch (refreshError) {
          console.error("❌ UserContext: Token refresh failed:", refreshError);
          // Refresh failed, logout user
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      } else {
        // For other errors, try to use cached user data
        console.log("⚠️ UserContext: Using cached user data due to error");
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          console.log("✅ UserContext: Found cached user:", cachedUser);
          setUser(cachedUser);
          setIsAuthenticated(true);
        } else {
          console.log("❌ UserContext: No cached user found");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } finally {
      setIsLoading(false);
      console.log("🏁 UserContext: User data refresh completed");
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        // Check if MFA is required
        if (response.requiresMFA) {
          // Don't set user data for MFA responses
          return response;
        }

        // Regular login - set user data
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // OAuth processing management
  const setOAuthProcessing = (processing) => {
    console.log(
      processing
        ? "🔄 OAuth processing started"
        : "✅ OAuth processing completed"
    );
    setIsOAuthProcessing(processing);
  };

  // Initial fetch of user data when component mounts
  useEffect(() => {
    console.log(
      "🚀 UserContext useEffect triggered, current path:",
      window.location.pathname
    );

    // Check if OAuth is in progress (set by pre-processor)
    const oauthInProgress = sessionStorage.getItem("oauthInProgress");
    if (oauthInProgress === "true") {
      console.log(
        "⏸️ UserContext: OAuth pre-processing detected, skipping initial refresh"
      );
      setIsLoading(false);
      return;
    }

    // Don't auto-refresh on OAuth callback page - let that component handle it
    if (window.location.pathname === "/OAuthCallback") {
      console.log(
        "⏸️ UserContext: Skipping initial refresh on OAuth callback page"
      );
      setIsLoading(false);
      return;
    }

    // Check if URL contains OAuth parameters (additional safety check)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("accessToken")) {
      console.log(
        "⏸️ UserContext: Found accessToken in URL, skipping initial refresh"
      );
      setIsLoading(false);
      return;
    }

    console.log(
      "⏰ UserContext: Starting immediate refresh (no OAuth detected)"
    );
    // Start refresh immediately if no OAuth is detected
    refreshUserData();
  }, []);

  // Listen for storage changes (multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" && !e.newValue) {
        // Token was removed, logout user
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    const handleLogoutEvent = () => {
      // Handle automatic logout from failed token refresh
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth:logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    refreshUserData,
    setUser,
    login,
    logout,
    logoutAll,
    setOAuthProcessing,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

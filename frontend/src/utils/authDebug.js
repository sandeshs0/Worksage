// Debug utility for OAuth authentication flow
export const debugAuth = {
  // Check current authentication state
  checkAuthState() {
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    console.log("🔍 Auth Debug State:", {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      hasUser: !!user,
      userParseable: user
        ? (() => {
            try {
              JSON.parse(user);
              return true;
            } catch {
              return false;
            }
          })()
        : false,
      currentPath: window.location.pathname,
      currentSearch: window.location.search,
    });

    if (user) {
      try {
        console.log("👤 Current User:", JSON.parse(user));
      } catch (e) {
        console.error("❌ User data corrupt:", e);
      }
    }

    return {
      isAuthenticated: !!accessToken,
      hasValidUser: !!user,
      token: accessToken,
      userData: user ? JSON.parse(user) : null,
    };
  },

  // Simulate OAuth callback for testing
  simulateOAuthCallback(accessToken = "test-token", isNewUser = false) {
    console.log("🧪 Simulating OAuth callback with:", {
      accessToken,
      isNewUser,
    });

    // Store token
    localStorage.setItem("accessToken", accessToken);

    // Simulate URL change
    const newUrl = `/OAuthCallback?accessToken=${accessToken}&isNewUser=${isNewUser}`;
    window.history.pushState({}, "", newUrl);

    console.log(
      "✅ OAuth simulation complete. Check console for GoogleAuthCallback logs."
    );
  },

  // Clear all auth data
  clearAuth() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    console.log("🧹 Auth data cleared");
  },

  // Test token refresh
  async testTokenRefresh() {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      console.log("🔄 Token refresh test result:", data);
      return data;
    } catch (error) {
      console.error("❌ Token refresh test failed:", error);
      return null;
    }
  },

  // Test profile fetch with current token
  async testProfileFetch() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("❌ No access token found");
        return null;
      }

      const response = await fetch("/api/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      console.log("👤 Profile fetch test result:", data);
      return data;
    } catch (error) {
      console.error("❌ Profile fetch test failed:", error);
      return null;
    }
  },

  // Quick OAuth simulation for testing
  quickOAuthTest() {
    console.log("🧪 Starting quick OAuth test...");

    // Simulate a real JWT token structure (but with dummy data)
    const dummyToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTksImF1ZCI6IndvcmtzYWdlLXVzZXJzIiwiaXNzIjoid29ya3NhZ2UifQ.dummy-signature";

    // Store token
    localStorage.setItem("accessToken", dummyToken);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      })
    );

    console.log(
      "✅ Dummy OAuth data set. Try refreshing or navigating to dashboard."
    );
    console.log("🔍 Current auth state:", this.checkAuthState());

    return dummyToken;
  },

  // Test OAuth pre-processing
  testOAuthPreprocessing() {
    console.log("🧪 Testing OAuth pre-processing simulation...");

    // Simulate OAuth URL
    const testUrl =
      window.location.origin +
      "/OAuthCallback?accessToken=test-oauth-token&isNewUser=false";
    console.log("🔗 Simulated OAuth URL:", testUrl);

    // Check if pre-processor would trigger
    const originalPath = window.location.pathname;
    history.pushState({}, "", testUrl);

    // Import and run pre-processor
    import("./oauthPreProcessor").then(() => {
      console.log("✅ OAuth pre-processor test complete");
      console.log("📊 OAuth flags:", {
        oauthInProgress: sessionStorage.getItem("oauthInProgress"),
        oauthIsNewUser: sessionStorage.getItem("oauthIsNewUser"),
        hasToken: !!localStorage.getItem("accessToken"),
      });

      // Restore original URL
      history.pushState({}, "", originalPath);
    });
  },

  // Check OAuth processing state
  checkOAuthState() {
    const state = {
      oauthInProgress: sessionStorage.getItem("oauthInProgress"),
      oauthIsNewUser: sessionStorage.getItem("oauthIsNewUser"),
      currentPath: window.location.pathname,
      currentSearch: window.location.search,
      hasAccessToken: !!localStorage.getItem("accessToken"),
      hasUser: !!localStorage.getItem("user"),
      fullURL: window.location.href,
    };

    console.log("🔍 OAuth State Check:", state);
    return state;
  },

  // Force clear OAuth processing state
  clearOAuthState() {
    sessionStorage.removeItem("oauthInProgress");
    sessionStorage.removeItem("oauthIsNewUser");
    console.log("🧹 OAuth processing state cleared");
  },

  // Manual OAuth callback simulation
  simulateOAuthCallback(token = "test-token") {
    console.log("🧪 Simulating OAuth callback...");

    // Set up OAuth state
    sessionStorage.setItem("oauthInProgress", "true");
    localStorage.setItem("accessToken", token);

    // Navigate to OAuth callback
    window.history.pushState(
      {},
      "",
      `/OAuthCallback?accessToken=${token}&isNewUser=false`
    );

    console.log(
      "✅ OAuth callback simulation set up. The GoogleAuthCallback component should now trigger."
    );
    console.log("🔍 Current state:", this.checkOAuthState());
  },
};

// Make it available globally for debugging in console
if (typeof window !== "undefined") {
  window.debugAuth = debugAuth;
}

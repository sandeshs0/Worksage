// OAuth token pre-processor
// This runs before React components initialize to handle OAuth tokens from URL

const processOAuthToken = () => {
  // Only run this on OAuth callback page
  if (window.location.pathname === "/OAuthCallback") {
    console.log("🔗 Pre-processing OAuth callback...");

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const isNewUser = urlParams.get("isNewUser");

    if (accessToken) {
      console.log(
        "💾 Pre-storing OAuth access token before React initialization"
      );
      localStorage.setItem("accessToken", accessToken);

      // Also set a flag to indicate OAuth is in progress
      sessionStorage.setItem("oauthInProgress", "true");
      sessionStorage.setItem("oauthIsNewUser", isNewUser || "false");

      console.log("✅ OAuth token pre-processed successfully");
    } else {
      console.warn("⚠️ OAuth callback detected but no access token found");
    }
  }
};

// Run immediately when this module is imported
processOAuthToken();

export { processOAuthToken };

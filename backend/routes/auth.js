const express = require("express");
const router = express.Router();
const passport = require("passport");
const { check, body } = require("express-validator");
const userController = require("../controllers/userController");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { passwordPolicyMiddleware } = require("../middleware/passwordPolicy");

// Use enhanced auth middleware for backward compatibility
const auth = authenticateToken;

// Import all auth controllers
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  logoutAll,
  getSessions,
  updateRole,
  generateToken, // Legacy for OAuth
} = require("../controllers/authController");

// Registration with enhanced password validation
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).escape(),
    body("email").isEmail().normalizeEmail(),
    authLimiter,
    passwordPolicyMiddleware,
  ],
  register
);

// Email verification with validation
router.post(
  "/verify",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
    // authLimiter,
  ],
  verifyEmail
);

// Login with validation
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    authLimiter,
  ],
  login
);

// Token refresh
router.post("/refresh", refreshToken);

// Logout
router.post("/logout", logout);

// Logout from all devices (requires authentication)
router.post("/logout-all", auth, logoutAll);

// Get active sessions (requires authentication)
router.get("/sessions", auth, getSessions);

// Update user role (requires authentication)
router.put(
  "/role",
  [
    body("role").isIn([
      "designer",
      "developer",
      "writer",
      "project manager",
      "freelancer",
    ]),
    auth,
  ],
  updateRole
);

// Google OAuth routes (keeping legacy token for compatibility)
router.get(
  "/google",
  (req, res, next) => {
    console.log("🚀 Initiating Google OAuth...");
    console.log(
      "Google Client ID:",
      process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing"
    );
    console.log(
      "Google Client Secret:",
      process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing"
    );
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("🔍 Google OAuth callback received:");
    console.log("Query params:", req.query);
    console.log(
      "Raw OAuth code:",
      req.rawOAuthCode
        ? req.rawOAuthCode.substring(0, 20) + "..."
        : "Not preserved"
    );

    // If we have a preserved raw code, replace the encoded one
    if (req.rawOAuthCode) {
      req.query.code = req.rawOAuthCode;
      console.log("✅ Using preserved raw OAuth code");
    }

    console.log("Headers:", req.headers);
    next();
  },
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false,
    failureCallback: (req, res) => {
      console.error("❌ Google OAuth authentication failed");
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_auth_failed`);
    },
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const isNewUser = user.isNewUser;

      // Get client info for session tracking
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("User-Agent");

      // Import TokenService here to avoid circular dependency
      const TokenService = require("../services/tokenService");

      // Create session with new token system
      const tokens = await TokenService.createSession(
        user._id,
        ipAddress,
        userAgent
      );

      // Set secure HTTP-only cookie for refresh token
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect with access token and user info
      res.redirect(
        `${process.env.FRONTEND_URL}/OAuthCallback?accessToken=${tokens.accessToken}&isNewUser=${isNewUser}`
      );
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// Password reset routes
router.post(
  "/forgot-password",
  [check("email", "Please include a valid email").isEmail()],
  userController.forgotPassword
);

router.put(
  "/reset-password/:token",
  [authLimiter, passwordPolicyMiddleware],
  userController.resetPassword
);

module.exports = router;

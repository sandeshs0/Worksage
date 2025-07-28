// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
      code: "ADMIN_ONLY",
    });
  }
  next();
};

const TokenService = require("../services/tokenService");
const User = require("../models/User");

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify access token
    const decoded = TokenService.verifyAccessToken(token);

    // Get user details with role information
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh your session.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
        code: "INVALID_TOKEN",
      });
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTH_FAILED",
    });
  }
};

// Role-based authorization middleware
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
          code: "AUTH_REQUIRED",
        });
      }

      // Check if user has required role
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(
            ", "
          )}. Your role: ${userRole}`,
          code: "INSUFFICIENT_PERMISSIONS",
          requiredRoles: allowedRoles,
          userRole: userRole,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization check failed.",
        code: "AUTH_CHECK_FAILED",
      });
    }
  };
};

// Resource ownership middleware
const authorizeOwnership = (resourceModel, resourceParam = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceParam];
      const userId = req.user._id;

      // Admin can access all resources
      if (req.user.role === "admin") {
        return next();
      }

      // Check if resource exists and user owns it
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found.",
          code: "RESOURCE_NOT_FOUND",
        });
      }

      // Check ownership (assuming resource has userId or createdBy field)
      const isOwner =
        resource.userId?.toString() === userId.toString() ||
        resource.createdBy?.toString() === userId.toString() ||
        resource.user?.toString() === userId.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only access your own resources.",
          code: "NOT_OWNER",
        });
      }

      // Attach resource to request for further use
      req.resource = resource;
      next();
    } catch (error) {
      console.error("Ownership middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Ownership check failed.",
        code: "OWNERSHIP_CHECK_FAILED",
      });
    }
  };
};

// Combined middleware helper
const createAuthMiddleware = (roles = [], ownership = null) => {
  const middlewares = [authenticateToken];

  // Add role authorization if specified
  if (roles.length > 0) {
    middlewares.push(authorizeRole(...roles));
  }

  // Add ownership check if specified
  if (ownership) {
    middlewares.push(authorizeOwnership(ownership.model, ownership.param));
  }

  return middlewares;
};

// Legacy auth middleware for backward compatibility
const auth = authenticateToken;

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeOwnership,
  createAuthMiddleware,
  requireAdmin,
  auth, // Keep this for backward compatibility
};

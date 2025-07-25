
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


const authenticateToken = async (req, res, next) => {
  try {
    
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.substring(7); 

    
    const decoded = TokenService.verifyAccessToken(token);

    
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    
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

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
          code: "AUTH_REQUIRED",
        });
      }
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

const authorizeOwnership = (resourceModel, resourceParam = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceParam];
      const userId = req.user._id;
      if (req.user.role === "admin") {
        return next();
      }
      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found.",
          code: "RESOURCE_NOT_FOUND",
        });
      }
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
const createAuthMiddleware = (roles = [], ownership = null) => {
  const middlewares = [authenticateToken];

  if (roles.length > 0) {
    middlewares.push(authorizeRole(...roles));
  }

  if (ownership) {
    middlewares.push(authorizeOwnership(ownership.model, ownership.param));
  }
  return middlewares;
};


const auth = authenticateToken;

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeOwnership,
  createAuthMiddleware,
  requireAdmin,
  auth, 
};

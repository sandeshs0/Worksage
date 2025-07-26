const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  authenticateToken,
  authorizeRole,
  authorizeOwnership,
} = require("../middleware/authMiddleware");
const { passwordPolicyMiddleware } = require("../middleware/passwordPolicy");
const userController = require("../controllers/userController");
const User = require("../models/User");

// Use the enhanced auth middleware for backward compatibility
const auth = authenticateToken;

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, userController.getProfile);

// @route   GET /api/users/profile
// @desc    Get current user's profile (alias for /me)
// @access  Private
router.get("/profile", auth, userController.getProfile);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put(
  "/me",
  [
    auth,
    check("name", "Name is required").optional().not().isEmpty(),
    check("email", "Please include a valid email").optional().isEmail(),
    check("role", "Invalid role")
      .optional()
      .isIn([
        "designer",
        "developer",
        "writer",
        "project manager",
        "freelancer",
        "unassigned",
        "admin",
        "manager",
      ]),
  ],
  userController.updateProfile
);

// @route   PUT /api/users/profile
// @desc    Update user profile (alias for /me)
// @access  Private
router.put(
  "/profile",
  [
    auth,
    check("name", "Name is required").optional().not().isEmpty(),
    check("email", "Please include a valid email").optional().isEmail(),
    check("role", "Invalid role")
      .optional()
      .isIn([
        "designer",
        "developer",
        "writer",
        "project manager",
        "freelancer",
        "unassigned",
        "admin",
        "manager",
      ]),
  ],
  userController.updateProfile
);

// @route   PUT /api/users/me/avatar
// @desc    Update profile picture
// @access  Private
router.put("/me/avatar", auth, userController.updateProfilePicture);

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put(
  "/password",
  [
    auth,
    check("currentPassword", "Current password is required").exists(),
    passwordPolicyMiddleware, // Use robust password policy
  ],
  userController.changePassword
);

// @route   PUT /api/users/change-password
// @desc    Change password (backward compatibility)
// @access  Private
router.put(
  "/change-password",
  [
    auth,
    check("currentPassword", "Current password is required").exists(),
    passwordPolicyMiddleware, // Use robust password policy
  ],
  userController.changePassword
);

// Admin-only routes
// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get("/", auth, authorizeRole("admin"), userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get("/:id", auth, authorizeRole("admin"), userController.getUserById);

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put(
  "/:id/role",
  [
    auth,
    // authorizeRole("admin"),
    check("role", "Valid role is required").isIn([
      "designer",
      "developer",
      "writer",
      "project manager",
      "freelancer",
      "unassigned",
      "admin",
      "manager",
    ]),
  ],
  userController.updateUserRole
);

// @route   PUT /api/users/:id/status
// @desc    Activate/Deactivate user (Admin only)
// @access  Private (Admin)
router.put(
  "/:id/status",
  [
    auth,
    // authorizeRole("admin"),
    check("isActive", "Status is required").isBoolean(),
  ],
  userController.updateUserStatus
);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete("/:id", auth, authorizeRole("admin"), userController.deleteUser);

module.exports = router;

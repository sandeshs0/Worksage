const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// All routes below require admin authentication
router.use(authenticateToken, requireAdmin);

// List all users
router.get("/users", adminController.getAllUsers);

// Change user plan
router.patch("/user/:userId/plan", adminController.changeUserPlan);

// Delete user
router.delete("/users/:userId", adminController.deleteUser);

// System statistics
router.get("/stats", adminController.getSystemStats);

// Activity logs (placeholder)
router.get("/logs", adminController.getActivityLogs);

module.exports = router;

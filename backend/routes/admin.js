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

// Activity logs (paginated, filterable)
router.get("/activity-logs", adminController.getActivityLogs);

// Security logs (dedicated endpoint for security events)
router.get("/security-logs", adminController.getSecurityLogs);

// Security dashboard summary
router.get("/security-dashboard", adminController.getSecurityDashboard);

// Clear activity logs
router.delete("/activity-logs", adminController.clearActivityLogs);

module.exports = router;

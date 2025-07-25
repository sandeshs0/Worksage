const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const auth = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");
const { body, param, query, validationResult } = require("express-validator");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }
  next();
};

// // Rate limiting for payment operations
// const paymentRateLimit = rateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // 5 payment attempts per 15 minutes
//   message: {
//     success: false,
//     message: 'Too many payment attempts. Please try again later.',
//     code: 'RATE_LIMIT_EXCEEDED'
//   }
// });

// Rate limiting for general plan operations
// const planRateLimit = rateLimiter({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 30, // 30 requests per minute
//   message: {
//     success: false,
//     message: 'Too many requests. Please try again later.',
//     code: 'RATE_LIMIT_EXCEEDED'
//   }
// });
// Validation schemas
const initiateUpgradeValidation = [
  body("targetPlan")
    .isIn(["pro", "vantage"])
    .withMessage("Target plan must be either pro or vantage"),
  handleValidationErrors,
];

const verifyPaymentValidation = [
  body("pidx")
    .notEmpty()
    .withMessage("pidx is required")
    .isLength({ min: 10 })
    .withMessage("Invalid pidx format"),
  handleValidationErrors,
];

const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("status")
    .optional()
    .isIn(["pending", "completed", "failed", "cancelled", "expired"])
    .withMessage("Invalid status filter"),
  handleValidationErrors,
];

const upgradeIdValidation = [
  param("upgradeId").isMongoId().withMessage("Invalid upgrade ID"),
  handleValidationErrors,
];

// ===== PUBLIC ROUTES (No CSRF protection needed) =====

/**
 * @route   GET /api/plans
 * @desc    Get all available plans
 * @access  Public
 */
router.get("/", planController.getPlans);

/**
 * @route   GET /api/plans/callback
 * @desc    Handle Khalti payment callback
 * @access  Public (called by Khalti - no CSRF needed)
 */
router.get("/callback", planController.handleKhaltiCallback);

// ===== PROTECTED ROUTES (Require authentication) =====

/**
 * @route   GET /api/plans/current
 * @desc    Get current user's plan details
 * @access  Private
 */
router.get("/current", auth, planController.getCurrentPlan);

/**
 * @route   POST /api/plans/initiate-upgrade
 * @desc    Initiate plan upgrade with Khalti payment
 * @access  Private
 */
router.post(
  "/initiate-upgrade",
  auth,
  initiateUpgradeValidation,
  planController.initiatePlanUpgrade
);

/**
 * @route   POST /api/plans/verify-payment
 * @desc    Verify payment and complete plan upgrade
 * @access  Private
 */
router.post(
  "/verify-payment",
  auth,
  verifyPaymentValidation,
  planController.verifyPlanUpgrade
);

/**
 * @route   GET /api/plans/upgrade-history
 * @desc    Get user's plan upgrade history
 * @access  Private
 */
router.get(
  "/upgrade-history",
  auth,
  paginationValidation,
  planController.getPlanUpgradeHistory
);

/**
 * @route   DELETE /api/plans/upgrade/:upgradeId
 * @desc    Cancel pending plan upgrade
 * @access  Private
 */
router.delete(
  "/upgrade/:upgradeId",
  auth,
  upgradeIdValidation,
  planController.cancelPlanUpgrade
);

// Admin routes (if needed later)
// router.get('/admin/all-upgrades', auth, adminAuth, planController.getAllUpgrades);

module.exports = router;

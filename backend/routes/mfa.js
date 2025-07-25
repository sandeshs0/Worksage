const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  setupMFA,
  verifyMFASetup,
  disableMFA,
  getMFAStatus,
  regenerateBackupCodes,
  verifyMFA,
  resetMFA,
} = require("../controllers/mfaController");

// All MFA routes require authentication except verify (during login)
const auth = authenticateToken;

// @route   GET /api/mfa/status
// @desc    Get MFA status for current user
// @access  Private
router.get("/status", auth, getMFAStatus);

// @route   POST /api/auth/mfa/setup
// @desc    Setup MFA - Generate QR code
// @access  Private
router.post("/setup", auth, setupMFA);

// @route   POST /api/auth/mfa/verify-setup
// @desc    Verify MFA setup and enable
// @access  Private
router.post("/verify-setup", auth, verifyMFASetup);

// @route   POST /api/auth/mfa/disable
// @desc    Disable MFA for user
// @access  Private
router.post("/disable", auth, disableMFA);

// @route   POST /api/auth/mfa/regenerate-backup-codes
// @desc    Regenerate backup codes
// @access  Private
router.post("/regenerate-backup-codes", auth, regenerateBackupCodes);

// @route   POST /api/mfa/verify
// @desc    Verify MFA token during login
// @access  Public (special case during login flow)
router.post("/verify", verifyMFA);

// @route   POST /api/mfa/reset
// @desc    Reset MFA for user (emergency function)
// @access  Private
router.post("/reset", auth, resetMFA);

module.exports = router;

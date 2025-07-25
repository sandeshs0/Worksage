// routes/emailAccounts.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const emailAccountController = require('../controllers/emailAccountController');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   POST /api/email-accounts
// @desc    Add new email account
// @access  Private
router.post(
  '/',
  [
    authenticateToken,
    [
      check('email', 'Please include a valid email').isEmail(),
      check('displayName', 'Display name is required').not().isEmpty(),
      check('smtp.host', 'SMTP host is required').not().isEmpty(),
      check('smtp.port', 'SMTP port is required').isInt({ min: 1, max: 65535 }),
      check('smtp.secure', 'SMTP secure must be a boolean').optional().isBoolean(),
      check('auth.user', 'Email username is required').not().isEmpty(),
      check('auth.pass', 'Email password is required').exists()
    ]
  ],
  emailAccountController.addEmailAccount
);

// @route   GET /api/email-accounts/verify/:token
// @desc    Verify email account
// @access  Public
router.get(
  '/verify/:token',
  emailAccountController.verifyEmailAccount
);

// @route   GET /api/email-accounts
// @desc    Get user's email accounts
// @access  Private
router.get(
  '/',
  authenticateToken,
  emailAccountController.getEmailAccounts
);

// @route   PUT /api/email-accounts/:id/set-default
// @desc    Set default email account
// @access  Private
router.put(
  '/:id/set-default',
  authenticateToken,
  emailAccountController.setDefaultEmailAccount
);

router.delete('/:id', authenticateToken, emailAccountController.deleteEmailAccount);

router.get('/check', authenticateToken, emailAccountController.checkEmailAccount);

module.exports = router;
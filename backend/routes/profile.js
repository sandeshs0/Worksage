const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profileController');
const auth = require('../middleware/auth');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', authenticateToken, getProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get notifications for current user
router.get('/', authenticateToken, notificationController.getNotifications);

// Mark a notification as read
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticateToken, notificationController.markAllAsRead);

module.exports = router;

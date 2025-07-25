const express = require('express');
const router = express.Router();
const { createClient, getClients, getClient, updateClient, deleteClient } = require('../controllers/clientController');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   POST /api/clients
// @desc    Create a new client
// @access  Private
router.post('/createClient', authenticateToken, upload.uploadFile, createClient);

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/getClients', authenticateToken, getClients);

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Private
router.get('/:id', authenticateToken, getClient);

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', authenticateToken, upload.uploadFile, updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', authenticateToken, deleteClient);

module.exports = router;

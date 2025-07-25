const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const  auth  = require('../middleware/auth');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/stats', authenticateToken, invoiceController.getInvoiceStats);

// Invoice routes
router
  .route('/')
  .post(authenticateToken, invoiceController.createInvoice)
  .get(authenticateToken, invoiceController.getInvoices);

router
  .route('/:id')
  .get(authenticateToken, invoiceController.getInvoice)
  .put(authenticateToken, invoiceController.updateInvoice)
  .delete(authenticateToken, invoiceController.deleteInvoice);


// Add new payment logging route
router.post('/:id/payments', authenticateToken, invoiceController.logPayment);

// Invoice statistics

// Send invoice via email
router.post('/:id/send', authenticateToken, invoiceController.sendInvoice);

// Track invoice view (public endpoint)
router.get('/track/:trackingId', invoiceController.trackInvoiceView);

module.exports = router;

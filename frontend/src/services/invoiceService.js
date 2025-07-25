import { createApiInstance } from './apiConfig';

const api = createApiInstance();

/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise} Response from the API
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get all invoices with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} Response from the API
 */
export const getInvoices = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get invoice by ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise} Response from the API
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update an invoice
 * @param {string} invoiceId - Invoice ID
 * @param {Object} invoiceData - Updated invoice data
 * @returns {Promise} Response from the API
 */
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const response = await api.put(`/invoices/${invoiceId}`, invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete an invoice
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise} Response from the API
 */
export const deleteInvoice = async (invoiceId) => {
  try {
    const response = await api.delete(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update invoice status
 * @param {string} invoiceId - Invoice ID
 * @param {string} status - New status
 * @returns {Promise} Response from the API
 */
export const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const response = await api.patch(`/invoices/${invoiceId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error.response?.data || error;
  }
};

/**
 * Send invoice by email
 * @param {string} invoiceId - Invoice ID
 * @param {Object} emailData - Email details
 * @returns {Promise} Response from the API
 */
export const sendInvoiceEmail = async (invoiceId, emailData) => {
  try {
    const response = await api.post(`/invoices/${invoiceId}/send`, emailData);
    return response.data;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error.response?.data || error;
  }
};

/**
 * Generate invoice PDF
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise} PDF blob response
 */
export const generateInvoicePDF = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get invoice statistics
 * @returns {Promise} Response from the API
 */
export const getInvoiceStats = async () => {
  try {
    const response = await api.get('/invoices/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    throw error.response?.data || error;
  }
};

/**
 * Log a payment for an invoice
 * @param {string} invoiceId - Invoice ID
 * @param {Object} paymentData - Payment details
 * @returns {Promise} Response from the API
 */
export const logPayment = async (invoiceId, paymentData) => {
  try {
    const response = await api.post(`/invoices/${invoiceId}/payments`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error logging payment:", error);
    throw error.response?.data || error;
  }
};

/**
 * Track invoice view (public endpoint)
 * @param {string} trackingId - Invoice tracking ID
 * @returns {Promise} Response from the API
 */
export const trackInvoiceView = async (trackingId) => {
  try {
    const response = await api.get(`/invoices/track/${trackingId}`);
    return response.data;
  } catch (error) {
    console.error("Error tracking invoice view:", error);
    throw error.response?.data || error;
  }
};

// Export sendInvoice as an alias for backward compatibility
export const sendInvoice = sendInvoiceEmail;

export default {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  sendInvoiceEmail,
  sendInvoice, // Add alias to default export
  logPayment,
  trackInvoiceView,
  generateInvoicePDF,
  getInvoiceStats
};

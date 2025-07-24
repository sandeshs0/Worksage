import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// Get token from localStorage (you might have a utility function for this)
const getAuthToken = () => localStorage.getItem("token");

/**
 * Create a new invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/invoices`,
      invoiceData,
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

/**
 * Get all invoices with filters
 */
export const getInvoices = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/api/invoices?${params.toString()}`,
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

/**
 * Get single invoice by ID
 */
export const getInvoice = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/invoices/${id}`, {
      headers: {
        "x-auth-token": `${getAuthToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/invoices/${id}`,
      invoiceData,
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/invoices/${id}`, {
      headers: {
        "x-auth-token": `${getAuthToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

/**
 * Send invoice via email
 */
export const sendInvoice = async (id, emailData = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/invoices/${id}/send`,
      emailData,
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending invoice:", error);
    throw error;
  }
};

/**
 * Log a payment for an invoice
 */
export const logPayment = async (invoiceId, paymentData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/invoices/${invoiceId}/payments`,
      paymentData,
      {
        headers: {
          "x-auth-token": `${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error logging payment:", error);
    throw error;
  }
};

/**
 * Get invoice statistics
 */
export const getInvoiceStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/invoices/stats`, {
      headers: {
        "x-auth-token": `${getAuthToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    throw error;
  }
};

import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

/**
 * Get invoice details by token
 */
export const getInvoiceDetails = (invoiceToken: string) => {
  return ApiService({
    method: 'POST',
    endpoint: apiPaths.invoice.details,
    data: { invoiceToken },
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

/**
 * Generate invoice
 */
export const generateInvoice = (data: {
  quotationId: string;
  negotiatedPrice: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  taxAmount?: number;
  shippingCharges?: number;
  notes?: string;
}) => {
  return ApiService({
    method: 'POST',
    endpoint: apiPaths.invoice.generate,
    data,
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

/**
 * Get seller invoices
 */
export const getSellerInvoices = (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
}) => {
  return ApiService({
    method: 'GET',
    endpoint: apiPaths.invoice.sellerList,
    params
  });
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = (invoiceId: string) => {
  return ApiService({
    method: 'GET',
    endpoint: `${apiPaths.invoice.getById}/${invoiceId}`,
  });
};

export const invoiceApi = {
  getInvoiceDetails,
  generateInvoice,
  getSellerInvoices,
  getInvoiceById
};
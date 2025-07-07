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

export const invoiceApi = {
  getInvoiceDetails
};
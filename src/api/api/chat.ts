import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

/**
 * Get all chats with filters
 */
export const getAllChats = (params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'cancelled';
}) => {
  return ApiService({
    method: 'GET',
    endpoint: apiPaths.chat.all,
    params,
    isChatApi:true
  });
};

/**
 * Get chat messages
 */
export const getChatMessages = (chatId: string, params?: {
  page?: number;
  limit?: number;
}) => {
  return ApiService({
    method: 'GET',
    endpoint: `${apiPaths.chat.messages}/${chatId}`,
    params,
    isChatApi:true
  });
};

/**
 * Get chat by ID
 */
// export const getChatById = (chatId: string) => {
//   return ApiService({
//     method: 'GET',
//     endpoint: `${apiPaths.chat.getById}/${chatId}`,
//     isChatApi:true,
//   });
// };

/**
 * Upload media files
 */
export const uploadMedia = (files: FormData) => {
  return ApiService({
    method: 'POST',
    endpoint: apiPaths.media.upload,
    data: files,
    isChatApi:true,
    headers: {
      // Don't set Content-Type for FormData
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

/**
 * Download media file by fileName
 */
export const downloadMedia = (fileName: string) => {
  return ApiService({
    method: 'GET',
    endpoint: `${apiPaths.media.download}`,
    params:{fileName},
    // responseType: 'blob', // Ensure you get a Blob for file download
    isChatApi: true,
    responseType:'blob',
  });
};

export const chatApi = {
  getAllChats,
  getChatMessages,
  // getChatById,
  uploadMedia,
  generateInvoice,
  getSellerInvoices,
  getInvoiceById,
  downloadMedia
};
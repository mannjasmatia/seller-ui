import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

/**
 * Get all quotations with filters
 */
export const getAllQuotations = (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'negotiation';
  search?: string;
  productIds?: string[];
  seen?: boolean;
}) => {
  return ApiService({
    method: 'GET',
    endpoint: apiPaths.quotation.all,
    params
  });
};

/**
 * Get quotation by ID
 */
export const getQuotationById = (quotationId: string) => {
  return ApiService({
    method: 'GET',
    endpoint: `${apiPaths.quotation.getById}/${quotationId}`,
  });
};

/**
 * Accept quotation
 */
export const acceptQuotation = (quotationId: string) => {
  return ApiService({
    method: 'PUT',
    endpoint: `${apiPaths.quotation.accept}/${quotationId}/accepted`,
  });
};

/**
 * Reject quotation
 */
export const rejectQuotation = (quotationId: string) => {
  return ApiService({
    method: 'PUT',
    endpoint: `${apiPaths.quotation.reject}/${quotationId}/rejected`,
  });
};

/**
 * Negotiate quotation
 */
export const negotiateQuotation = (quotationId: string) => {
  return ApiService({
    method: 'PUT',
    endpoint: `${apiPaths.quotation.negotiate}/${quotationId}/negotiate`,
  });
};

export const quotationApi = {
  getAllQuotations,
  getQuotationById,
  acceptQuotation,
  rejectQuotation,
  negotiateQuotation
};
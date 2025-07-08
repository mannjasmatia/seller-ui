import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "../api/invoice";

/**
 * Custom hook for getting invoice details
 */
export const useGetInvoiceDetailsApi = (invoiceToken: string) => {
  return useQuery({
    queryKey: ["getInvoiceDetails", invoiceToken],
    queryFn: () => invoiceApi.getInvoiceDetails(invoiceToken),
    enabled: !!invoiceToken,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};


/**
 * Custom hook for generating invoice
 */
export const useGenerateInvoiceApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      quotationId: string;
      negotiatedPrice: number;
      paymentTerms?: string;
      deliveryTerms?: string;
      taxAmount?: number;
      shippingCharges?: number;
      notes?: string;
    }) => invoiceApi.generateInvoice(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["getChats"] });
      queryClient.invalidateQueries({ queryKey: ["getChatMessages"] });
      queryClient.invalidateQueries({ queryKey: ["getQuotations"] });
      queryClient.invalidateQueries({ queryKey: ["getQuotationById"] });
      // queryClient.invalidateQueries({ queryKey: ["getSellerInvoices"] });
    },
  });
};

// ========= UNUSED

/**
 * Custom hook for getting seller invoices
 */
export const useGetSellerInvoicesApi = (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
}) => {
  return useQuery({
    queryKey: ["getSellerInvoices", params],
    queryFn: () => invoiceApi.getSellerInvoices(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Custom hook for getting invoice by ID
 */
export const useGetInvoiceByIdApi = (invoiceId: string) => {
  return useQuery({
    queryKey: ["getInvoiceById", invoiceId],
    queryFn: () => invoiceApi.getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};


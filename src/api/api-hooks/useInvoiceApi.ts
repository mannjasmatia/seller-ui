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




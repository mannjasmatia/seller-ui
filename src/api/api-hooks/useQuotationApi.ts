import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api/quotation";

/**
 * Custom hook for getting all quotations
 */
export const useGetQuotationsApi = (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'negotiation';
  search?: string;
  productIds?: string[];
  seen?: boolean;
}) => {
  return useQuery({
    queryKey: ["getQuotations", params],
    queryFn: () => quotationApi.getAllQuotations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Custom hook for getting quotation by ID
 */
export const useGetQuotationByIdApi = (quotationId: string) => {
  return useQuery({
    queryKey: ["getQuotationById", quotationId],
    queryFn: () => quotationApi.getQuotationById(quotationId),
    enabled: !!quotationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Custom hook for accepting quotation
 */
export const useAcceptQuotationApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quotationId: string) => quotationApi.acceptQuotation(quotationId),
    onSuccess: () => {
      // Invalidate and refetch quotations data
      queryClient.invalidateQueries({ queryKey: ["getQuotations"] });
      queryClient.invalidateQueries({ queryKey: ["getQuotationById"] });
    },
  });
};

/**
 * Custom hook for rejecting quotation
 */
export const useRejectQuotationApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quotationId: string) => quotationApi.rejectQuotation(quotationId),
    onSuccess: () => {
      // Invalidate and refetch quotations data
      queryClient.invalidateQueries({ queryKey: ["getQuotations"] });
      queryClient.invalidateQueries({ queryKey: ["getQuotationById"] });
    },
  });
};

/**
 * Custom hook for negotiating quotation
 */
export const useNegotiateQuotationApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quotationId: string) => quotationApi.negotiateQuotation(quotationId),
    onSuccess: () => {
      // Invalidate and refetch quotations data
      queryClient.invalidateQueries({ queryKey: ["getQuotations"] });
      queryClient.invalidateQueries({ queryKey: ["getQuotationById"] });
    },
  });
};
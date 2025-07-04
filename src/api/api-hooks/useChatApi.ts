import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chat";

/**
 * Custom hook for getting all chats
 */
export const useGetChatsApi = (params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'cancelled';
}) => {
  return useQuery({
    queryKey: ["getChats", params],
    queryFn: () => chatApi.getAllChats(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Custom hook for getting chat messages
 */
export const useGetChatMessagesApi = (chatId: string, params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["getChatMessages", chatId, params],
    queryFn: () => chatApi.getChatMessages(chatId, params),
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Custom hook for getting chat by ID
 */
export const useGetChatByIdApi = (chatId: string) => {
  return useQuery({
    queryKey: ["getChatById", chatId],
    queryFn: () => chatApi.getChatById(chatId),
    enabled: !!chatId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Custom hook for uploading media
 */
export const useUploadMediaApi = () => {
  return useMutation({
    mutationFn: (files: FormData) => chatApi.uploadMedia(files),
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
    }) => chatApi.generateInvoice(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["getChats"] });
      queryClient.invalidateQueries({ queryKey: ["getChatMessages"] });
      queryClient.invalidateQueries({ queryKey: ["getSellerInvoices"] });
    },
  });
};

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
    queryFn: () => chatApi.getSellerInvoices(params),
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
    queryFn: () => chatApi.getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};
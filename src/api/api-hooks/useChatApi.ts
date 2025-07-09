import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { chatApi } from "../api/chat";

/**
 * Custom hook for getting all chats with infinite scroll
 */
export const useGetChatsApi = {
  queryFn: (params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'completed' | 'cancelled';
    search?: string;
  }) => chatApi.getAllChats(params),
  
  useInfinite: (params?: {
    status?: 'active' | 'completed' | 'cancelled';
    search?: string;
  }) => {
    return useInfiniteQuery({
      queryKey: ["getChats", params],
      queryFn: ({ pageParam = 1 }) => {
        return chatApi.getAllChats({
          page: pageParam,
          limit: 20,
          ...params
        });
      },
      getNextPageParam: (lastPage) => {
        const response = lastPage?.data?.response;
        return response?.hasNext ? response.page + 1 : undefined;
      },
      initialPageParam: 1,
    });
  }
};

/**
 * Custom hook for getting chat messages with infinite scroll
 */
export const useGetChatMessagesApi = {
  queryFn: (chatId: string, params?: {
    page?: number;
    limit?: number;
  }) => chatApi.getChatMessages(chatId, params),
  
  useInfinite: (chatId: string, params?: {
    limit?: number;
  }) => {
    return useInfiniteQuery({
      queryKey: ["getChatMessages", chatId, params],
      queryFn: ({ pageParam = 1 }) => {
        if (!chatId) return Promise.resolve(null);
        return chatApi.getChatMessages(chatId, {
          page: pageParam,
          limit: params?.limit || 20
        });
      },
      getNextPageParam: (lastPage) => {
        const response = lastPage?.data?.response;
        return response?.pagination?.hasMore ? (response.pagination.page + 1) : undefined;
      },
      initialPageParam: 1,
      enabled: !!chatId,
    });
  }
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
 * Custom hook for downloading media
 */
export const useDownloadMediaApi = () => {
  return useMutation({
    mutationFn: (fileName: string) => chatApi.downloadMedia(fileName),
  });
};
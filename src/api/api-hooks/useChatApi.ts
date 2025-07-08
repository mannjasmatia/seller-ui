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
    // staleTime: 2 * 60 * 1000, // 2 minutes
    // gcTime: 5 * 60 * 1000, // 5 minutes
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
    // staleTime: 30 * 1000, // 30 seconds
    // gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Custom hook for getting chat by ID
 */
// export const useGetChatByIdApi = (chatId: string) => {
//   return useQuery({
//     queryKey: ["getChatById", chatId],
//     queryFn: () => chatApi.getChatById(chatId),
//     enabled: !!chatId,
//     staleTime: 1 * 60 * 1000, // 1 minute
//     gcTime: 3 * 60 * 1000, // 3 minutes
//   });
// };

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
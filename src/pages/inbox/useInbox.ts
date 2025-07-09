import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { useGetChatsApi, useGetChatMessagesApi, useUploadMediaApi } from "../../api/api-hooks/useChatApi";
import { Chat, ChatMessage, MediaFile } from "./type.inbox";
import { customToast } from "../../toast-config/customToast";
import useSocket from "../../custom-hooks/useSocket";
import { useGenerateInvoiceApi } from "../../api/api-hooks/useInvoiceApi";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useInboxChat = () => {
  const language = useSelector((state: RootState) => state.language?.value)["inboxChat"];

  // State
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [typingStatusByChat, setTypingStatusByChat] = useState<Record<string, boolean | string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [quotationDetailModalOpen, setQuotationDetailModalOpen] = useState(false);
  const [messageRetryQueue, setMessageRetryQueue] = useState(new Map());
  const [imageModalData, setImageModalData] = useState({
    isOpen: false,
    images: [] as MediaFile[],
    currentIndex: 0,
  });
  const [readyToFetchMore, setReadyToFetchMore] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedChatRef = useRef<Chat | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatsObserverRef = useRef<IntersectionObserver | null>(null);
  const messagesObserverRef = useRef<IntersectionObserver | null>(null);
  const chatsLoadMoreRef = useRef<HTMLDivElement>(null);
  const messagesLoadMoreRef = useRef<HTMLDivElement>(null);
  // new ref to maintain position
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const isFirstLoad = useRef<boolean>(true);
  

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Infinite query for chats
  const {
    data: chatsData,
    fetchNextPage: fetchNextChatsPage,
    hasNextPage: hasNextChatsPage,
    isFetchingNextPage: isFetchingNextChatsPage,
    isLoading: isLoadingChats,
    isError: isChatsError,
    refetch: refetchChats,
  } = useInfiniteQuery({
    queryKey: ["getChats", debouncedSearch, statusFilter],
    queryFn: ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        limit: 9,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      return useGetChatsApi.queryFn(params);
    },
    getNextPageParam: (lastPage) => {
      const response = lastPage?.data?.response;
      return response?.hasNext ? response.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Infinite query for messages
  const {
    data: messagesData,
    fetchNextPage: fetchNextMessagesPage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage,
    isPending: isLoadingMessages,
    refetch: refetchMessages,
  } = useInfiniteQuery({
    queryKey: ["getChatMessages", selectedChat?._id],
    queryFn: ({ pageParam = 1 }) => {
      if (!selectedChat?._id) return Promise.resolve(null);
      return useGetChatMessagesApi.queryFn(selectedChat._id, {
        page: pageParam,
        limit: 30,
      });
    },
    getNextPageParam: (lastPage) => {
      const response = lastPage?.data?.response;
      return response?.pagination?.hasMore ? response.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!selectedChat?._id,
  });

  const { mutate: uploadMedia, isPending: isUploading } = useUploadMediaApi();

  const { mutate: generateInvoice, isPending: isGeneratingInvoice } = useGenerateInvoiceApi();

  // Socket integration
  const {
    connectionStatus,
    connect,
    disconnect,
    sendMessage: socketSendMessage,
    startTyping: socketStartTyping,
    stopTyping: socketStopTyping,
    openChat: socketOpenChat,
    switchChat: socketSwitchChat,
    setEventHandlers,
    reconnect,
  } = useSocket();

  // Update refs
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Update chats from infinite query
  useEffect(() => {
    if (chatsData?.pages) {
      const allChats = chatsData.pages.flatMap((page) => page?.data?.response?.docs || []);
      setChats(allChats);
    }
  }, [chatsData]);

  // Extract data
  const chatContext = messagesData?.pages?.[0]?.data?.response?.chatContext;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  // Utility functions
  const scrollToBottom = useCallback((behavior: "auto" | "smooth" = "auto") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: "end",
        inline: "nearest",
      });
    }
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getTimeAgo = useCallback((dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 2880) return "Yesterday";
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, GIF, WebP)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  }, []);

  // Intersection Observer for chats infinite scroll
  useEffect(() => {
    if (chatsObserverRef.current) {
      chatsObserverRef.current.disconnect();
    }

    chatsObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextChatsPage && !isFetchingNextChatsPage) {
          fetchNextChatsPage();
        }
      },
      { threshold: 0.8 }
    );

    if (chatsLoadMoreRef.current) {
      chatsObserverRef.current.observe(chatsLoadMoreRef.current);
    }

    return () => {
      if (chatsObserverRef.current) {
        chatsObserverRef.current.disconnect();
      }
    };
  }, [chats, hasNextChatsPage, isFetchingNextChatsPage, fetchNextChatsPage]);

  // Intersection Observer for messages infinite scroll (reverse)
  useEffect(() => {
    if (messagesObserverRef.current) {
      messagesObserverRef.current.disconnect();
    }

    messagesObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextMessagesPage &&
          !isFetchingNextMessagesPage &&
          !isLoadingMessages &&
          readyToFetchMore &&
          messagesData?.pages &&
          messagesData.pages.length > 0
        ) {
          console.log("Fetching next messages page...");

          // Store current scroll height before fetching
          if (messagesContainerRef.current) {
            previousScrollHeight.current = messagesContainerRef.current.scrollHeight;
          }

          // Disable further fetching until this one completes
          setReadyToFetchMore(false);

          fetchNextMessagesPage();
        }
      },
      {
        threshold: 1.0, // Reduce threshold to prevent too early triggering
        // rootMargin: "px", // Increase margin
      }
    );

    if (messagesLoadMoreRef.current && readyToFetchMore) {
      messagesObserverRef.current.observe(messagesLoadMoreRef.current);
    }

    return () => {
      if (messagesObserverRef.current) {
        messagesObserverRef.current.disconnect();
      }
    };
  }, [
    hasNextMessagesPage,
    isFetchingNextMessagesPage,
    fetchNextMessagesPage,
    isLoadingMessages,
    readyToFetchMore,
    messagesData?.pages,
  ]);

  // Socket event handlers
  useEffect(() => {
    setEventHandlers({
      onMessageReceived: (message: ChatMessage) => {
        const currentSelectedChat = selectedChatRef.current;
        console.log("Message received:", message);

        // Only add message to current chat if it's the selected chat
        if (currentSelectedChat?._id === message.chat) {
          setMessages((prev) => [...prev, message]);
          // Scroll to bottom when receiving new message
          setTimeout(() => scrollToBottom("smooth"), 100);
        }

        // Update chat list with new message
        setChats((prev) => {
          const updatedChats = prev.map((chat) => {
            if (chat._id === message.chat) {
              // Emit openChat only if this is the currently selected chat
              if (currentSelectedChat?._id === message.chat) {
                socketOpenChat(chat._id, chat.otherUser._id);
              }

              console.log("Updating chat:", chat._id);
              return {
                ...chat,
                lastMessage: message,
                lastMessageAt: message.createdAt,
                hasUnread: currentSelectedChat?._id !== message.chat,
              };
            }
            return chat;
          });

          // Move updated chat to top
          const chatToMove = updatedChats.find((chat) => chat._id === message.chat);
          const otherChats = updatedChats.filter((chat) => chat._id !== message.chat);
          return chatToMove ? [chatToMove, ...otherChats] : updatedChats;
        });
      },

      onMessageSent: (data) => {
        console.log("Message sent confirmation:", data);
        setMessages((prev) =>
          prev.map((msg) => (msg.timestamp === data.timestamp ? { ...msg, status: "sent" } : msg))
        );
        setTimeout(scrollToBottom, 100);
      },

      onMessageDelivered: (data) => {
        console.log("Message delivered confirmation:", data);
        setMessages((prev) =>
          prev.map((msg) => (msg.timestamp === data.timestamp ? { ...msg, status: "sent" } : msg))
        );
      },

      onMessageFailed: (data) => {
        console.log("Message failed:", data);
        setMessages((prev) =>
          prev.map((msg) => (msg.timestamp === data.timestamp ? { ...msg, status: "failed" } : msg))
        );
        setMessageRetryQueue((prev) => new Map(prev.set(data.timestamp, data)));
        customToast.error("Failed to send message");
      },

      onChatOpened: ({ chatId }) => {
        console.log("Chat opened by other user:", chatId);

        const currentSelectedChat = selectedChatRef.current;
        if (currentSelectedChat?._id === chatId) {
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.chat === chatId && msg.senderModel.toLowerCase() === "seller") {
                return { ...msg, seen: true };
              }
              return msg;
            });
          });
        }
      },

      onStartTyping: ({ chatId, senderId }) => {
        console.log("User started typing:", { chatId, senderId });

        const currentSelectedChat = selectedChatRef.current;
        if (currentSelectedChat?._id === chatId) {
          setTypingUsers((prev) => new Set([...prev, senderId]));
        }
        setTypingStatusByChat((prev) => ({ ...prev, [chatId]: true }));
      },

      onStopTyping: ({ chatId, senderId }) => {
        console.log("User stopped typing:", { chatId, senderId });

        const currentSelectedChat = selectedChatRef.current;
        if (currentSelectedChat?._id === chatId) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(senderId);
            return newSet;
          });
        }
        setTypingStatusByChat((prev) => {
          const updated = { ...prev };
          delete updated[chatId];
          return updated;
        });
      },

      onImageUploadStart: ({ chatId }) => {
        const currentSelectedChat = selectedChatRef.current;
        if (currentSelectedChat?._id === chatId) {
          setTypingStatusByChat((prev) => ({ ...prev, [chatId]: "Uploading images..." }));
        }
      },

      onImageUploadComplete: ({ chatId }) => {
        const currentSelectedChat = selectedChatRef.current;
        if (currentSelectedChat?._id === chatId) {
          setTypingStatusByChat((prev) => {
            const updated = { ...prev };
            delete updated[chatId];
            return updated;
          });
        }
      },
    });
  }, [setEventHandlers, socketOpenChat]);

  // Initialize socket connection
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat && messagesData?.pages) {

      // Store current scroll position before updating messages
      const container = messagesContainerRef.current;
      const wasAtBottom = container
        ? container.scrollHeight - container.scrollTop - container.clientHeight < 50
        : false;

      let allMessages: ChatMessage[] = [];
      messagesData.pages.forEach((page) => {
        allMessages = [...(page?.data?.response?.messages as ChatMessage[]), ...allMessages];
      });

      setMessages(allMessages);

      // Handle scrolling based on whether this is first load or infinite scroll
      if (isFirstLoad.current && messagesData.pages.length === 1) {
        // First load - scroll to bottom
        setTimeout(() => {
          scrollToBottom("auto");
          setTimeout(() => {
            setReadyToFetchMore(true);
            isFirstLoad.current = false;
          }, 100);
        }, 50);
      } else if (messagesData.pages.length > 1 && container) {
        // Infinite scroll - preserve scroll position
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const heightDifference = newScrollHeight - previousScrollHeight.current;

            // Maintain relative scroll position
            container.scrollTop = container.scrollTop + heightDifference;

            // Update the previous scroll height
            previousScrollHeight.current = newScrollHeight;

            // Allow more fetching after position is preserved
            setTimeout(() => {
              setReadyToFetchMore(true);
            }, 100);
          }
        }, 50);
      } else if (wasAtBottom) {
        // If user was at bottom, keep them at bottom (for new messages)
        setTimeout(() => scrollToBottom("smooth"), 100);
      } else {
        // For other cases, just enable fetching
        setReadyToFetchMore(true);
      }
    }
  }, [selectedChat, messagesData, scrollToBottom]);

  // Heartbeat to keep chat alive
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout;

    const currentSelectedChat = selectedChatRef.current;

    if (currentSelectedChat?._id && currentSelectedChat?.otherUser?._id) {
      heartbeatInterval = setInterval(() => {
        const chat = selectedChatRef.current;

        if (chat?._id && chat?.otherUser?._id) {
          socketOpenChat(chat._id, chat.otherUser._id);
        }
      }, 2000); // Every 2 seconds like in JS code
    }

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };
  }, [selectedChat?._id, socketOpenChat]);

  // Chat handlers
  const selectChat = useCallback(
    (chat: Chat) => {
      if (selectedChat?._id === chat?._id) return;

      setSelectedChat(chat);
      setMessages([]);
      setTypingUsers(new Set());
      setReadyToFetchMore(false);

      // Reset scroll management state
      isFirstLoad.current = true;
      previousScrollHeight.current = 0;

      if (connectionStatus.isConnected) {
        socketSwitchChat(chat._id);
        console.log(`Switched to chat: ${chat._id}`);
        socketOpenChat(chat._id, chat.otherUser._id);

        setChats((prev) => prev.map((c) => (c._id === chat._id ? { ...c, hasUnread: false } : c)));
      }

      refetchMessages();
    },
    [connectionStatus.isConnected, socketSwitchChat, socketOpenChat, refetchMessages, selectedChat?._id]
  );

  // Stop typing - Define this first since it's used by other functions
  const stopTyping = useCallback(() => {
    const currentSelectedChat = selectedChatRef.current;

    if (currentSelectedChat && connectionStatus.isConnected) {
      setIsTyping(false);
      const recipientId = currentSelectedChat.otherUser._id;
      console.log("User stopped typing:", recipientId);
      socketStopTyping(currentSelectedChat._id, recipientId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [connectionStatus.isConnected, socketStopTyping]);

  // Message handlers
  const handleTyping = useCallback(
    (value: string) => {
      setNewMessage(value);

      // If message becomes empty, stop typing immediately
      if (!value.trim()) {
        stopTyping();
        return;
      }

      // Start typing if not already typing
      if (!isTyping && selectedChat && connectionStatus.isConnected) {
        setIsTyping(true);
        const recipientId = selectedChat.otherUser._id;
        console.log("User is typing:", recipientId);
        socketStartTyping(selectedChat._id, recipientId);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    },
    [isTyping, selectedChat, connectionStatus.isConnected, socketStartTyping, stopTyping]
  );

  const uploadImages = useCallback(async (): Promise<MediaFile[]> => {
    if (selectedImages.length === 0) return [];

    setUploadError(null);

    try {
      const formData = new FormData();
      selectedImages.forEach((image) => {
        if (image.file) {
          formData.append("files", image.file);
        }
      });

      return new Promise((resolve, reject) => {
        uploadMedia(formData, {
          onSuccess: (response) => {
            const uploadedImages = response.data.files || [];
            setSelectedImages([]);
            resolve(uploadedImages);
          },
          onError: (error) => {
            setUploadError("Failed to upload images. Please try again.");
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload images. Please try again.");
      throw error;
    }
  }, [selectedImages, uploadMedia]);

  const sendMessage = useCallback(async () => {
    if (
      (!newMessage.trim() && selectedImages.length === 0) ||
      !selectedChat ||
      !connectionStatus.isConnected
    ) {
      return;
    }

    const timestamp = Date.now();
    let uploadedImages: MediaFile[] = [];

    try {
      // Upload images if any
      if (selectedImages.length > 0) {
        if (selectedChat) {
          setTypingStatusByChat((prev) => ({ ...prev, [selectedChat._id]: "Uploading images..." }));
        }
        uploadedImages = await uploadImages();

        if (selectedChat) {
          setTypingStatusByChat((prev) => {
            const updated = { ...prev };
            delete updated[selectedChat._id];
            return updated;
          });
        }
      }

      const messageData = {
        chatId: selectedChat._id,
        content: newMessage.trim(),
        receiverId: selectedChat.otherUser._id,
        timestamp,
        media: uploadedImages,
        messageType: uploadedImages.length > 0 ? ("image" as const) : ("text" as const),
      };

      const localMessage: ChatMessage = {
        _id: `temp-${timestamp}`,
        chat: selectedChat._id,
        senderId: "seller1",
        senderModel: "seller",
        content: newMessage.trim(),
        messageType: uploadedImages.length > 0 ? "image" : "text",
        media: uploadedImages,
        isRead: false,
        seen: false,
        createdAt: new Date().toISOString(),
        status: "sending",
        timestamp,
      };

      console.log("Sending message with media:", messageData);
      setMessages((prev) => [...prev, localMessage]);

      // Update chat list with new message
      setChats((prev) => {
        const updatedChats = prev.map((chat) => {
          if (chat._id === selectedChat._id) {
            return {
              ...chat,
              lastMessage: localMessage,
              lastMessageAt: localMessage.createdAt,
              hasUnread: false,
            };
          }
          return chat;
        });

        const currentChatUpdated = updatedChats.find((chat) => chat._id === selectedChat._id);
        const otherChats = updatedChats.filter((chat) => chat._id !== selectedChat._id);

        return currentChatUpdated ? [currentChatUpdated, ...otherChats] : updatedChats;
      });

      socketSendMessage(messageData);
      setNewMessage("");
      stopTyping();

      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom("smooth"), 100);
    } catch (error) {
      console.error("Failed to send message with images:", error);
      setUploadError("Failed to send message. Please try again.");
    }
  }, [
    newMessage,
    selectedImages,
    selectedChat,
    connectionStatus.isConnected,
    uploadImages,
    socketSendMessage,
    stopTyping,
    scrollToBottom,
  ]);

  // Retry failed message
  const retryMessage = useCallback(
    (timestamp: number) => {
      const messageToRetry = messageRetryQueue.get(timestamp);
      if (messageToRetry && connectionStatus.isConnected) {
        console.log("Retrying message:", messageToRetry);

        setMessages((prev) =>
          prev.map((msg) => (msg.timestamp === timestamp ? { ...msg, status: "sending" } : msg))
        );

        socketSendMessage(messageToRetry);
        setMessageRetryQueue((prev) => {
          const newQueue = new Map(prev);
          newQueue.delete(timestamp);
          return newQueue;
        });
      }
    },
    [messageRetryQueue, connectionStatus.isConnected, socketSendMessage]
  );

  // Image handlers
  const handleFileSelect = useCallback(
    (files: FileList) => {
      const validFiles: MediaFile[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          const imageData: MediaFile = {
            url: URL.createObjectURL(file),
            type: "image",
            name: file.name,
            size: file.size,
            file: file as any,
          };
          validFiles.push(imageData);
        }
      });

      if (errors.length > 0) {
        setUploadError(errors.join("\n"));
      } else {
        setUploadError(null);
      }

      setSelectedImages((prev) => [...prev, ...validFiles]);
    },
    [validateFile]
  );

  const removeImage = useCallback((index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      if (newImages[index].url && newImages[index].url.startsWith("blob:")) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const clearImages = useCallback(() => {
    setSelectedImages((prev) => {
      prev.forEach((image) => {
        if (image.url && image.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.url);
        }
      });
      return [];
    });
    setUploadError(null);
  }, []);

  // Image modal functions
  const openImageModal = useCallback((images: MediaFile[], startIndex = 0) => {
    setImageModalData({
      isOpen: true,
      images,
      currentIndex: startIndex,
    });
  }, []);

  const closeImageModal = useCallback(() => {
    setImageModalData({
      isOpen: false,
      images: [],
      currentIndex: 0,
    });
  }, []);

  const nextImage = useCallback(() => {
    setImageModalData((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  }, []);

  const prevImage = useCallback(() => {
    setImageModalData((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.images.length - 1,
    }));
  }, []);

  // Invoice handlers
  const handleGenerateInvoice = useCallback(
    (invoiceData: {
      negotiatedPrice: number;
      paymentTerms?: string;
      deliveryTerms?: string;
      taxAmount?: number;
      shippingCharges?: number;
      notes?: string;
    }) => {
      if (!selectedChat?.quotationDetails?._id) {
        customToast.error("No quotation found for this chat");
        return;
      }

      const data = {
        quotationId: selectedChat.quotationDetails?._id,
        ...invoiceData,
      };

      generateInvoice(data, {
        onSuccess: (response) => {
          customToast.success("Invoice generated successfully");
          setSelectedChat({...selectedChat,phase:'invoice_sent'})
          setIsInvoiceModalOpen(false);
        },
        onError: (error: any) => {
          customToast.error(error?.response?.data?.message || "Failed to generate invoice");
        },
      });
    },
    [selectedChat, generateInvoice, refetchChats, refetchMessages]
  );

  // Modal handlers
  const openInvoiceModal = useCallback(() => {
    setIsInvoiceModalOpen(true);
  }, []);

  const closeInvoiceModal = useCallback(() => {
    setIsInvoiceModalOpen(false);
  }, []);

  const openQuotationDetail = useCallback(() => {
    setQuotationDetailModalOpen(true);
  }, []);

  const closeQuotationDetail = useCallback(() => {
    setQuotationDetailModalOpen(false);
  }, []);

  // Check if can generate invoice
  const canGenerateInvoice = useCallback(() => {
    return selectedChat?.phase === "negotiation" || selectedChat?.phase === "invoice_rejected";
  }, [selectedChat?.phase, chatContext?.hasActiveInvoice]);

  // Get invoice status
  const getInvoiceStatus = useCallback(() => {
    if (chatContext?.hasActiveInvoice) {
      return {
        hasInvoice: true,
        status: chatContext.invoiceStatus,
        canUpdate: chatContext.canSendInvoice,
      };
    }
    return { hasInvoice: false, status: null, canUpdate: false };
  }, [chatContext]);

  // Load chats function (similar to JS version)
  const loadChats = useCallback(async () => {
    try {
      console.log("Loading chats...");
      await refetchChats();
    } catch (error) {
      console.error("Failed to load chats:", error);
      customToast.error("Failed to load chats");
    }
  }, [refetchChats]);

  // Load messages function
  const loadMessages = useCallback(
    async (chatId: string) => {
      try {
        console.log("Loading messages for chat:", chatId);
        await refetchMessages();
      } catch (error) {
        console.error("Failed to load messages:", error);
        customToast.error("Failed to load messages");
      }
    },
    [refetchMessages]
  );

  // Get typing status for a specific chat
  const getTypingStatusForChat = useCallback(
    (chatId: string) => {
      return typingStatusByChat[chatId];
    },
    [typingStatusByChat]
  );

  // Filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleStatusFilterChange = useCallback((status: "all" | "active" | "completed" | "cancelled") => {
    setStatusFilter(status);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, []);

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        if (image.url && image.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [selectedImages]);

  return {
    // Data
    chats,
    selectedChat,
    messages,
    newMessage,
    selectedImages,
    typingUsers,
    typingStatusByChat,
    chatContext,
    imageModalData,

    // State
    isTyping,
    uploadError,
    isInvoiceModalOpen,
    quotationDetailModalOpen,
    messageRetryQueue,

    // Filter state
    searchQuery,
    statusFilter,
    debouncedSearch,

    // Loading states
    isLoadingChats,
    isLoadingMessages,
    isUploading,
    isGeneratingInvoice,
    isFetchingNextChatsPage,
    isFetchingNextMessagesPage,
    hasNextChatsPage,
    hasNextMessagesPage,

    readyToFetchMore,

    // Error states
    isChatsError,

    // Connection
    connectionStatus,

    // Refs
    messagesEndRef,
    fileInputRef,
    chatsLoadMoreRef,
    messagesLoadMoreRef,
    messagesContainerRef,

    // Handlers
    selectChat,
    handleTyping,
    sendMessage,
    retryMessage,
    handleFileSelect,
    removeImage,
    clearImages,
    uploadImages,
    handleGenerateInvoice,
    openInvoiceModal,
    closeInvoiceModal,
    openQuotationDetail,
    closeQuotationDetail,
    loadChats,
    loadMessages,
    refetchChats,
    refetchMessages,
    setUploadError,
    stopTyping,
    reconnect,

    // Filter handlers
    handleSearchChange,
    handleStatusFilterChange,
    clearFilters,

    // Image modal handlers
    openImageModal,
    closeImageModal,
    nextImage,
    prevImage,

    // Infinite scroll handlers
    fetchNextChatsPage,
    fetchNextMessagesPage,

    // Utilities
    formatTime,
    getTimeAgo,
    canGenerateInvoice,
    getInvoiceStatus,
    scrollToBottom,
    validateFile,
    getTypingStatusForChat,

    // Language
    language,
  };
};

import { useState, useCallback, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ConnectionStatus, MediaFile } from '../pages/inbox/type.inbox';

interface SocketEventHandlers {
  onMessageReceived?: (message: ChatMessage) => void;
  onMessageSent?: (data: { chatId: string; status: string; timestamp: number; messageId: string; media?: MediaFile[] }) => void;
  onMessageDelivered?: (data: { chatId: string; timestamp: number; status: string; hasImages?: boolean }) => void;
  onMessageFailed?: (data: { chatId: string; timestamp: number; status: string; error: string }) => void;
  onChatOpened?: (data: { chatId: string }) => void;
  onStartTyping?: (data: { chatId: string; senderId: string }) => void;
  onStopTyping?: (data: { chatId: string; senderId: string }) => void;
  onImageUploadStart?: (data: { chatId: string; senderId: string }) => void;
  onImageUploadComplete?: (data: { chatId: string; senderId: string }) => void;
}

interface SendMessageData {
  chatId: string;
  content: string;
  receiverId: string;
  timestamp: number;
  media?: MediaFile[];
  messageType?: 'text' | 'image';
}

const useSocket = (url?: string) => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    isConnected: false
  });
  
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<SocketEventHandlers>({});
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    console.log('🔌 Seller connecting to socket server...', SOCKET_URL);
    
    setConnectionStatus({
      status: 'connecting',
      isConnected: false
    });
    
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: reconnectDelay.current
    });
    
    // Setup core event listeners
    newSocket.on('connect', () => {
      console.log('✅ Seller socket connected');
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000;
      setConnectionStatus({
        status: 'connected',
        isConnected: true
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Seller socket disconnected:', reason);
      setConnectionStatus({
        status: 'disconnected',
        isConnected: false
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔥 Seller socket connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setConnectionStatus({
          status: 'error',
          isConnected: false
        });
      } else {
        // Exponential backoff
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000);
        setConnectionStatus({
          status: 'connecting',
          isConnected: false
        });
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Seller socket reconnected after', attemptNumber, 'attempts');
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000;
      setConnectionStatus({
        status: 'connected',
        isConnected: true
      });
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Seller socket reconnection attempt', attemptNumber);
      setConnectionStatus({
        status: 'connecting',
        isConnected: false
      });
    });

    newSocket.on('reconnect_failed', () => {
      console.log('❌ Seller socket reconnection failed');
      setConnectionStatus({
        status: 'error',
        isConnected: false
      });
    });

    // Setup message event listeners
    newSocket.on('messageReceived', (message: ChatMessage) => {
      console.log('📨 Seller message received:', message);
      handlersRef.current.onMessageReceived?.(message);
    });

    newSocket.on('messageSent', (data) => {
      console.log('✅ Seller message sent confirmation:', data);
      handlersRef.current.onMessageSent?.(data);
    });

    newSocket.on('messageDelivered', (data) => {
      console.log('📬 Seller message delivered confirmation:', data);
      handlersRef.current.onMessageDelivered?.(data);
    });

    newSocket.on('messageFailed', (data) => {
      console.log('❌ Seller message failed:', data);
      handlersRef.current.onMessageFailed?.(data);
    });

    newSocket.on('chatOpened', (data) => {
      console.log('👁️ Chat opened by buyer:', data);
      handlersRef.current.onChatOpened?.(data);
    });

    newSocket.on('startTyping', (data) => {
      console.log('⌨️ Buyer started typing:', data);
      handlersRef.current.onStartTyping?.(data);
    });

    newSocket.on('stopTyping', (data) => {
      console.log('🛑 Buyer stopped typing:', data);
      handlersRef.current.onStopTyping?.(data);
    });

    newSocket.on('image_upload_start', (data) => {
      console.log('📤 Buyer image upload started:', data);
      handlersRef.current.onImageUploadStart?.(data);
    });

    newSocket.on('image_upload_complete', (data) => {
      console.log('✅ Buyer image upload completed:', data);
      handlersRef.current.onImageUploadComplete?.(data);
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('🔥 Socket error:', error);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;
    return newSocket;
  }, [SOCKET_URL]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting seller socket...');
      socketRef.current.disconnect();
      setSocket(null);
      socketRef.current = null;
      setConnectionStatus({
        status: 'disconnected',
        isConnected: false
      });
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      console.log(`📤 Seller emitting ${event}:`, data);
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn('⚠️ Seller socket not connected, cannot emit:', event, {
      hasSocket: !!socketRef.current,
      socketConnected: socketRef.current?.connected
    });
    return false;
  }, []);

  const sendMessage = useCallback((data: SendMessageData) => {
    return emit('sendMessage', data);
  }, [emit]);

  const startTyping = useCallback((chatId: string, recipientId: string) => {
    return emit('userTyping', { chatId, receipentId: recipientId });
  }, [emit]);

  const stopTyping = useCallback((chatId: string, recipientId: string) => {
    return emit('userStoppedTyping', { chatId, receipentId: recipientId });
  }, [emit]);

  const openChat = useCallback((chatId: string, receiverId: string) => {
    return emit('openChat', { chatId, receiverId });
  }, [emit]);

  const switchChat = useCallback((chatId: string) => {
    return emit('switchChat', { chatId });
  }, [emit]);

  const markAsRead = useCallback((chatId: string) => {
    return emit('markAsRead', { chatId });
  }, [emit]);

  const setEventHandlers = useCallback((handlers: SocketEventHandlers) => {
    handlersRef.current = { ...handlersRef.current, ...handlers };
  }, []);

  // Auto reconnect with exponential backoff
  const reconnect = useCallback(() => {
    if (connectionStatus.status === 'error' || connectionStatus.status === 'disconnected') {
      console.log('🔄 Manual reconnection attempt...');
      disconnect();
      setTimeout(() => {
        connect();
      }, 1000);
    }
  }, [connectionStatus.status, disconnect, connect]);

  // Health check
  const healthCheck = useCallback(() => {
    if (socketRef.current?.connected) {
      return emit('ping', { timestamp: Date.now() });
    }
    return false;
  }, [emit]);

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Health check interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (connectionStatus.isConnected) {
      interval = setInterval(() => {
        healthCheck();
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [connectionStatus.isConnected, healthCheck]);

  return {
    socket,
    connectionStatus,
    connect,
    disconnect,
    reconnect,
    emit,
    sendMessage,
    startTyping,
    stopTyping,
    openChat,
    switchChat,
    markAsRead,
    setEventHandlers,
    healthCheck
  };
};

export default useSocket;
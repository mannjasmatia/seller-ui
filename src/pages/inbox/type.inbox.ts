export interface ChatMessage {
  _id: string;
  chat: string;
  senderId: string;
  senderModel: 'seller' | 'buyer';
  content: string;
  messageType: 'text' | 'image' | 'quotation_created' | 'quotation_accepted' | 'quotation_rejected' | 'link';
  media?: MediaFile[];
  isRead: boolean;
  seen: boolean;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  timestamp?: number;
  quotationId?: {
    _id: string;
    quantity: number;
    deadline: string;
    minPrice?: number;
    maxPrice?: number;
    description?: string;
    status: string;
  };
  businessContext?: {
    isSystemMessage: boolean;
    isBusinessAction: boolean;
    actionType?: string;
    actionData?: {
      title?: string;
      description?: string;
      amount?: number;
      invoiceId?: string;
      orderId?: string;
      quotationId?: string;
    };
  };
}

export interface MediaFile {
  url: string;
  type: 'image';
  name: string;
  file?: File;
  size?: number;
  compressed?: boolean;
  compressionRatio?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  s3Key?: string;
  originalName?: string;
}

export interface Chat {
  _id: string;
  buyer: string;
  seller: string;
  status: 'active' | 'completed' | 'cancelled';
  phase: 'negotiation' | 'invoice_sent' | 'invoice_accepted' | 'invoice_rejected' | 'order_created' | 'completed';
  createdAt: string;
  updatedAt: string;
  hasUnread: boolean;
  isRead?: boolean;
  lastMessage?: ChatMessage;
  lastMessageAt?: string;
  
  // Enhanced data
  activeInvoice?: {
    status: string;
    createdAt: string;
    amount: number;
  };
  
  order?: {
    orderId: string;
    status: string;
    finalPrice: number;
  };
  
  quotationDetails?: {
    _id: string;
    quantity: number;
    minPrice: number;
    maxPrice: number;
    status: string;
    deadline?: string;
    description?: string;
    attributes?: Array<{
      field: string;
      value: string;
      _id?: string;
    }>;
    productId?: string;
    state?: string;
    pinCode?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  
  product?: {
    _id: string;
    name: string;
    image: string;
    images?: string[];
    category?: string;
    description?: string;
  };
  
  otherUser: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
  };
}

export interface ChatContext {
  phase: string;
  status: string;
  quotationId: string;
  hasActiveInvoice: boolean;
  invoiceStatus?: string;
  hasOrder: boolean;
  
  // Action permissions for current user
  canSendInvoice: boolean;
  canAcceptInvoice: boolean;
  canRejectInvoice: boolean;
  canUpdateOrder: boolean;
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  isConnected: boolean;
  lastConnected?: string;
  reconnectAttempts?: number;
}

export interface TypingUser {
  userId: string;
  chatId: string;
  timestamp: number;
}

export interface Invoice {
  _id: string;
  quotationId: string;
  sellerId: string;
  chatId: string;
  negotiatedPrice: number;
  totalAmount: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  taxAmount?: number;
  shippingCharges?: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  expiresAt: string;
}

export interface Order {
  _id: string;
  orderId: string;
  chatId: string;
  quotationId: string;
  invoiceId: string;
  buyerId: string;
  sellerId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  finalPrice: number;
  quantity: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
    country?: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  _id: string;
  slug: string;
  buyer: string;
  seller: string;
  productId?: string;
  quantity: number;
  deadline: string;
  description?: string;
  attributes: Array<{
    field: string;
    value: string;
  }>;
  status: 'sent' | 'in-progress' | 'accepted' | 'rejected';
  minPrice: number;
  maxPrice: number;
  state: string;
  pinCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  role: 'buyer' | 'seller';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Buyer extends User {
  fullName: string;
  phoneNumber: string;
  city: string;
  state: string;
  memberId?: string;
  profilePic?: string;
  loginAttempts: number;
  blockExpires: string;
}

export interface Seller extends User {
  companyName: string;
  phone: string;
  businessType: string;
  businessNumber: string;
  workTimingsFrom?: string;
  workTimingsTo?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isTwoFaEnabled: boolean;
  twoFaSecret?: string;
  profileImage?: string;
  city: string;
  state: string;
}

export interface SocketEvent {
  event: string;
  data: any;
  timestamp: number;
  chatId?: string;
  userId?: string;
}

export interface MessageRetryData {
  chatId: string;
  content: string;
  receiverId: string;
  timestamp: number;
  media?: MediaFile[];
  messageType?: 'text' | 'image' | 'link';
  attempts: number;
  lastAttempt: number;
}

export interface ChatFilters {
  status?: 'active' | 'completed' | 'cancelled';
  phase?: 'negotiation' | 'invoice_sent' | 'invoice_accepted' | 'invoice_rejected' | 'order_created' | 'completed';
  hasUnread?: boolean;
  search?: string;
}

export interface MessageFilters {
  messageType?: 'text' | 'image' | 'quotation_created' | 'quotation_accepted' | 'quotation_rejected' | 'link';
  dateFrom?: string;
  dateTo?: string;
  hasMedia?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  response: T;
  message?: string;
}

export interface ChatListResponse {
  docs: Chat[];
  total: number;
  limit: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MessageListResponse {
  messages: ChatMessage[];
  chatContext: ChatContext;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface UploadResponse {
  files: MediaFile[];
  summary?: {
    totalFiles: number;
    totalSizeSaved: number;
    averageCompression: number;
  };
}

export interface InvoiceGenerationData {
  quotationId: string;
  negotiatedPrice: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  taxAmount?: number;
  shippingCharges?: number;
  notes?: string;
}

export interface NotificationSettings {
  messageNotifications: boolean;
  invoiceNotifications: boolean;
  orderNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

export interface ChatSettings {
  autoMarkAsRead: boolean;
  showTypingIndicators: boolean;
  showReadReceipts: boolean;
  messageRetentionDays: number;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: number;
  retryable?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// Utility types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';
export type ChatPhase = 'negotiation' | 'invoice_sent' | 'invoice_accepted' | 'invoice_rejected' | 'order_created' | 'completed';
export type ChatStatus = 'active' | 'completed' | 'cancelled';
export type UserRole = 'buyer' | 'seller';
export type MediaType = 'image';
export type MessageType = 'text' | 'image' | 'quotation_created' | 'quotation_accepted' | 'quotation_rejected';

// Event types for socket communication
export type SocketEventType = 
  | 'messageReceived'
  | 'messageSent'
  | 'messageDelivered'
  | 'messageFailed'
  | 'chatOpened'
  | 'startTyping'
  | 'stopTyping'
  | 'userTyping'
  | 'userStoppedTyping'
  | 'image_upload_start'
  | 'image_upload_complete'
  | 'switchChat'
  | 'openChat'
  | 'markAsRead'
  | 'connect'
  | 'disconnect'
  | 'connect_error'
  | 'reconnect'
  | 'reconnect_attempt'
  | 'reconnect_failed';
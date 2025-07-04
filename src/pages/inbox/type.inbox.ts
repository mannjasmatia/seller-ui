export interface ChatMessage {
  _id: string;
  chat: string;
  senderId: string;
  senderModel: 'seller' | 'buyer';
  content: string;
  messageType: 'text' | 'image' | 'quotation_created' | 'quotation_accepted' | 'quotation_rejected';
  media?: MediaFile[];
  isRead: boolean;
  seen: boolean;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  timestamp?: number;
  businessContext?: {
    isSystemMessage: boolean;
    isBusinessAction: boolean;
    actionType?: string;
    actionData?: any;
  };
}

export interface MediaFile {
  url: string;
  type: 'image';
  name: string;
  file:any;
  size?: number;
  compressed?: boolean;
  compressionRatio?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  s3Key?: string;
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
  
  quotation?: {
    _id: string;
    quantity: number;
    priceRange: {
      min: number;
      max: number;
    };
    status: string;
  };
  
  product?: {
    name: string;
    image: string;
  };
  
  otherUser: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
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
  status: 'connected' | 'disconnected' | 'error' | "connecting";
  isConnected: boolean;
}

export interface TypingUser {
  userId: string;
  chatId: string;
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
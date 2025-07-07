export interface OrdersState {
  selectedOrder: Order | null;
  filters: OrderFilters;
  pagination: OrderPagination;
  isDetailModalOpen: boolean;
  isStatusModalOpen: boolean;
  isCancelModalOpen: boolean;
}

export interface OrderFilters {
  status: string;
  searchQuery: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Order {
  _id: string;
  orderId: string;
  status: OrderStatus;
  finalPrice: number;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  buyer: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    profilePic?: string;
    companyName?: string;
  };
  product: {
    _id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    specifications?: any;
  };
  quotation: {
    _id: string;
    quantity: number;
    quotedPrice?: number;
    validUntil?: string;
    requirements?: string;
    createdAt: string;
  };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };
  invoice: {
    _id: string;
    negotiatedPrice: number;
    taxAmount?: number;
    shippingCharges?: number;
    paymentTerms?: string;
    deliveryTerms?: string;
    createdAt: string;
  };
  chat: {
    _id: string;
    phase: string;
    status: string;
  };
  canTransitionTo?: OrderStatus[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface StatusUpdateFormData {
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface CancelOrderFormData {
  cancellationReason?: string;
}
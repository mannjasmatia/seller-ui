export interface QuotationAttribute {
  field: string;
  value: string;
}

export interface Quotation {
  _id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiation';
  quantity: number;
  minPrice: number;
  maxPrice: number;
  attributes: QuotationAttribute[];
  deadline: string;
  description: string;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Product info
  productName: string;
  productImage: string;
  
  // Buyer info
  buyerName: string;
  buyerProfilePic?: string;
  buyerAvatar?: string;
  
  // Chat and business logic info
  chatPhase?: string;
  chatId?: string;
  
  // Invoice info
  hasActiveInvoice: boolean;
  invoiceStatus?: string;
  invoiceAmount?: number;
  
  // Order info
  hasOrder: boolean;
  orderId?: string;
  orderStatus?: string;
  
  // Business status derived from phase
  businessStatus: string;
}

export interface QuotationDetail extends Quotation {
  state: string;
  pinCode: string;
  productImages: string[];
  
  // Enhanced chat and business info
  activeInvoice?: {
    _id: string;
    status: string;
    amount: number;
    negotiatedPrice: number;
    createdAt: string;
  };
  
  order?: {
    _id: string;
    orderId: string;
    status: string;
    finalPrice: number;
    createdAt: string;
  };
  
  // Action flags
  canCreateInvoice: boolean;
  canUpdateInvoice: boolean;
  canUpdateOrder: boolean;
}

export interface QuotationFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'negotiation' | '';
  seen?: boolean | '';
  search?: string;
  page: number;
  limit: number;
}

export interface QuotationResponse {
  docs: Quotation[];
  hasPrev: boolean;
  hasNext: boolean;
  totalPages: number;
}
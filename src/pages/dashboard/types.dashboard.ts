export interface Product {
  id: string;
  name: string;
}

export interface FilterState {
  selectedProducts: string[];
  timeGranularity: string;
  customFromDate: string;
  customToDate: string;
}

// src/pages/products/types.products.ts
export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isVerified?: boolean;
  inComplete?: boolean;
  categories?: string[];
  sortBy?: 'mostViewed' | 'mostQuoted' | 'mostAcceptedQuotations' | 'mostRejectedQuotations' | 'mostPopular' | 'bestseller';
  createdAt?: -1 | 1;
}

export interface ProductDoc {
  _id: string;
  id?: string;
  name: string;
  isVerified: boolean;
  avgRating: number;
  images: string[];
  minPrice?: number;
  maxPrice?: number;
  deliveryDays: number;
  isCustomizable: boolean;
  moq: number;
  createdAt: string;
  isComplete: boolean;
  completionPercentage: number;
  incompleteSteps: string[];
  viewCount?: number;
  quotationCount?: number;
  acceptedQuotationCount?: number;
  rejectedQuotationCount?: number;
  categoryName?: string;
}

export interface ProductsResponse {
  docs: ProductDoc[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}
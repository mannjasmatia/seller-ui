export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string[];
  isVerified?: boolean;
  inComplete?: boolean;
  sortBy?: 'mostViewed' | 'mostQuoted' | 'mostAcceptedQuotations' | 'mostRejectedQuotations' | 'mostPopular' | 'bestseller';
  createdAt?: -1 | 1;
}

export interface Product {
  _id: string;
  name: string;
  avgRating: number;
  isVerified: boolean;
  minPrice: number;
  maxPrice: number;
  moq: number;
  deliveryDays: number;
  isCustomizable: boolean;
  isComplete: boolean;
  completionPercentage: number;
  incompleteSteps: string[];
  createdAt: string;
  images: string[];
  categoryName: string;
}

export interface ProductsResponse {
  docs: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface Product {
  _id: string;
  name: string;
  avgRating: number;
  isVerified: boolean;
  minPrice: number;
  maxPrice: number;
  moq: number;
  deliveryDays: number;
  isCustomizable: boolean;
  isComplete: boolean;
  completionPercentage: number;
  incompleteSteps: string[];
  createdAt: string;
  images: string[];
  categoryName: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface ProductFilters {
  categories?: string[];
  isVerified?: boolean;
  inComplete?: boolean;
  sortBy?: 'mostViewed' | 'mostQuoted' | 'mostAcceptedQuotations' | 'mostRejectedQuotations' | 'mostPopular' | 'bestseller';
  createdAt?: -1 | 1;
}

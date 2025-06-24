// src/pages/AddProduct/types.add-product.ts

export interface Category {
  _id: string;
  name: string;
}

export interface ProductInfo {
  name: string;
  categoryId: string;
  about: string[];
  moq?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  response?: T;
  message?: string;
}
// src/pages/EditProduct/types.edit-product.ts

export interface Category {
  _id: string;
  name: string;
}

export interface ProductInfo {
  name: string;
  categoryId: string;
  about: string[];
  moq: number;
}

export interface ProductAttribute {
  field: string;
  value: string;
}

export interface ProductAttributeGroup {
  name: string;
  attributes: ProductAttribute[];
}

export interface QuantityPriceTier {
  min: number;
  max?: number;
  price: number;
}

export interface LeadTime {
  min: number;
  max?: number;
  days: number;
}

export interface ProductPricing {
  minPrice: number;
  maxPrice: number;
  quantityPriceTiers: QuantityPriceTier[];
  leadTime: LeadTime[];
}

export interface ProductVariation {
  field: string;
  values: string[];
}

export interface CustomizableOption {
  option: string;
  quantity?: number;
}

export interface ProductVariations {
  variations: ProductVariation[];
  customizableOptions: CustomizableOption[];
}

export interface ProductDescriptionAttribute {
  field: string;
  value: string;
  _id?: string;
}

export interface ProductDescription {
  points: string[];
  attributes: ProductDescriptionAttribute[];
  images: string[]; // Existing images (file names)
  newFiles?: File[]; // New files to be uploaded
  originalImages?: string[]; // Track original images for comparison
}

export interface Product {
  _id?: string;
  name: string;
  slug?: string;
  categoryId: string;
  about: string[];
  images: string[];
  services: string[];
  moq: number;
  completionPercentage: number;
  incompleteSteps: ProductStep[];
  stepStatus: StepStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductStep =
  | "productInfo"
  | "attributes"
  | "images"
  | "pricing"
  | "variations"
  | "services"
  | "description";

export interface StepStatus {
  productInfo: boolean;
  attributes: boolean;
  images: boolean;
  pricing: boolean;
  variations: boolean;
  services: boolean;
  description: boolean;
}

export interface ProductImagesData {
  images: string[]; // Current images (existing ones to keep)
  originalImages: string[]; // Original images from backend
  newFiles: File[]; // New files to be uploaded
}

export interface ProductFormData {
  productInfo: ProductInfo;
  attributes: ProductAttributeGroup[];
  images: ProductImagesData;
  pricing: ProductPricing;
  variations: ProductVariations;
  services: string[];
  description: ProductDescription;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  response?: T;
  message?: string;
}

export interface ProductInfoResponse {
  name: string;
  slug: string;
  categoryId: string;
  about: string[];
  moq: number;
  completionPercentage: number;
  incompleteSteps: ProductStep[];
  stepStatus: StepStatus;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}
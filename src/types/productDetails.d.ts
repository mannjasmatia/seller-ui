import { Seller } from "./seller";


export interface ProductAttribute {
  _id:string;
  field: string;
  value: string;
}

export interface ProductAttributeGroup {
  _id: string;
  productId: string;
  name: string;
  attributes: ProductAttribute[];
}

export interface Variation {
  field: string;
  values: string[];
}

export interface QuantityPriceTier {
  min: number;
  max?: number; // Optional for open-ended range (e.g., 101+)
  price: number;
}

export interface LeadTime {
  min: number;
  max: number;
  unit: string; // e.g., "days"
}

export interface Pricing {
  quantityPriceTiers: QuantityPriceTier[];
  leadTime: LeadTime;
}

export interface CustomizableOption {
  option: string;
  quantity: number;
}

export interface ProductStats {
  viewCount: number;
  quotationCount: number;
  acceptedQuotationCount: number;
  rejectedQuotationCount: number;
  inProgressQuotationCount: number;
  popularityScore: number;
  bestsellerScore: number;
}

export interface ProductDetailsInfo {
  _id: string;
  name: string;
  categoryId:string;
  isCustomizable: boolean;
  slug: string;
  avgRating: number;
  ratingsCount: number;
  isVerified: boolean;
  images: string[];
  about: string[];
  services: string[];
  deliveryDays: number;
  seller: Seller;
  customizableOptions: CustomizableOption[];
  pricing: Pricing;
  moq: number;
  variations: Variation[];
  stats: ProductStats;
  productAttributes: ProductAttributeGroup[];
  isLiked: boolean;
}

// Product Description 
export interface ProductAttribute {
  _id: string;
  field: string;
  value: string;
}

export interface ProductDescription {
  _id: string;
  productId: string;
  points: string[];
  attributes: ProductAttribute[];
  images: string[];
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
}

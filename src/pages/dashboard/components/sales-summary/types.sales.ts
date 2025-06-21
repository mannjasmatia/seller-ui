// types/salesSummary.types.ts

export interface SalesData {
  totalProductShipped: string;
  inProgress: string;
  totalProductViewed: string;
  totalQuotationReceived: string;
  totalOrderAccepted: string;
  totalOrderRejected: string;
  popularityScore: number;
}

export interface PopularityDataItem {
  name: string;
  value: number;
  color: string;
}

export interface SalesSummaryCard {
  id: string;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
  size: 'large' | 'small';
  colspan?: number;
  action: string;
}

export interface SalesSummaryApiResponse {
  success: boolean;
  data: SalesData;
  message?: string;
  timestamp: string;
}

export interface SalesSummaryError {
  message: string;
  code: string;
  details?: string;
}

export type NavigationType = 
  | 'shipped' 
  | 'inProgress' 
  | 'viewed' 
  | 'quotation' 
  | 'accepted' 
  | 'rejected';

export interface SalesSummaryTranslations {
  totalProductShipped: string;
  inProgress: string;
  popularityScore: string;
  totalProductViewed: string;
  totalQuotationReceived: string;
  totalOrderAccepted: string;
  totalOrderRejected: string;
  viewMore: string;
  loading: string;
  error: string;
  retry: string;
  refreshData: string;
  navigationError: string;
}

export interface SalesSummaryHookReturn {
  salesData: SalesData;
  popularityData: PopularityDataItem[];
  translations: SalesSummaryTranslations;
  isLoading: boolean;
  isError: boolean;
  error: any;
  handleViewMore: (type: NavigationType) => void;
  refreshData: () => void;
}
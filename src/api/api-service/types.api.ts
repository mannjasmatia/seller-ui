export interface ApiResponse {
  docs: any[];
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  currentPage: number;
  totalDocs: number;
}


export interface AnalyticsQueryParams {
  products: string[];
  from: string;
  to: string;
  granularity: 'days' | 'weeks' | 'months' | 'years';
  type?: 'salesAmount' | 'salesCount' | 'profit';
}

export interface PerformanceQueryParams {
  products: string[];
  from: string;
  to: string;
  granularity: 'days' | 'weeks' | 'months' | 'years';
  type?: 'bestsellerScore' | 'popularityScore' | 'quotationsSent' | 'quotationsAccepted' | 'quotationsRejected' | 'quotationsInProgress';
}

export interface PerformanceSummaryParams {
  products: string[];
  from: string;
  to: string;
}

export interface AnalyticsResponse {
  x: string[];
  y: number[];
}

export interface PerformanceSummaryResponse {
  totalViews: number;
  totalQuotationsSent: number;
  totalQuotationsAccepted: number;
  totalQuotationsRejected: number;
  totalQuotationsInProgress: number;
  totalPopularityScore: number;
  totalBestsellerScore: number;
  averagePopularityScore: number;
  averageBestsellerScore: number;
  quotationToViewRatio: number;
  acceptanceRate: number;
  rejectionRate: number;
  inProgressRate: number;
  productsAnalyzed: number;
  dateRange: {
    from: string;
    to: string;
    totalDays: number;
  };
  engagementMetrics: {
    viewsPerDay: string;
    quotationsPerDay: string;
    avgViewsPerProduct: string;
    avgQuotationsPerProduct: string;
  };
}

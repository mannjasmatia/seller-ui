// src/api/api/analytics.ts
import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";
import { AnalyticsQueryParams, AnalyticsResponse, PerformanceQueryParams, PerformanceSummaryParams, PerformanceSummaryResponse } from "../api-service/types.api";

export const getProductAnalytics = async (params: AnalyticsQueryParams): Promise<AnalyticsResponse> => {
  const response = await ApiService({
    method: 'POST',
    endpoint: apiPaths.analytics.getAnalytics,
    data: params,
  });
  return response.data.response;
};

export const getProductPerformance = async (params: PerformanceQueryParams): Promise<AnalyticsResponse> => {
  const response = await ApiService({
    method: 'POST',
    endpoint: apiPaths.performance.getPerformance,
    data: params,
  });
  return response.data.response;
};

export const getPerformanceSummary = async (params: PerformanceSummaryParams): Promise<PerformanceSummaryResponse> => {
  const response = await ApiService({
    method: 'POST',
    endpoint: apiPaths.performance.getSummary,
    data: params,
  });
  return response.data.response;
};


// src/api/api-hooks/useAnalyticsApi.ts
import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from "../api/analyticsPerformance";
import { AnalyticsQueryParams, PerformanceQueryParams, PerformanceSummaryParams } from '../api-service/types.api';
import { validateFromToDate } from '../../utils/validateFromToDate';

export const useProductAnalyticsApi = (params: AnalyticsQueryParams, enabled: boolean = true) => {
    const {isValid} = validateFromToDate(params.from, params.to)
  return useQuery({
    queryKey: ['product-analytics', params],
    queryFn: () => analyticsApi.getProductAnalytics(params),
    enabled: enabled && params?.products.length>0 && !!(params.from && params.to && params.granularity) && isValid ,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // select: (data: any) => data?.data?.response,
  });
};

export const useProductPerformanceApi = (params: PerformanceQueryParams, enabled: boolean = true) => {
    const {isValid} = validateFromToDate(params.from, params.to)
  return useQuery({
    queryKey: ['product-performance', params],
    queryFn: () => analyticsApi.getProductPerformance(params),
    enabled: enabled && params?.products.length>0 && !!(params.from && params.to && params.granularity) && isValid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // select: (data: any) => data?.data?.response,
  });
};

export const usePerformanceSummaryApi = (params: PerformanceSummaryParams, enabled: boolean = true) => {
    const {isValid} = validateFromToDate(params.from, params.to)
  return useQuery({
    queryKey: ['performance-summary', params],
    queryFn: () => analyticsApi.getPerformanceSummary(params),
    enabled: enabled && params?.products.length>0 && !!(params.from && params.to) && isValid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // select: (data: any) => data?.data?.response
  });
};
// src/pages/dashboard/components/sales-summary/useSalesSummary.ts
import { useCallback, useMemo } from 'react';
import { customToast } from '../../../../toast-config/customToast';
import translations from '../../translations.json';
import { FilterState } from '../../types.dashboard';
import moment from 'moment';
import { useProductsApi } from '../../../../api/api-hooks/useProductApi';
import { usePerformanceSummaryApi } from '../../../../api/api-hooks/useAnalyticsPerformanceApi';

// Types
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

interface UseSalesSummaryProps {
  filterState: FilterState;
  selectedProductIds: string[];
}

export const useSalesSummary = ({ filterState, selectedProductIds }: UseSalesSummaryProps) => {
  // Calculate date range based on filter state
  const { from, to } = useMemo(() => {
    const today = moment();
    
    if (filterState.timeGranularity === 'custom' && filterState.customFromDate && filterState.customToDate) {
      return {
        from: filterState.customFromDate,
        to: filterState.customToDate
      };
    }

    // Calculate date range based on granularity
    switch (filterState.timeGranularity) {
      case 'this-week':
        return {
          from: today.clone().startOf('week').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD')
        };
      case 'this-month':
        return {
          from: today.clone().startOf('month').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD')
        };
      case 'this-year':
        return {
          from: today.clone().startOf('year').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD')
        };
      case 'last-2-years':
        return {
          from: today.clone().subtract(2, 'years').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD')
        };
      case 'last-5-years':
        return {
          from: today.clone().subtract(5, 'years').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD')
        };
      default: // all-time
        return {
          from: moment('2020-01-01').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD')
        };
    }
  }, [filterState]);

  // Get performance summary data
  const { 
    data: performanceData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = usePerformanceSummaryApi({
    products: selectedProductIds,
    from,
    to
  });

  // Transform API data to sales data format
  const salesData: SalesData = useMemo(() => {
    if (!performanceData) {
      return {
        totalProductShipped: '0',
        inProgress: '0',
        totalProductViewed: '0',
        totalQuotationReceived: '0',
        totalOrderAccepted: '0',
        totalOrderRejected: '0',
        popularityScore: 0,
      };
    }

    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    return {
      totalProductShipped: formatNumber(performanceData.totalQuotationsAccepted), // Assuming accepted = shipped
      inProgress: formatNumber(performanceData.totalQuotationsInProgress),
      totalProductViewed: formatNumber(performanceData.totalViews),
      totalQuotationReceived: formatNumber(performanceData.totalQuotationsSent),
      totalOrderAccepted: formatNumber(performanceData.totalQuotationsAccepted),
      totalOrderRejected: formatNumber(performanceData.totalQuotationsRejected),
      popularityScore: Math.round(performanceData.averagePopularityScore),
    };
  }, [performanceData]);

  // Popularity chart data
  const popularityData: PopularityDataItem[] = useMemo(() => [
    {
      name: 'Popular',
      value: salesData.popularityScore,
      color: '#dc2626', // cb-red
    },
    {
      name: 'Remaining',
      value: 100 - salesData.popularityScore,
      color: '#e5e7eb', // gray-200
    },
  ], [salesData.popularityScore]);

  // Handle view more clicks with dynamic navigation
  const handleViewMore = useCallback((type: string) => {
    const actions = {
      shipped: () => {
        customToast.info(translations.dashboard.navigation?.shipped || 'Navigating to shipped products...');
        // Add router.push('/products/shipped') or navigation logic
      },
      inProgress: () => {
        customToast.info(translations.dashboard.navigation?.inProgress || 'Navigating to in-progress orders...');
        // Add router.push('/orders/in-progress') or navigation logic
      },
      viewed: () => {
        customToast.info(translations.dashboard.navigation?.viewed || 'Navigating to product analytics...');
        // Add router.push('/analytics/products') or navigation logic
      },
      quotation: () => {
        customToast.info(translations.dashboard.navigation?.quotation || 'Navigating to quotations...');
        // Add router.push('/quotations') or navigation logic
      },
      accepted: () => {
        customToast.info(translations.dashboard.navigation?.accepted || 'Navigating to accepted orders...');
        // Add router.push('/orders/accepted') or navigation logic
      },
      rejected: () => {
        customToast.info(translations.dashboard.navigation?.rejected || 'Navigating to rejected orders...');
        // Add router.push('/orders/rejected') or navigation logic
      },
    };

    const action = actions[type as keyof typeof actions];
    if (action) {
      action();
    } else {
      customToast.error(`Unknown navigation type: ${type}`);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    salesData,
    popularityData,
    translations,
    isLoading,
    isError,
    error,
    handleViewMore,
    handleRefresh,
  };
};

export default useSalesSummary;
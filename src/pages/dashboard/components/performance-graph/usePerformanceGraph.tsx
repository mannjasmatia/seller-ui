// src/pages/dashboard/components/performance-graph/usePerformanceGraph.tsx
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FilterState } from '../../types.dashboard';
import moment from 'moment';
import { useProductPerformanceApi } from '../../../../api/api-hooks/useAnalyticsPerformanceApi';
import { trimZeroValues } from '../../../../utils/trimZeroValues';

interface PerformanceData {
  period: string;
  performance: number;
}

interface PerformanceMetrics {
  current: number;
  peak: number;
  averageGrowth: number;
  trend: 'up' | 'down' | 'stable';
}

interface GranularityInfo {
  granularity: 'days' | 'weeks' | 'months' | 'years';
  days: number;
}

interface UsePerformanceGraphProps {
  filterState: FilterState;
  selectedProductIds: string[];
  performanceType?: 'popularityScore' | 'bestsellerScore' | 'quotationsSent' | 'quotationsAccepted' | 'quotationsRejected' | 'quotationsInProgress';
}

export const usePerformanceGraph = ({ 
  filterState, 
  selectedProductIds, 
  performanceType = 'popularityScore' 
}: UsePerformanceGraphProps) => {
  
  // Calculate date range and granularity based on filter state
  const { from, to, granularity } = useMemo(() => {
    const today = moment();
    
    if (filterState.timeGranularity === 'custom' && filterState.customFromDate && filterState.customToDate) {
      const fromDate = moment(filterState.customFromDate);
      const toDate = moment(filterState.customToDate);
      const diffDays = toDate.diff(fromDate, 'days');
      
      let autoGranularity: 'days' | 'weeks' | 'months' | 'years';
      if (diffDays <= 7) autoGranularity = 'days';
      else if (diffDays <= 90) autoGranularity = 'weeks';
      else if (diffDays <= 730) autoGranularity = 'months';
      else autoGranularity = 'years';
      
      return {
        from: filterState.customFromDate,
        to: filterState.customToDate,
        granularity: autoGranularity
      };
    }

    // Calculate date range and granularity based on time period
    switch (filterState.timeGranularity) {
      case 'this-week':
        return {
          from: today.clone().startOf('week').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'days' as const
        };
      case 'this-month':
        return {
          from: today.clone().startOf('month').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'weeks' as const
        };
      case 'this-year':
        return {
          from: today.clone().startOf('year').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'months' as const
        };
      case 'last-2-years':
        return {
          from: today.clone().subtract(2, 'years').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'months' as const
        };
      case 'last-5-years':
        return {
          from: today.clone().subtract(5, 'years').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'years' as const
        };
      default: // all-time
        return {
          from: moment('2020-01-01').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'months' as const
        };
    }
  }, [filterState]);

  // Get performance data from API
  const { 
    data: apiData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useProductPerformanceApi({
    products: selectedProductIds,
    from,
    to,
    granularity,
    type: performanceType
  });

  // Transform API data to chart format
  const chartData: PerformanceData[] = useMemo(() => {
    if (!apiData?.x || !apiData?.y) {
      return [];
    }

    const {x:trimmedX,y:trimmedY}= trimZeroValues(apiData?.x, apiData?.y)
    
    apiData.x = trimmedX;
    apiData.y = trimmedY;

    return apiData.x.map((period, index) => ({
      period,
      performance: apiData.y[index] || 0
    }));
  }, [apiData]);

  // Calculate granularity info for display
  const granularityInfo = useMemo((): GranularityInfo | null => {
    if (filterState.timeGranularity === 'custom' && filterState.customFromDate && filterState.customToDate) {
      const fromDate = moment(filterState.customFromDate);
      const toDate = moment(filterState.customToDate);
      const diffDays = toDate.diff(fromDate, 'days') + 1;
      
      let autoGranularity: 'days' | 'weeks' | 'months' | 'years';
      if (diffDays <= 7) autoGranularity = 'days';
      else if (diffDays <= 90) autoGranularity = 'weeks';
      else if (diffDays <= 730) autoGranularity = 'months';
      else autoGranularity = 'years';
      
      return {
        granularity: autoGranularity,
        days: diffDays
      };
    }
    return null;
  }, [filterState.timeGranularity, filterState.customFromDate, filterState.customToDate]);

  // Calculate performance metrics
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    if (chartData.length === 0) {
      return { current: 0, peak: 0, averageGrowth: 0, trend: 'stable' };
    }

    const values = chartData.map(d => d.performance);
    const current = values[values.length - 1];
    const peak = Math.max(...values);
    
    // Calculate average growth rate
    let totalGrowth = 0;
    let growthPoints = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) { // Avoid division by zero
        const growth = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
        totalGrowth += growth;
        growthPoints++;
      }
    }
    
    const averageGrowth = growthPoints > 0 ? totalGrowth / growthPoints : 0;
    
    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (averageGrowth > 1) trend = 'up';
    else if (averageGrowth < -1) trend = 'down';
    
    return {
      current,
      peak,
      averageGrowth,
      trend
    };
  }, [chartData]);

  // Utility functions
  const formatValue = (value: number, short: boolean = false): string => {
    if (short && value >= 1000) {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return {
    chartData,
    performanceMetrics,
    isLoading,
    isError,
    error,
    granularityInfo,
    formatValue,
    getTrendIcon,
    getTrendColor,
    refetch,
  };
};

export default usePerformanceGraph;
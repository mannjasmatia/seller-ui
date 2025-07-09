// src/pages/dashboard/components/useProductsBarChart.ts
import { useMemo } from 'react';
import moment from 'moment';
import { FilterState } from '../../types.dashboard';
import { useProductAnalyticsApi } from '../../../../api/api-hooks/useAnalyticsPerformanceApi';
import { trimZeroValues } from '../../../../utils/trimZeroValues';

interface UseProductsBarChartProps {
  filterState: FilterState;
  selectedProductIds: string[];
  type: 'products' | 'profit';
}

export const useProductsBar = ({ filterState, selectedProductIds, type }: UseProductsBarChartProps) => {
  // Calculate date range and granularity based on filter state
  const { from, to, granularity, analyticsType } = useMemo(() => {
    const today = moment();
    
    // Determine analytics type based on chart type
    const analyticsType = type === 'products' ? 'salesCount' : 'profit';
    
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
        granularity: autoGranularity,
        analyticsType
      };
    }

    // Calculate date range and granularity based on time period
    switch (filterState.timeGranularity) {
      case 'this-week':
        return {
          from: today.clone().startOf('week').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'days' as const,
          analyticsType
        };
      case 'this-month':
        return {
          from: today.clone().startOf('month').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'weeks' as const,
          analyticsType
        };
      case 'this-year':
        return {
          from: today.clone().startOf('year').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'months' as const,
          analyticsType
        };
      case 'last-2-years':
        return {
          from: today.clone().subtract(2, 'years').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'months' as const,
          analyticsType
        };
      case 'last-5-years':
        return {
          from: today.clone().subtract(5, 'years').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'years' as const,
          analyticsType
        };
      default: // all-time
        return {
          from: moment('2020-01-01').format('YYYY-MM-DD'),
          to: today.format('YYYY-MM-DD'),
          granularity: 'months' as const,
          analyticsType
        };
    }
  }, [filterState, type]);

  // Get analytics data from API
  const { 
    data: apiData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useProductAnalyticsApi({
    products: selectedProductIds,
    from,
    to,
    granularity,
    type: analyticsType as 'salesAmount' | 'salesCount' | 'profit'
  });

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!apiData?.x || !apiData?.y) {
      return [];
    }


    const dataKey = type === 'products' ? 'productsSold' : 'profit';

    const {x:trimmedX,y:trimmedY}= trimZeroValues(apiData?.x, apiData?.y)

    apiData.x = trimmedX;
    apiData.y = trimmedY;

    return apiData.x.map((period:any, index:any) => ({
      period,
      [dataKey]: apiData.y[index] || 0
    }));


  }, [apiData, type]);

  return {
    chartData,
    isLoading,
    isError,
    error,
    refetch,
    dataKey: type === 'products' ? 'productsSold' : 'profit'
  };
};

export default useProductsBar;
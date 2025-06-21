// usePerformanceGraph.ts
import { useMemo, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FilterState } from '../../types.dashboard';

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

export const usePerformanceGraph = (filterState: FilterState) => {
  const [isLoading, setIsLoading] = useState(false);

  // Simulate API loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [filterState]);

  // Function to calculate optimal granularity based on date range
  const calculateGranularity = (fromDate: Date, toDate: Date): 'days' | 'weeks' | 'months' | 'years' => {
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'days';
    if (diffDays <= 90) return 'weeks';
    if (diffDays <= 730) return 'months';
    return 'years';
  };

  // Function to generate date periods based on granularity
  const generateDatePeriods = (
    fromDate: Date, 
    toDate: Date, 
    granularity: 'days' | 'weeks' | 'months' | 'years'
  ): string[] => {
    const periods: string[] = [];
    const current = new Date(fromDate);
    
    switch (granularity) {
      case 'days':
        while (current <= toDate) {
          periods.push(current.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }));
          current.setDate(current.getDate() + 1);
        }
        break;
        
      case 'weeks':
        while (current <= toDate) {
          const weekStart = new Date(current);
          const weekEnd = new Date(current);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          if (weekEnd > toDate) weekEnd.setTime(toDate.getTime());
          
          periods.push(`${weekStart.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })} - ${weekEnd.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}`);
          
          current.setDate(current.getDate() + 7);
        }
        break;
        
      case 'months':
        while (current <= toDate) {
          periods.push(current.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          }));
          current.setMonth(current.getMonth() + 1);
        }
        break;
        
      case 'years':
        while (current <= toDate) {
          periods.push(current.getFullYear().toString());
          current.setFullYear(current.getFullYear() + 1);
        }
        break;
    }
    
    return periods;
  };

  // Generate performance seed based on period for consistent random data
  const generatePerformanceSeed = (period: string, index: number): number => {
    const periodHash = period.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Use a combination of hash and index for more realistic progression
    const seed = Math.abs(periodHash) + index * 123;
    return (seed % 1000) / 1000;
  };

  // Mock data generation with realistic growth patterns
  const generateMockData = (periods: string[]): PerformanceData[] => {
    let baseValue = 1000;
    const growthTrend = 0.1; // 10% average growth trend
    
    return periods.map((period, index) => {
      const seed = generatePerformanceSeed(period, index);
      const randomFactor = (seed - 0.5) * 0.4; // ±20% random variation
      const growthFactor = 1 + (growthTrend * index / periods.length) + randomFactor;
      
      baseValue = Math.max(100, baseValue * growthFactor);
      
      return {
        period,
        performance: Math.round(baseValue)
      };
    });
  };

  // Calculate granularity info for display
  const granularityInfo = useMemo((): GranularityInfo | null => {
    if (filterState.timeGranularity === 'custom' && filterState.customFromDate && filterState.customToDate) {
      const fromDate = new Date(filterState.customFromDate);
      const toDate = new Date(filterState.customToDate);
      const autoGranularity = calculateGranularity(fromDate, toDate);
      const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        granularity: autoGranularity,
        days: diffDays
      };
    }
    return null;
  }, [filterState.timeGranularity, filterState.customFromDate, filterState.customToDate]);

  // Generate chart data based on filters
  const chartData = useMemo((): PerformanceData[] => {
    // Handle custom date range
    if (filterState.timeGranularity === 'custom' && filterState.customFromDate && filterState.customToDate) {
      const fromDate = new Date(filterState.customFromDate);
      const toDate = new Date(filterState.customToDate);
      const autoGranularity = calculateGranularity(fromDate, toDate);
      const periods = generateDatePeriods(fromDate, toDate, autoGranularity);
      
      return generateMockData(periods);
    }

    // Predefined data for standard time periods
    const dataTemplates: { [key: string]: { periods: string[], baseValues: number[] } } = {
      'all-time': {
        periods: ['January', 'February', 'March', 'April', 'May'],
        baseValues: [1000, 2500, 3200, 4000, 5500]
      },
      'this-week': {
        periods: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        baseValues: [4800, 5200, 4900, 5100, 5400, 5800, 6200]
      },
      'this-month': {
        periods: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        baseValues: [4200, 4600, 5100, 5500]
      },
      'this-year': {
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        baseValues: [3800, 4100, 4400, 4700, 5000, 5300, 5600, 5900, 6200, 6500, 6800, 7100]
      },
      'last-2-years': {
        periods: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4'],
        baseValues: [3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000]
      },
      'last-5-years': {
        periods: ['2020', '2021', '2022', '2023', '2024'],
        baseValues: [2000, 2800, 3600, 4400, 5200]
      },
    };

    const template = dataTemplates[filterState.timeGranularity] || dataTemplates['all-time'];
    
    return template.periods.map((period, index) => ({
      period,
      performance: template.baseValues[index] || 1000,
    }));
  }, [filterState]);

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
      const growth = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
      totalGrowth += growth;
      growthPoints++;
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
    granularityInfo,
    formatValue,
    getTrendIcon,
    getTrendColor
  };
};

export default usePerformanceGraph;
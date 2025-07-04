// src/pages/dashboard/components/performance-graph/PerformanceGraph.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';
import usePerformanceGraph from './usePerformanceGraph';
import { FilterState } from '../../types.dashboard';
import { customToast } from '../../../../toast-config/customToast';
import dashboardTranslations from '../../translations.json';

interface PerformanceGraphProps {
  filterState: FilterState;
  selectedProductIds: string[];
  title?: string;
  className?: string;
  performanceType?: 'popularityScore' | 'bestsellerScore' | 'quotationsSent' | 'quotationsAccepted' | 'quotationsRejected' | 'quotationsInProgress';
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({
  filterState,
  selectedProductIds,
  title = dashboardTranslations.dashboard.performance.title,
  className = "",
  performanceType = 'popularityScore'
}) => {
  const {
    chartData,
    performanceMetrics,
    isLoading,
    isError,
    error,
    granularityInfo,
    formatValue,
    getTrendIcon,
    getTrendColor,
    refetch
  } = usePerformanceGraph({ filterState, selectedProductIds, performanceType });

  const handleRetry = () => {
    refetch();
    customToast.info(dashboardTranslations.dashboard.loading.performance);
  };

  if (isLoading) {
    return (
      <div className={`${className} mb-10`}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">{title}</h2>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="flex gap-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-12 bg-gray-200 rounded w-24"></div>
                ))}
              </div>
            </div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${className} mb-10`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-cb-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {dashboardTranslations.dashboard.errors.retry}
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">
              {dashboardTranslations.dashboard.errors.performanceError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className={`${className} mb-10`}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">{title}</h2>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">No performance data available for the selected period</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} mb-10`}>
      {/* Title */}
      <h2 className="text-3xl font-semibold mb-6 text-gray-900">
        {title}
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            {granularityInfo && (
              <p className="text-sm text-gray-600">
                {dashboardTranslations.dashboard.performance.granularityInfo.showing} {granularityInfo.granularity} 
              {" "}{dashboardTranslations.dashboard.performance.granularityInfo.over} <span className="font-semibold">{granularityInfo.days}</span> 
                {dashboardTranslations.dashboard.performance.granularityInfo.days}
              </p>
            )}
          </div>
          
          {/* Performance Metrics */}
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              {getTrendIcon(performanceMetrics.trend)}
              <div className="text-right">
                <p className="text-xs text-gray-600">{dashboardTranslations.dashboard.performance.metrics.avgGrowth}</p>
                <p className={`text-sm font-semibold ${getTrendColor(performanceMetrics.trend)}`}>
                  {performanceMetrics.averageGrowth > 0 ? '+' : ''}{performanceMetrics.averageGrowth.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-right">
                <p className="text-xs text-gray-600">{dashboardTranslations.dashboard.performance.metrics.peak}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatValue(performanceMetrics.peak)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-right">
                <p className="text-xs text-gray-600">{dashboardTranslations.dashboard.performance.metrics.current}</p>
                <p className="text-sm font-semibold text-cb-red">
                  {formatValue(performanceMetrics.current)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f3f4f6" 
                vertical={false}
              />
              <XAxis 
                dataKey="period" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => formatValue(value, true)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={{ 
                  fill: '#dc2626', 
                  strokeWidth: 2, 
                  r: 4,
                  stroke: '#fff'
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#dc2626',
                  stroke: '#fff',
                  strokeWidth: 2
                }}
                className="drop-shadow-sm"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Info */}
        {filterState.timeGranularity === 'custom' && granularityInfo && (
          <div className="mt-4 p-3 bg-cb-red bg-opacity-5 border border-cb-red border-opacity-20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cb-red" />
              <span className="text-sm font-medium text-cb-red">
                {dashboardTranslations.dashboard.performance.autoGranularity.title}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">
              {dashboardTranslations.dashboard.performance.autoGranularity.description.replace(
                '{granularity}', 
                granularityInfo.granularity === 'days' ? 'Daily' : 
                granularityInfo.granularity === 'weeks' ? 'Weekly' : 
                granularityInfo.granularity === 'months' ? 'Monthly' : 'Yearly'
              ).replace('{days}', granularityInfo.days.toString())}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 backdrop-blur-sm bg-opacity-95">
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cb-red rounded-full"></div>
          <p className="text-sm text-cb-red font-semibold">
            {dashboardTranslations.dashboard.performance.tooltip.performance}: {value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default PerformanceGraph;
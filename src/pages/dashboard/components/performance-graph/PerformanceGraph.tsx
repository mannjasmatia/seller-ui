// PerformanceGraph.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import performanceTranslations from './translations.json';
import usePerformanceGraph from './usePerformanceGraph';
import { FilterState } from '../../types.dashboard';

interface PerformanceGraphProps {
  filterState: FilterState;
  title?: string;
  className?: string;
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({
  filterState,
  title = performanceTranslations.defaultTitle,
  className = ""
}) => {
  const {
    chartData,
    performanceMetrics,
    isLoading,
    granularityInfo,
    formatValue,
    getTrendIcon,
    getTrendColor
  } = usePerformanceGraph(filterState);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} mb-10`}>

        {/* Title */}
      <h2 className="text-3xl font-semibold mb-6 text-gray-900">
        {title || "Performance Overview"}
      </h2>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          {/* <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3> */}
          {granularityInfo && (
            <p className="text-sm text-gray-600">
              {performanceTranslations.granularityInfo.showing} {granularityInfo.granularity} 
            {" "}{performanceTranslations.granularityInfo.over} <span className="font-semibold">{granularityInfo.days}</span> 
              {performanceTranslations.granularityInfo.days}
            </p>
          )}
        </div>
        
        {/* Performance Metrics */}
        <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            {getTrendIcon(performanceMetrics.trend)}
            <div className="text-right">
              <p className="text-xs text-gray-600">{performanceTranslations.metrics.avgGrowth}</p>
              <p className={`text-sm font-semibold ${getTrendColor(performanceMetrics.trend)}`}>
                {performanceMetrics.averageGrowth > 0 ? '+' : ''}{performanceMetrics.averageGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="text-right">
              <p className="text-xs text-gray-600">{performanceTranslations.metrics.peak}</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatValue(performanceMetrics.peak)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="text-right">
              <p className="text-xs text-gray-600">{performanceTranslations.metrics.current}</p>
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
              {performanceTranslations.autoGranularity.title}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {performanceTranslations.autoGranularity.description.replace(
              '{granularity}', 
              granularityInfo.granularity === 'days' ? 'Daily' : 
              granularityInfo.granularity === 'weeks' ? 'Weekly' : 
              granularityInfo.granularity === 'months' ? 'Monthly' : 'Yearly'
            ).replace('{days}', granularityInfo.days.toString())}
          </p>
        </div>
      )}
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
            {performanceTranslations.tooltip.performance}: {value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default PerformanceGraph;
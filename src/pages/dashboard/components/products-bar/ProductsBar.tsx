// src/pages/dashboard/components/ProductsBar.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dashboardTranslations from '../../translations.json';
import { FilterState } from '../../types.dashboard';
import useProductsBar from './useProductsBar';
import { customToast } from '../../../../toast-config/customToast';

interface ProductsBarChartProps {
  title: string;
  filterState: FilterState;
  selectedProductIds: string[];
  type: 'products' | 'profit';
}

const ProductsBar: React.FC<ProductsBarChartProps> = ({
  title,
  filterState,
  selectedProductIds,
  type,
}) => {
  const { 
    chartData, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    dataKey 
  } = useProductsBar({ 
    filterState, 
    selectedProductIds, 
    type 
  });

  const handleRetry = () => {
    refetch();
    customToast.info(dashboardTranslations.dashboard.loading.analytics);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            {dashboardTranslations.dashboard.errors.analyticsError}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-cb-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {dashboardTranslations.dashboard.errors.retry}
          </button>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600">No data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => type === 'profit' ? `$${value}` : value.toString()}
            />
            <Tooltip content={<CustomTooltip type={type} />} />
            <Bar 
              dataKey={dataKey} 
              fill="#dc2626" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const dataKey = type === 'products' ? 'Products Sold' : 'Profit Generated';
    const prefix = type === 'profit' ? '$' : '';
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 backdrop-blur-sm bg-opacity-95">
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cb-red rounded-full"></div>
          <p className="text-sm text-cb-red font-semibold">
            {dataKey}: {prefix}{value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default ProductsBar;

// Dashboard.tsx - Main component with state management
import React, { useState, useMemo } from 'react';
import { FilterState, Product } from './types.dashboard';
import Filter from './components/Filters';
import ProductsBarChart from './components/ProductsBar';
import SalesSummary from './components/sales-summary/SalesSummary';
import PerformanceGraph from './components/performance-graph/PerformanceGraph';

// Mock Products
export const mockProducts: Product[] = [
  { id: '1', name: 'Product A' },
  { id: '2', name: 'Product B' },
  { id: '3', name: 'Product C' },
  { id: '4', name: 'Product D' },
  { id: '5', name: 'Product E' },
];

// Time granularity options
export const timeGranularityOptions = [
  { value: 'all-time', label: 'All time' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'this-year', label: 'This year' },
  { value: 'last-2-years', label: 'Last 2 years' },
  { value: 'last-5-years', label: 'Last 5 years' },
  { value: 'custom', label: 'Custom Range' },
];

// Main Dashboard Component
const Dashboard = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    selectedProducts: [],
    timeGranularity: 'all-time',
    customFromDate: '',
    customToDate: '',
  });

  // Update selected products
  const handleProductsChange = (selectedProducts: string[]) => {
    setFilterState(prev => ({ ...prev, selectedProducts }));
  };

  // Update time granularity
  const handleGranularityChange = (timeGranularity: string) => {
    let updates: Partial<FilterState> = { timeGranularity };
    
    // Set default dates when custom is selected
    if (timeGranularity === 'custom' && !filterState.customFromDate && !filterState.customToDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      updates.customFromDate = thirtyDaysAgo.toISOString().split('T')[0];
      updates.customToDate = today.toISOString().split('T')[0];
    }
    
    setFilterState(prev => ({ ...prev, ...updates }));
  };

  // Update custom date range
  const handleCustomDateChange = (field: 'customFromDate' | 'customToDate', value: string) => {
    setFilterState(prev => ({ ...prev, [field]: value }));
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    return {
      totalProductsSold: 15600,
      totalProfit: 12800,
      averagePerPeriod: 1560,
      selectedProductsCount: filterState.selectedProducts.length === 0 ? 'All' : filterState.selectedProducts.length,
    };
  }, [filterState]);

  return (
    // <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Analytics Dashboard</h1>
          <p className="text-gray-600">Track your product performance and revenue metrics</p>
        </div>

        {/* Filters */}
        <Filter
          filterState={filterState}
          products={mockProducts}
          timeGranularityOptions={timeGranularityOptions}
          onProductsChange={handleProductsChange}
          onGranularityChange={handleGranularityChange}
          onCustomDateChange={handleCustomDateChange}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <ProductsBarChart
            title="Products Sold"
            filterState={filterState}
            dataKey="productsSold"
            type="products"
          />
          <ProductsBarChart
            title="Profit Generated"
            filterState={filterState}
            dataKey="profit"
            type="profit"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600">Total Products Sold</h4>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {summaryMetrics.totalProductsSold.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600">Total Profit</h4>
            <p className="text-2xl font-bold text-red-600 mt-1">
              ${summaryMetrics.totalProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600">Average per Period</h4>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {summaryMetrics.averagePerPeriod.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600">Selected Products</h4>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {summaryMetrics.selectedProductsCount}
            </p>
          </div>
        </div>

        <SalesSummary/>

         <PerformanceGraph
            filterState={filterState}
          />

      </div>
    // </div>
  );
};

export default Dashboard;
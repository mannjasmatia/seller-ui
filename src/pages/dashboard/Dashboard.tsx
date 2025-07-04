// src/pages/dashboard/Dashboard.tsx
import React from 'react';
import Filter from './components/Filters';
import SalesSummary from './components/sales-summary/SalesSummary';
import PerformanceGraph from './components/performance-graph/PerformanceGraph';
import useDashboard from './useDashboard';
import { RefreshCw } from 'lucide-react';
import dashboardTranslations from './translations.json';
import ProductsBarChart from './components/products-bar/ProductsBar';

const Dashboard: React.FC = () => {
  const {
    filterState,
    products,
    selectedProductIds,
    timeGranularityOptions,
    summaryMetrics,
    isProductsLoading,
    isProductsError,
    handleProductsChange,
    handleGranularityChange,
    handleCustomDateChange,
    handleProductsRetry,
  } = useDashboard();

  if (isProductsError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {dashboardTranslations.dashboard.title}
          </h1>
          <p className="text-gray-600">{dashboardTranslations.dashboard.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              {dashboardTranslations.dashboard.errors.productsError}
            </p>
            <button
              onClick={handleProductsRetry}
              className="flex items-center gap-2 px-4 py-2 bg-cb-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {dashboardTranslations.dashboard.errors.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {dashboardTranslations.dashboard.title}
        </h1>
        <p className="text-gray-600">{dashboardTranslations.dashboard.subtitle}</p>
      </div>

      {/* Filters */}
      <Filter
        filterState={filterState}
        products={products}
        timeGranularityOptions={timeGranularityOptions}
        onProductsChange={handleProductsChange}
        onGranularityChange={handleGranularityChange}
        onCustomDateChange={handleCustomDateChange}
        isLoading={isProductsLoading}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        <ProductsBarChart
          title={dashboardTranslations.dashboard.charts.productsSold}
          filterState={filterState}
          selectedProductIds={selectedProductIds}
          type="products"
        />
        <ProductsBarChart
          title={dashboardTranslations.dashboard.charts.profitGenerated}
          filterState={filterState}
          selectedProductIds={selectedProductIds}
          type="profit"
        />
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <h4 className="text-sm font-medium text-gray-600">
            {dashboardTranslations.dashboard.summaryCards.totalProductsSold}
          </h4>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {summaryMetrics.totalProductsSold}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <h4 className="text-sm font-medium text-gray-600">
            {dashboardTranslations.dashboard.summaryCards.totalProfit}
          </h4>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {summaryMetrics.totalProfit}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <h4 className="text-sm font-medium text-gray-600">
            {dashboardTranslations.dashboard.summaryCards.averagePerPeriod}
          </h4>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {summaryMetrics.averagePerPeriod}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <h4 className="text-sm font-medium text-gray-600">
            {dashboardTranslations.dashboard.summaryCards.selectedProducts}
          </h4>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {summaryMetrics.selectedProductsCount}
          </p>
        </div>
      </div> */}

      {/* Sales Summary */}
      <SalesSummary 
        filterState={filterState}
        selectedProductIds={selectedProductIds}
      />

      {/* Performance Graph */}
      <PerformanceGraph
        filterState={filterState}
        selectedProductIds={selectedProductIds}
        title={dashboardTranslations.dashboard.charts.performanceOverview}
      />
    </div>
  );
};

export default Dashboard;
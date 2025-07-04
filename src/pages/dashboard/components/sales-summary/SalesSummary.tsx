// src/pages/dashboard/components/sales-summary/SalesSummary.tsx
import React from "react";
import { ChevronRight, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import useSalesSummary from "./useSalesSummary";
import { FilterState } from "../../types.dashboard";
import { customToast } from "../../../../toast-config/customToast";
import dashboardTranslations from "../../translations.json";

interface SalesSummaryProps {
  filterState: FilterState;
  selectedProductIds: string[];
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ filterState, selectedProductIds }) => {
  const { 
    salesData, 
    popularityData, 
    translations, 
    isLoading, 
    isError, 
    error, 
    handleViewMore, 
    handleRefresh 
  } = useSalesSummary({ filterState, selectedProductIds });

  const handleRetry = () => {
    handleRefresh();
    customToast.info(dashboardTranslations.dashboard.loading.performance);
  };

  if (isLoading) {
    return (
      <div className="w-full mb-10">
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">
          {dashboardTranslations.dashboard.salesSummary.title}
        </h2>
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-2xl h-32"></div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-52 xl:w-64">
              <div className="bg-gray-200 rounded-2xl h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">
            {dashboardTranslations.dashboard.salesSummary.title}
          </h2>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-cb-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {dashboardTranslations.dashboard.errors.retry}
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col items-center justify-center h-40 text-center">
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

  return (
    <div className="w-full mb-10">
      {/* Title */}
      <h2 className="text-3xl font-semibold mb-6 text-gray-900">
        {dashboardTranslations.dashboard.salesSummary.title}
      </h2>

      {/* Cards */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left Side - All Cards Except Popularity Score */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full">
            {/* First Row - Large Cards */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90 mb-2">
                    {dashboardTranslations.dashboard.salesSummary.totalProductShipped}
                  </h3>
                  <p className="text-4xl font-bold mb-4">
                    {salesData.totalProductShipped}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("shipped")}
                  className="flex items-center text-sm font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {dashboardTranslations.dashboard.salesSummary.viewMore}
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90 mb-2">
                    {dashboardTranslations.dashboard.salesSummary.inProgress}
                  </h3>
                  <p className="text-4xl font-bold mb-4">
                    {salesData.inProgress}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("inProgress")}
                  className="flex items-center text-sm font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {dashboardTranslations.dashboard.salesSummary.viewMore}
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Second Row - Smaller Cards */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {dashboardTranslations.dashboard.salesSummary.totalProductViewed}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalProductViewed}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("viewed")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {dashboardTranslations.dashboard.salesSummary.viewMore}
                  <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {dashboardTranslations.dashboard.salesSummary.totalQuotationReceived}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalQuotationReceived}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("quotation")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {dashboardTranslations.dashboard.salesSummary.viewMore}
                  <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {dashboardTranslations.dashboard.salesSummary.totalOrderAccepted}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalOrderAccepted}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("accepted")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {dashboardTranslations.dashboard.salesSummary.viewMore}
                  <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cb-red to-red-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {dashboardTranslations.dashboard.salesSummary.totalOrderRejected}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalOrderRejected}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("rejected")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {dashboardTranslations.dashboard.salesSummary.viewMore}
                  <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Popularity Score Card */}
        <div className="w-full lg:w-52 xl:w-64">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-medium opacity-90 mb-4">
                {dashboardTranslations.dashboard.salesSummary.popularityScore}
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-40 h-40 lg:w-48 lg:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={popularityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                      >
                        {popularityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {salesData.popularityScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;
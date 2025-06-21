// SalesSummary.tsx
import React from "react";
import { ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import useSalesSummary from "./useSalesSummary";

const SalesSummary: React.FC = () => {
  const { salesData, popularityData, translations, handleViewMore } =
    useSalesSummary();

  return (
    <div className="w-full mb-10">
      {/* Title */}
      <h2 className="text-3xl font-semibold mb-6 text-gray-900">
        {translations.salesSummaryTitle || "Sales Summary"}
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
                    {translations.totalProductShipped}
                  </h3>
                  <p className="text-4xl font-bold mb-4">
                    {salesData.totalProductShipped}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("shipped")}
                  className="flex items-center text-sm font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {translations.viewMore}
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90 mb-2">
                    {translations.inProgress}
                  </h3>
                  <p className="text-4xl font-bold mb-4">
                    {salesData.inProgress}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("inProgress")}
                  className="flex items-center text-sm font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {translations.viewMore}
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Second Row - Smaller Cards */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {translations.totalProductViewed}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalProductViewed}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("viewed")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {translations.viewMore}
                  <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {translations.totalQuotationReceived}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalQuotationReceived}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("quotation")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {translations.viewMore}
                  <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {translations.totalOrderAccepted}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalOrderAccepted}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("accepted")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {translations.viewMore}
                  <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cb-red to-red-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-medium opacity-90 mb-2">
                    {translations.totalOrderRejected}
                  </h3>
                  <p className="text-2xl font-bold mb-3">
                    {salesData.totalOrderRejected}
                  </p>
                </div>
                <button
                  onClick={() => handleViewMore("rejected")}
                  className="flex items-center text-xs font-medium opacity-90 hover:opacity-100 transition-opacity group"
                >
                  {translations.viewMore}
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
                {translations.popularityScore}
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
                      66%
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

// src/pages/products/ProductsList.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import Button from '../../components/BasicComponents/Button';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import Pagination from './components/Pagination';
import translations from './translations.json';
import useProductsList from './useProductList';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import FilterModal from './components/FilterModal';

const ProductsList: React.FC = () => {
  const { lang } = useParams();
  const {
    // Data
    products,
    totalProducts,
    totalPages,
    currentPage,
    isLoading,
    isError,
    error,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    resetFilters,
    
    // UI state
    showFilterModal,
    setShowFilterModal,
    
    // Actions
    handleAddProduct,
    handleEditProduct,
    handleCompleteNow,
    handleCardClick,
    handleDeleteProduct,
    handlePageChange,
  } = useProductsList();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error?.message || translations.errors.loadingFailed}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="solid"
            size="lg"
            className="bg-cb-red hover:bg-cb-red/90 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {translations.actions.retry}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {translations.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                {translations.subtitle}
              </p>
              {/* Stats Bar */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cb-red rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {totalProducts} products found
                  </span>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Button
                variant="solid"
                size="lg"
                onClick={handleAddProduct}
                leftIcon={<Plus className="h-5 w-5" />}
                className="bg-gradient-to-r from-cb-red to-red-600 hover:from-cb-red/90 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-95 font-semibold"
              >
                {translations.actions.addProduct}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-8 space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => setShowFilterModal(true)}
            filters={filters}
            translations={translations}
          />

          {/* Active Filters Display */}
          {Object.values(filters).some(v => 
            Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
          ) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cb-red rounded-full"></div>
                  {translations.filters.active}
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-sm font-medium text-cb-red hover:text-cb-red/80 transition-colors duration-200"
                >
                  {translations.filters.clearAll}
                </button>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {filters.categories && filters.categories.length > 0 && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Categories: {filters.categories.length}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
                      className="ml-2 hover:text-blue-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.isVerified && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {translations.filters.verified}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, isVerified: undefined }))}
                      className="ml-2 hover:text-green-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.inComplete && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    {translations.filters.incomplete}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, inComplete: undefined }))}
                      className="ml-2 hover:text-yellow-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.sortBy && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Sort: {filters.sortBy}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, sortBy: undefined }))}
                      className="ml-2 hover:text-purple-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products Content */}
        {products && products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <EmptyState onAddProduct={handleAddProduct} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Products Grid - Single Column Full Width */}
            <div className="space-y-6">
              {products?.map((product, index) => (
                <div
                  key={product._id}
                  className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeIn 0.6s ease-out forwards'
                  }}
                >
                  <ProductCard
                    product={product}
                    onEdit={() => handleEditProduct(product._id, product.incompleteSteps)}
                    onCompleteNow={() => handleCompleteNow(product._id, product.incompleteSteps)}
                    onClick={() => handleCardClick(product._id)}
                    onDelete={() => handleDeleteProduct(product._id)}
                    translations={translations}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  translations={translations}
                />
              </div>
            )}
          </div>
        )}

        {/* Enhanced Filter Modal */}
        {showFilterModal && (
          <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onFiltersChange={setFilters}
            onResetFilters={resetFilters}
            translations={translations}
          />
        )}
      </div>

      {/* CSS for animations */}
      <style >{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductsList;
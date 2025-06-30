// src/pages/products/ProductsList.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import Button from '../../components/BasicComponents/Button';
import Input from '../../components/BasicComponents/Input';
import FilterModal from './components/FilterModal';
import ProductCard from './components/ProductCard';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import Pagination from './components/Pagination';
import translations from './translations.json';
import useProductsList from './useProductList';

const ProductsList: React.FC = () => {
  const { lang } = useParams();
  const {
    // Data
    products,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">
            {error?.message || translations.errors.loadingFailed}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="solid"
            className="bg-cb-red hover:bg-cb-red/90 text-white"
          >
            {translations.actions.retry}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {translations.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {translations.subtitle}
              </p>
            </div>
            
            <Button
              variant="solid"
              onClick={handleAddProduct}
              leftIcon={<Plus className="h-4 w-4" />}
              className="bg-cb-red hover:bg-cb-red/90 text-white"
            >
              {translations.actions.addProduct}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={translations.search.placeholder}
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10 h-10 border border-gray-300 rounded-lg focus:border-cb-red"
                fullWidth
              />
            </div>
            
            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilterModal(true)}
              leftIcon={<Filter className="h-4 w-4" />}
              className="border border-gray-300 hover:border-cb-red hover:text-cb-red h-10 px-4"
            >
              Filters
              {Object.values(filters).some(v => 
                Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
              ) && (
                <span className="ml-2 bg-cb-red text-white text-xs px-1.5 py-0.5 rounded-full">
                  {Object.values(filters).filter(v => 
                    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
                  ).length}
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(v => 
            Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
          ) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {filters.categories && filters.categories.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Categories: {filters.categories.length}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.isVerified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Verified
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, isVerified: undefined }))}
                    className="ml-1 hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.inComplete && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Incomplete
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, inComplete: undefined }))}
                    className="ml-1 hover:text-yellow-600"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.sortBy && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Sort: {filters.sortBy}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sortBy: undefined }))}
                    className="ml-1 hover:text-purple-600"
                  >
                    ×
                  </button>
                </span>
              )}
              
              <button
                onClick={resetFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Products List */}
        {products && products.length === 0 ? (
          <EmptyState onAddProduct={handleAddProduct} />
        ) : (
          <div className="space-y-4">
            {/* Products Grid */}
            <div className="space-y-4">
              {products?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={() => handleEditProduct(product._id, product.incompleteSteps)}
                  onCompleteNow={() => handleCompleteNow(product._id, product.incompleteSteps)}
                  onClick={() => handleCardClick(product._id)}
                  onDelete={() => handleDeleteProduct(product._id)}
                  translations={translations}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
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

        {/* Filter Modal */}
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
    </div>
  );
};

export default ProductsList;
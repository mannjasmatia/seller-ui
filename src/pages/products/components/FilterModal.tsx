// src/pages/products/components/FilterModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, CheckCircle, Sparkles, TrendingUp, Clock, Award } from 'lucide-react';
import Button from '../../../components/BasicComponents/Button';
import CategoryFilterDropdown from './CategoryFilterDropdown';
import { ProductFilters } from '../types.products';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onResetFilters: () => void;
  translations: any;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onResetFilters,
  translations
}) => {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    handleClose();
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    onResetFilters();
    handleClose();
  };

  const updateLocalFilter = (key: keyof ProductFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(v => 
      Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
    ).length;
  };

  if (!isOpen) return null;

  const sortOptions = [
    { value: undefined, label: translations.filters.sortOptions.default, icon: Clock },
    { value: 'mostViewed', label: translations.filters.sortOptions.mostViewed, icon: TrendingUp },
    { value: 'mostQuoted', label: translations.filters.sortOptions.mostQuoted, icon: Sparkles },
    { value: 'mostAcceptedQuotations', label: translations.filters.sortOptions.mostAccepted, icon: CheckCircle },
    { value: 'mostRejectedQuotations', label: translations.filters.sortOptions.mostRejected, icon: X },
    { value: 'mostPopular', label: translations.filters.sortOptions.mostPopular, icon: Award },
    { value: 'bestseller', label: translations.filters.sortOptions.bestseller, icon: TrendingUp },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced Backdrop */}
      <div 
        className={`fixed inset-0 bg-transparent transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'
        }`}
        onClick={handleClose} 
      />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}>
          
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-cb-red to-red-600 text-white p-6 relative overflow-hidden">
            {/* Background Pattern */}
            {/* <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div> */}
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                  <Filter className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {translations.filters.title}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Customize your product search
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors duration-200 bg-white/20 hover:bg-white/30 rounded-full p-2 backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Active Filters Count */}
            {getActiveFiltersCount() > 0 && (
              <div className="relative z-10 mt-4 flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">
                    {getActiveFiltersCount()} filters active
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Content */}
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-xl p-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <label className="text-lg font-bold text-gray-900">
                  {translations.filters.categories}
                </label>
              </div>
              <CategoryFilterDropdown
                selectedCategories={localFilters.categories || []}
                onChange={(categories) => updateLocalFilter('categories', categories)}
                placeholder={translations.filters.selectCategories}
              />
            </div>

            {/* Status Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-xl p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <label className="text-lg font-bold text-gray-900">
                  {translations.filters.status}
                </label>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className={`group p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  localFilters.isVerified 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                }`}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.isVerified || false}
                      onChange={(e) => updateLocalFilter('isVerified', e.target.checked ? true : undefined)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                      localFilters.isVerified 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300 group-hover:border-green-400'
                    }`}>
                      {localFilters.isVerified && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {translations.filters.showVerifiedOnly}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Show only products that have been verified by our team
                      </p>
                    </div>
                  </label>
                </div>

                <div className={`group p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  localFilters.inComplete 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
                }`}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.inComplete || false}
                      onChange={(e) => updateLocalFilter('inComplete', e.target.checked ? true : undefined)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                      localFilters.inComplete 
                        ? 'border-yellow-500 bg-yellow-500' 
                        : 'border-gray-300 group-hover:border-yellow-400'
                    }`}>
                      {localFilters.inComplete && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {translations.filters.showIncompleteOnly}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Show only products that need completion
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Sort Options Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-xl p-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <label className="text-lg font-bold text-gray-900">
                  {translations.filters.sortBy}
                </label>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {sortOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = localFilters.sortBy === option.value;
                  
                  return (
                    <div 
                      key={option.value || 'default'} 
                      className={`group p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="sortBy"
                          checked={isSelected}
                          onChange={() => updateLocalFilter('sortBy', option.value)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300 group-hover:border-purple-400'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg transition-colors duration-200 ${
                            isSelected ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-purple-100'
                          }`}>
                            <IconComponent className={`h-4 w-4 ${
                              isSelected ? 'text-purple-600' : 'text-gray-600 group-hover:text-purple-600'
                            }`} />
                          </div>
                          <span className="font-medium text-gray-900">
                            {option.label}
                          </span>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Order Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 rounded-xl p-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <label className="text-lg font-bold text-gray-900">
                  {translations.filters.dateOrder}
                </label>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className={`group p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  (localFilters.createdAt === -1 || localFilters.createdAt === undefined)
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="createdAt"
                      checked={localFilters.createdAt === -1 || localFilters.createdAt === undefined}
                      onChange={() => updateLocalFilter('createdAt', -1)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                      (localFilters.createdAt === -1 || localFilters.createdAt === undefined)
                        ? 'border-indigo-500 bg-indigo-500' 
                        : 'border-gray-300 group-hover:border-indigo-400'
                    }`}>
                      {(localFilters.createdAt === -1 || localFilters.createdAt === undefined) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors duration-200 ${
                        (localFilters.createdAt === -1 || localFilters.createdAt === undefined) 
                          ? 'bg-indigo-100' 
                          : 'bg-gray-100 group-hover:bg-indigo-100'
                      }`}>
                        <TrendingUp className={`h-4 w-4 ${
                          (localFilters.createdAt === -1 || localFilters.createdAt === undefined) 
                            ? 'text-indigo-600' 
                            : 'text-gray-600 group-hover:text-indigo-600'
                        }`} />
                      </div>
                      <span className="font-medium text-gray-900">
                        {translations.filters.newestFirst}
                      </span>
                    </div>
                  </label>
                </div>

                <div className={`group p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  localFilters.createdAt === 1
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="createdAt"
                      checked={localFilters.createdAt === 1}
                      onChange={() => updateLocalFilter('createdAt', 1)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                      localFilters.createdAt === 1
                        ? 'border-indigo-500 bg-indigo-500' 
                        : 'border-gray-300 group-hover:border-indigo-400'
                    }`}>
                      {localFilters.createdAt === 1 && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors duration-200 ${
                        localFilters.createdAt === 1 
                          ? 'bg-indigo-100' 
                          : 'bg-gray-100 group-hover:bg-indigo-100'
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          localFilters.createdAt === 1 
                            ? 'text-indigo-600' 
                            : 'text-gray-600 group-hover:text-indigo-600'
                        }`} />
                      </div>
                      <span className="font-medium text-gray-900">
                        {translations.filters.oldestFirst}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw className="h-5 w-5" />}
                className="text-gray-600 hover:text-gray-800 hover:bg-white px-6 py-3 font-semibold transition-all duration-300 rounded-2xl"
              >
                {translations.filters.reset}
              </Button>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 px-6 py-3 font-semibold transition-all duration-300 rounded-2xl"
                >
                  {translations.actions.cancel}
                </Button>
                <Button
                  variant="solid"
                  onClick={handleApplyFilters}
                  className="bg-gradient-to-r from-cb-red to-red-600 hover:from-cb-red/90 hover:to-red-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold rounded-2xl"
                  leftIcon={getActiveFiltersCount() > 0 ? <CheckCircle className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
                >
                  {getActiveFiltersCount() > 0 
                    ? `Apply ${getActiveFiltersCount()} Filters` 
                    : translations.filters.apply
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default FilterModal;



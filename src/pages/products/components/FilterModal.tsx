// src/pages/products/components/FilterModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
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

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    onResetFilters();
    onClose();
  };

  const updateLocalFilter = (key: keyof ProductFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-cb-red" />
              <h2 className="text-lg font-semibold text-gray-900">
                {translations.filters.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.filters.categories}
              </label>
              <CategoryFilterDropdown
                selectedCategories={localFilters.categories || []}
                onChange={(categories) => updateLocalFilter('categories', categories)}
                placeholder={translations.filters.selectCategories}
              />
            </div>

            {/* Status Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {translations.filters.status}
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={localFilters.isVerified || false}
                    onChange={(e) => updateLocalFilter('isVerified', e.target.checked ? true : undefined)}
                    className="h-4 w-4 text-cb-red focus:ring-cb-red border-gray-300 rounded"
                  />
                  <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                    {translations.filters.showVerifiedOnly}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="incomplete"
                    checked={localFilters.inComplete || false}
                    onChange={(e) => updateLocalFilter('inComplete', e.target.checked ? true : undefined)}
                    className="h-4 w-4 text-cb-red focus:ring-cb-red border-gray-300 rounded"
                  />
                  <label htmlFor="incomplete" className="ml-2 text-sm text-gray-700">
                    {translations.filters.showIncompleteOnly}
                  </label>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {translations.filters.sortBy}
              </label>
              <div className="space-y-2">
                {[
                  { value: undefined, label: translations.filters.sortOptions.default },
                  { value: 'mostViewed', label: translations.filters.sortOptions.mostViewed },
                  { value: 'mostQuoted', label: translations.filters.sortOptions.mostQuoted },
                  { value: 'mostAcceptedQuotations', label: translations.filters.sortOptions.mostAccepted },
                  { value: 'mostRejectedQuotations', label: translations.filters.sortOptions.mostRejected },
                  { value: 'mostPopular', label: translations.filters.sortOptions.mostPopular },
                  { value: 'bestseller', label: translations.filters.sortOptions.bestseller },
                ].map((option) => (
                  <div key={option.value || 'default'} className="flex items-center">
                    <input
                      type="radio"
                      id={`sort-${option.value || 'default'}`}
                      name="sortBy"
                      checked={localFilters.sortBy === option.value}
                      onChange={() => updateLocalFilter('sortBy', option.value)}
                      className="h-4 w-4 text-cb-red focus:ring-cb-red border-gray-300"
                    />
                    <label 
                      htmlFor={`sort-${option.value || 'default'}`} 
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {translations.filters.dateOrder}
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="date-newest"
                    name="createdAt"
                    checked={localFilters.createdAt === -1 || localFilters.createdAt === undefined}
                    onChange={() => updateLocalFilter('createdAt', -1)}
                    className="h-4 w-4 text-cb-red focus:ring-cb-red border-gray-300"
                  />
                  <label htmlFor="date-newest" className="ml-2 text-sm text-gray-700">
                    {translations.filters.newestFirst}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="date-oldest"
                    name="createdAt"
                    checked={localFilters.createdAt === 1}
                    onChange={() => updateLocalFilter('createdAt', 1)}
                    className="h-4 w-4 text-cb-red focus:ring-cb-red border-gray-300"
                  />
                  <label htmlFor="date-oldest" className="ml-2 text-sm text-gray-700">
                    {translations.filters.oldestFirst}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="text-gray-600 hover:text-gray-800"
            >
              {translations.filters.reset}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700"
              >
                {translations.actions.cancel}
              </Button>
              <Button
                variant="solid"
                onClick={handleApplyFilters}
                className="bg-cb-red hover:bg-cb-red/90 text-white"
              >
                {translations.filters.apply}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
// src/pages/products/components/CategoryFilterDropdown.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check, X, Loader2, Plus } from 'lucide-react';
import { useFetchAllCategoriesApi } from '../../../api/api-hooks/useCategoryApi';
import Button from '../../../components/BasicComponents/Button';

export interface Category {
  _id: string;
  name: string;
}

interface CategoryFilterDropdownProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  placeholder?: string;
}

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
  selectedCategories,
  onChange,
  placeholder = "Select categories",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
    setAllCategories([]);
  }, [debouncedSearchTerm]);

  // API call for categories
  const { 
    data: categoriesData, 
    isLoading,
    isError,
    error 
  } = useFetchAllCategoriesApi({
    search: debouncedSearchTerm || undefined,
    page,
    limit
  });

  // Update categories list when data changes
  useEffect(() => {
    if (categoriesData?.docs) {
      if (page === 1) {
        setAllCategories(categoriesData.docs);
      } else {
        setAllCategories(prev => [...prev, ...categoriesData.docs]);
      }
    }
  }, [categoriesData, page]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    if (isSelected) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategories.filter(id => id !== categoryId));
  };

  const clearAllCategories = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleLoadMore = () => {
    if (categoriesData?.hasNext && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const handleSelectAll = () => {
    const allCategoryIds = allCategories.map(cat => cat._id);
    const allSelected = allCategoryIds.every(id => selectedCategories.includes(id));
    
    if (allSelected) {
      // Remove all current categories from selection
      const remainingCategories = selectedCategories.filter(id => !allCategoryIds.includes(id));
      onChange(remainingCategories);
    } else {
      // Add all current categories to selection
      const newCategories = [...new Set([...selectedCategories, ...allCategoryIds])];
      onChange(newCategories);
    }
  };

  const getSelectedCategoryNames = () => {
    return selectedCategories
      .map(id => allCategories.find(cat => cat._id === id)?.name)
      .filter(Boolean) as string[];
  };

  const hasMore = categoriesData?.hasNext;
  const totalCategories = categoriesData?.totalDocs || 0;
  const isAllSelected = allCategories.length > 0 && allCategories.every(cat => selectedCategories.includes(cat._id));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl text-left focus:outline-none transition-all duration-200 ${
          isOpen ? 'border-cb-red shadow-lg' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex-1 min-w-0">
          {selectedCategories.length === 0 ? (
            <span className="text-gray-500 truncate font-medium">{placeholder}</span>
          ) : selectedCategories.length === 1 ? (
            <span className="text-gray-900 truncate font-medium">
              {getSelectedCategoryNames()[0]}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">
                {selectedCategories.length} categories selected
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          {selectedCategories.length > 0 && (
            <button
              onClick={clearAllCategories}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Selected Categories Display */}
      {selectedCategories.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {getSelectedCategoryNames().slice(0, 4).map((name, index) => (
            <span
              key={selectedCategories[index]}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-cb-red bg-opacity-10 text-white border border-cb-red/20"
            >
              {name}
              <button
                onClick={(e) => handleRemoveCategory(selectedCategories[index], e)}
                className="ml-2 hover:text-cb-red transition-colors duration-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedCategories.length > 4 && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{selectedCategories.length - 4} more
            </span>
          )}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-cb-red transition-colors duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-64 overflow-y-auto">
            {isError ? (
              <div className="p-4 text-center text-red-600">
                <p className="font-medium">Failed to load categories</p>
                <p className="text-sm">{error?.message}</p>
              </div>
            ) : isLoading && page === 1 ? (
              <div className="p-6 text-center">
                <Loader2 className="h-6 w-6 text-cb-red mx-auto animate-spin mb-2" />
                <p className="text-sm text-gray-600">Loading categories...</p>
              </div>
            ) : allCategories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="mb-2">
                  <Search className="h-8 w-8 mx-auto text-gray-300" />
                </div>
                <p className="font-medium">
                  {searchTerm ? 'No categories found' : 'No categories available'}
                </p>
                {searchTerm && (
                  <p className="text-xs mt-1">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <>
                {/* Select All / Clear All */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {totalCategories} categories available
                    </span>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm font-medium text-cb-red hover:text-cb-red/80 transition-colors duration-200"
                    >
                      {isAllSelected ? 'Clear All' : 'Select All'}
                    </button>
                  </div>
                </div>

                {allCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category._id);
                  return (
                    <div
                      key={category._id}
                      onClick={() => handleCategoryToggle(category._id)}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'bg-cb-red/5 border-r-2 border-cb-red' : ''
                      }`}
                    >
                      <span className={`flex-1 font-medium ${isSelected ? 'text-cb-red' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-cb-red flex-shrink-0" />
                      )}
                    </div>
                  );
                })}

                {/* Load More Button */}
                {hasMore && (
                  <div className="p-3 border-t border-gray-100">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      variant="ghost"
                      size="sm"
                      className="w-full text-cb-red hover:bg-cb-red hover:text-white transition-all duration-200 font-medium py-2"
                      leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    >
                      {isLoading ? 'Loading more...' : `Load More (${totalCategories - allCategories.length} remaining)`}
                    </Button>
                  </div>
                )}

                {/* Footer Info */}
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    Showing {allCategories.length} of {totalCategories} categories
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterDropdown;
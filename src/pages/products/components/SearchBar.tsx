// src/pages/products/components/SearchBar.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Loader2, TrendingUp } from 'lucide-react';
import Button from '../../../components/BasicComponents/Button';
import { ProductFilters } from '../types.products';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterClick: () => void;
  filters: ProductFilters;
  translations: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
  filters,
  translations
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Simulate search loading state
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm]);

  const popularSearches = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'
  ];

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handlePopularSearch = (term: string) => {
    onSearchChange(term);
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
  ).length;

  return (
    <div className="relative">
      {/* Main Search Container */}
      <div className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
        isFocused ? 'border-cb-red shadow-xl scale-[1.02]' : 'border-gray-200'
      }`}>
        <div className="p-6">
          {/* Search Input Section */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  {isSearching ? (
                    <Loader2 className="h-6 w-6 text-cb-red animate-spin" />
                  ) : (
                    <Search className={`h-6 w-6 transition-colors duration-200 ${
                      isFocused ? 'text-cb-red' : 'text-gray-400'
                    }`} />
                  )}
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={translations.search.placeholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`w-full pl-14 pr-12 py-4 text-lg font-medium border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none ${
                    isFocused ? 'border-cb-red' : 'border-transparent'
                  }`}
                />

                {/* Clear Button */}
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                {/* Search Loading Overlay */}
                {isSearching && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-3 text-cb-red">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="font-medium">Searching products...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Results Count */}
              {searchTerm && !isSearching && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Found results for "{searchTerm}"</span>
                </div>
              )}
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={onFilterClick}
              leftIcon={<Filter className="h-5 w-5" />}
              className={`border-2 font-semibold px-6 py-4 transition-all duration-200 min-w-[140px] ${
                activeFiltersCount > 0 
                  ? 'border-cb-red text-cb-red bg-cb-red/5' 
                  : 'border-gray-300 text-gray-700 hover:border-cb-red hover:text-cb-red'
              }`}
            >
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-cb-red text-white text-sm px-2 py-1 rounded-full font-bold min-w-[1.5rem] h-6 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Popular Searches */}
          {!searchTerm && !isSearching && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  Popular searches:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearch(term)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-cb-red hover:text-white text-sm font-medium text-gray-700 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {searchTerm && !isSearching && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Search tips:</span> Try searching by product name, category, or specific features
              </div>
            </div>
          )}
        </div>

        {/* Search Progress Bar */}
        {isSearching && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cb-red to-red-600 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
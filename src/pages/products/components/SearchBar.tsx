// src/pages/products/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Loader2, TrendingUp, Zap, } from 'lucide-react';
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

  const initialRender = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    inputRef?.current?.focus();
  },[])

  const popularSearches = [
    { term: 'Electronics', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
    { term: 'Clothing', icon: '👕', color: 'from-purple-500 to-pink-500' },
    { term: 'Home & Garden', icon: '🏠', color: 'from-green-500 to-emerald-500' },
    { term: 'Sports', icon: '⚽', color: 'from-orange-500 to-red-500' },
    { term: 'Books', icon: '📚', color: 'from-indigo-500 to-purple-500' }
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
      <div className={`relative bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 overflow-hidden `}>
        
        {/* Animated Background Gradient */}
        {/* <div className={`absolute inset-0 bg-gradient-to-r from-cb-red/5 via-transparent to-cb-red/5 transition-opacity duration-500 ${
          isFocused ? 'opacity-100' : 'opacity-0'
        }`}></div> */}
        
        <div className="relative p-2">
          {/* Search Input Section */}
          <div className="flex  gap-6">
            <div className="flex-1 relative">
              <div className="relative group">
                {/* Search Icon with Animation */}
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="relative">
                      <Search className={`h-7 w-7 transition-all duration-300 ${
                        isFocused ? 'text-cb-red scale-110' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                      {/* {isFocused && (
                        <div className="absolute inset-0 h-7 w-7 bg-cb-red/20 rounded-full animate-pulse"></div>
                      )} */}
                    </div>
                </div>

                {/* Search Input with Enhanced Styling */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={translations.search.placeholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`w-full pl-16 pr-16 py-2 text-lg font-medium border-3 rounded-2xl transition-all duration-300 bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:outline-none placeholder-gray-400 ${
                    isFocused 
                      ? 'border-transparent shadow-lg transform scale-[1.01]' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                />

                {/* Clear Button with Animation */}
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                {/* Floating Search Animation */}
                {/* {isSearching && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-4 text-cb-red">
                      <div className="relative">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                      <span className="font-semibold text-lg">Searching products...</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cb-red rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cb-red rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-cb-red rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>

              {/* Search Results Count with Animation */}
              {searchTerm && !isSearching && (
                <div className="mt-3 flex items-center gap-2 animate-fadeIn">
                  <Zap className="h-4 w-4 text-cb-red" />
                  <span className="text-sm font-medium text-gray-600">
                    Showing results for <span className="font-bold text-cb-red">"{searchTerm}"</span>
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Filter Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="md"
                onClick={onFilterClick}
                leftIcon={<Filter className="h-6 w-6" />}
                className={`border-3 font-bold transition-all duration-300 min-w-[160px] text-lg rounded-2xl relative overflow-hidden group ${
                  activeFiltersCount > 0 
                    ? 'border-cb-red text-cb-red bg-gradient-to-r from-cb-red/10 to-cb-red/5 shadow-lg shadow-cb-red/20' 
                    : 'border-gray-300 text-gray-700 hover:border-cb-red hover:text-cb-red hover:shadow-lg'
                }`}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cb-red/0 via-cb-red/5 to-cb-red/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <span className="relative z-10">Filters</span>
                
                {activeFiltersCount > 0 && (
                  <div className="relative z-10 ml-3 bg-gradient-to-r from-cb-red to-red-600 text-white text-sm px-3 py-1.5 rounded-full font-bold min-w-[2rem] h-8 flex items-center justify-center shadow-lg animate-pulse">
                    {activeFiltersCount}
                  </div>
                )}

                {/* Glow Effect */}
                {activeFiltersCount > 0 && (
                  <div className="absolute inset-0 bg-cb-red/20 rounded-2xl blur-lg animate-pulse"></div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        {isSearching && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cb-red via-red-500 to-cb-red animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        )}
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;



// extra 

{/* Popular Searches with Enhanced UI */}
          // {!searchTerm && !isSearching && (
          //   <div className="mt-8 pt-6 border-t border-gray-100">
          //     <div className="flex items-center gap-4 mb-4">
          //       <div className="flex items-center gap-3 text-lg font-bold text-gray-700">
          //         <TrendingUp className="h-6 w-6 text-cb-red" />
          //         Popular searches:
          //       </div>
          //     </div>
              
          //     <div className="flex items-center gap-4 flex-wrap">
          //       {popularSearches.map((item, index) => (
          //         <button
          //           key={item.term}
          //           onClick={() => handlePopularSearch(item.term)}
          //           className={`group relative px-6 py-3 bg-gradient-to-r ${item.color} text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl transform overflow-hidden`}
          //           style={{
          //             animationDelay: `${index * 100}ms`,
          //             animation: 'slideUp 0.6s ease-out forwards'
          //           }}
          //         >
          //           {/* Animated Background */}
          //           <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    
          //           <span className="relative z-10 flex items-center gap-2">
          //             <span className="text-lg">{item.icon}</span>
          //             {item.term}
          //           </span>
                    
          //           {/* Glow Effect */}
          //           <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`}></div>
          //         </button>
          //       ))}
          //     </div>
          //   </div>
          // )}

          {/* Search Tips */}
          // {searchTerm && !isSearching && (
          //   <div className="mt-6 pt-4 border-t border-gray-100">
          //     <div className="flex items-center gap-3 text-sm text-gray-600">
          //       <Sparkles className="h-4 w-4 text-yellow-500" />
          //       <span className="font-medium">Search tips:</span> 
          //       <span>Try searching by product name, category, or specific features</span>
          //     </div>
          //   </div>
          // )}
import React, { useState, useRef, useEffect, forwardRef, useLayoutEffect } from 'react';
import { SizeVariant, ThemeColors } from './types';
import { Product } from '../../types/products';
import { useFetchAllProductsApi } from '../../apiHooks/useProductApi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { customToast } from '../../toast-config/customToast';
import { RootState } from '../../store/appStore';

/**
 * React Query like state interface
 */
interface QueryState {
  isPending: boolean;
  isSuccess: boolean;
  data?: Product[];
  error?: any;
  refetch: () => void;
}

/**
 * SearchBar props interface
 */
export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  
  /** Default search value */
  defaultValue?: string;
  
  /** Controlled search value */
  value?: string;
  
  /** Function called on search submit */
  onSearch?: (value: string) => void;
  
  /** Function called on input change */
  onChange?: (value: string) => void;
  
  /** Function called on input clear */
  onClear?: () => void;
  
  /** React Query state for search results */
  queryState?: QueryState;
  
  /** Function called when a result item is clicked */
  onResultClick?: (item: Product) => void;
  
  /** Size of the search bar */
  size?: SizeVariant;
  
  /** Additional CSS classes for the search container */
  className?: string;
  
  /** Additional CSS classes for the input element */
  inputClassName?: string;
  
  /** Additional CSS classes for the search button */
  buttonClassName?: string;
  
  /** Additional CSS classes for the dropdown container */
  dropdownClassName?: string;
  
  /** Show clear button */
  showClear?: boolean;
  
  /** Disable the search bar */
  disabled?: boolean;
  
  /** Auto focus on mount */
  autoFocus?: boolean;
  
  /** Theme colors [primary, secondary] */
  theme?: ThemeColors;
  
  /** Search button text (if not provided, will show a search icon) */
  buttonText?: string;
  
  /** Search on key press (Enter) */
  searchOnEnter?: boolean;
  
  /** Search button position */
  buttonPosition?: 'right' | 'left';
  
  /** Maximum height of dropdown in pixels */
  dropdownMaxHeight?: number;
}

/**
 * Dynamic and Fully Responsive SearchBar Component with Results Dropdown
 * 
 * @example
 * // Basic usage with dropdown results
 * <SearchBar 
 *   onSearch={(value) => console.log('Searching for:', value)}
 *   onResultClick={(item) => navigate(`/product/${item._id}`)}
 * />
 * 
 * @example
 * // With React Query integration
 * <SearchBar 
 *   theme={['blue-500', 'white']} 
 *   buttonText="Find" 
 *   placeholder="Search products..." 
 *   queryState={searchQueryState}
 *   onSearch={(query) => searchProducts(query)}
 * />
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      placeholder = 'Search...',
      defaultValue = '',
      value,
      onSearch,
      onChange,
      onClear,
      queryState,
      onResultClick,
      size = 'md',
      className = '',
      inputClassName = '',
      buttonClassName = '',
      dropdownClassName = '',
      showClear = false,
      disabled = false,
      autoFocus = false,
      theme = ['cb-red', 'white'],
      buttonText,
      searchOnEnter = true,
      buttonPosition = 'right',
      dropdownMaxHeight = 340,
    }: SearchBarProps,
    ref
  ) => {
    const { lang } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchQuery = searchParams.get('s');

    const [internalValue, setInternalValue] = useState<string>(value || searchQuery || defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const [searchedResults, setSearchedResults] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchQuery || '');
    const [activeIndex, setActiveIndex] = useState(-1);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const { data: results, isPending, isSuccess } = useFetchAllProductsApi({ page: 1, limit: 5, search: searchTerm });

    const language = useSelector((state: RootState) => state.language?.value)['searchBar'];

    // Track window resize for responsive design
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      if (isSuccess && results) {
        setSearchedResults(results?.docs);
        inputRef?.current?.focus();
      }
    }, [isSuccess, results]);

    // For debouncing search effect
    useEffect(() => {
      const debounceTimeout = setTimeout(() => {
        setSearchTerm(internalValue);
        handleSearch();
      }, 100);

      return () => clearTimeout(debounceTimeout);
    }, [internalValue]);

    useEffect(()=>{
      setInternalValue(searchQuery || "")
    },[searchQuery])
    
    // Ref for dropdown container
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Determine primary and secondary colors
    const [primary, secondary] = theme;
    
    // Handle outside clicks to close dropdown
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setInternalValue("")
          setSearchTerm("")
          setShowDropdown(false);
        }
      };
      
      document.addEventListener('mousedown', handleOutsideClick);
      
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, []);
    
    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (searchedResults.length > 0 ) {
        setShowDropdown(true);
      }
      
      // Update internal value for uncontrolled component
      setInternalValue(newValue);
      
      // Call user-provided onChange if available
      if (onChange) {
        onChange(newValue);
      }
    };
    
    // Handle search action
    const handleSearch = () => {
      // Don't search if input is empty
      if (searchQuery && internalValue.trim() === '') {
        setSearchTerm("");
        searchParams.delete('s');
        navigate(`?${searchParams.toString()}`, { replace: true });
        return;
      }

      // Call user-provided onSearch if available
      if (onSearch) {
        onSearch(internalValue);
      }

      // when i come back to some page again that dropdown remains open, this condition counters that problem
      if(searchQuery===internalValue){
        setShowDropdown(false)
      }else{
        setShowDropdown(true);
      }
    };

    // For dropdown down-arrow key functionality
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || !searchedResults?.length) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => 
          prev < searchedResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleResultClick(searchedResults[activeIndex]);
      } else if (searchOnEnter && e.key === 'Enter' && activeIndex === -1) {
        handleSearch();
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    
    // Handle clear action
    const handleClear = () => {
      // Update internal value for uncontrolled component
      if (value === undefined) {
        setInternalValue('');
      }
      
      // Call onClear and onChange callbacks
      if (onClear) {
        onClear();
      }
      
      if (onChange) {
        onChange('');
      }
      
      setSearchedResults([]);
      setShowDropdown(false);
    };
    
    // Handle result item click
    const handleResultClick = (item: Product) => {
      if (onResultClick) {
        onResultClick(item);
      } else {
        setSearchTerm("")
        const newSearchparams = new URLSearchParams(searchParams);
        newSearchparams.delete('s');
        newSearchparams.append('s', item.name);
        navigate(`/${lang}/products/all?${newSearchparams.toString()}`, { replace: true });
      }
      
      // Hide dropdown after selection
      setShowDropdown(false);
    };
    
    // Responsive size classes based on both size prop and viewport width
    const getResponsiveSizeClasses = () => {
      // Base size classes based on size prop
      const baseClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      }[size];

      // Responsive height classes based on viewport width and size prop
      let heightClass = 'h-10';
      
      if (windowWidth < 640) { // Mobile
        heightClass = {
          xs: 'h-7',
          sm: 'h-8',
          md: 'h-9',
          lg: 'h-10',
          xl: 'h-11',
        }[size];
      } else if (windowWidth < 1024) { // Tablet
        heightClass = {
          xs: 'h-8',
          sm: 'h-9',
          md: 'h-10',
          lg: 'h-11',
          xl: 'h-12',
        }[size];
      } else { // Desktop
        heightClass = {
          xs: 'h-8',
          sm: 'h-9',
          md: 'h-10',
          lg: 'h-12',
          xl: 'h-14',
        }[size];
      }

      return `${baseClasses} ${heightClass}`;
    };
    
    // Responsive button size classes
    const getResponsiveButtonSizeClasses = () => {
      // Base padding classes based on size prop
      let paddingClass = {
        xs: 'px-2',
        sm: 'px-3',
        md: 'px-4',
        lg: 'px-5',
        xl: 'px-6',
      }[size];
      
      // Adjust padding for smaller screens
      if (windowWidth < 640) {
        paddingClass = {
          xs: 'px-1',
          sm: 'px-2',
          md: 'px-3',
          lg: 'px-4',
          xl: 'px-5',
        }[size];
      }
      
      // Text size classes based on size prop
      const textClass = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      }[size];
      
      return `${textClass} ${paddingClass}`;
    };
    
    // Responsive icon size
    const getResponsiveIconSize = () => {
      const baseSize = {
        xs: 14,
        sm: 16,
        md: 18,
        lg: 20,
        xl: 22,
      }[size];
      
      // Scale down icons on smaller screens
      if (windowWidth < 640) {
        return Math.max(12, baseSize - 2);
      }
      
      return baseSize;
    };

    // Responsive dropdown max height
    const getResponsiveDropdownMaxHeight = () => {
      if (windowWidth < 640) {
        return Math.min(windowWidth * 0.8, dropdownMaxHeight);
      }
      return dropdownMaxHeight;
    };
    
    // Get responsive text size for dropdown items
    const getDropdownTextSize = () => {
      if (windowWidth < 640) {
        return 'text-xs';
      } else if (windowWidth < 1024) {
        return 'text-sm';
      }
      return 'text-sm';
    };
    
    // Get responsive image size for dropdown items
    const getDropdownImageSize = () => {
      if (windowWidth < 640) {
        return 'w-8 h-8';
      }
      return 'w-10 h-10';
    };
    
    // Apply responsive classes
    const sizeClasses = getResponsiveSizeClasses();
    const buttonSizeClasses = getResponsiveButtonSizeClasses();
    const iconSize = getResponsiveIconSize();
    const dropdownTextSize = getDropdownTextSize();
    const dropdownImageSize = getDropdownImageSize();
    const responsiveDropdownMaxHeight = getResponsiveDropdownMaxHeight();

    // Clear button
    const clearButton = showClear && internalValue ? (
      <button
        type="button"
        className={`
          absolute right-0 top-0 z-10 h-full px-2 bg-white
          flex items-center justify-center
          text-gray-400 hover:text-gray-500
          focus:outline-none
          ${disabled ? 'hidden' : ''}
          ${isPending && !!searchTerm ? 'opacity-50 cursor-not-allowed' : ''}
          ${windowWidth < 640 ? 'px-1' : 'px-2'}
        `}
        onClick={handleClear}
        disabled={disabled || (isPending && !!searchTerm)}
        aria-label={language.clear}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    ) : null;

    // Responsive placeholder text
    // const getResponsivePlaceholder = () => {
    //   if (windowWidth < 400) {
    //     return buttonText ? '' : placeholder.substring(0, 8) + (placeholder.length > 8 ? '...' : '');
    //   }
    //   return placeholder;
    // };

    // Results dropdown - only show when we have results
    const resultsDropdown = showDropdown && searchTerm ? (
      <div 
        ref={dropdownRef}
        className={`
          absolute w-full z-100 mt-1
          bg-white rounded-xl shadow-lg
          border border-gray-200
          overflow-hidden
          ${dropdownClassName}
        `}
        style={{ maxHeight: `${responsiveDropdownMaxHeight}px`, zIndex: 9999 }}
      >
        <div className="overflow-y-auto" style={{ maxHeight: `${responsiveDropdownMaxHeight}px` }}>
          {searchedResults?.length > 0 ? (
            <ul>
              {searchedResults.map((item, index) => (
                <li 
                  key={item._id} 
                  className={`
                    border-b border-gray-100 last:border-b-0 
                    hover:bg-gray-50 cursor-pointer transition-colors
                    ${activeIndex === index ? 'bg-gray-200 hover:bg-gray-200' : ''}
                    ${windowWidth < 640 ? 'p-2' : ''}
                  `}
                  onClick={() => handleResultClick(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  <div className="flex items-center p-2 sm:p-3">
                    <div className={`flex-shrink-0 ${dropdownImageSize} mr-2 sm:mr-3`}>
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width={windowWidth < 640 ? 16 : 20} 
                            height={windowWidth < 640 ? 16 : 20} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow truncate">
                      <p className={`font-medium text-gray-800 truncate ${dropdownTextSize}`}>{item.name}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`p-3 sm:p-4 ${dropdownTextSize} h-24 sm:h-40 flex items-center justify-center font-semibold text-center text-black`}>
              {`${language.noResults} "${searchTerm}"`}
            </div>
          )}
        </div>
      </div>
    ) : null;
    
    // Search button with icon or text
    const searchButton = (
      <button
        type="button"
        className={`
          inline-flex items-center justify-center
          font-medium transition-all duration-200
          focus:outline-none
          text-${secondary} bg-${primary} hover:bg-${primary}/90
          ${buttonSizeClasses}
          ${buttonPosition === 'right' ? 'rounded-r-full' : 'rounded-l-full'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${buttonClassName}
        `}
        onClick={handleSearch}
        disabled={disabled || (isPending && !!searchTerm)}
        aria-label="Search"
      >
        {(isPending && !!searchTerm) ? (
          <svg 
            className="animate-spin" 
            xmlns="http://www.w3.org/2000/svg" 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : buttonText && windowWidth > 400 ? (
          buttonText
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        )}
      </button>
    );
    
    return (
      <div className={`relative ${className} w-full`} style={{ position: 'relative', zIndex: 50 }}>
        <div className="relative flex" style={{ zIndex: 99 }}>
          {buttonPosition === 'left' && searchButton}
          
          <div className={`relative flex-grow ${showClear ? 'pr-8' : ''}`}>
            <input
              ref={ref || inputRef}
              type="text"
              className={`
                w-full ${sizeClasses}
                px-2 sm:px-3 md:px-4
                py-1 sm:py-2
                border border-gray-300 
                ${buttonPosition === 'right' ? 'rounded-l-full' : 'rounded-r-full'}
                ${isFocused ? `ring-2 ring-${primary}/20 border-${primary}` : ''}
                ${disabled || (isPending && !!searchTerm) ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
                focus:outline-none focus:ring-2 focus:ring-${primary}/30 focus:border-${primary}
                text-ellipsis overflow-hidden whitespace-nowrap
                ${inputClassName}
              `}
              placeholder={placeholder || language.placeholder}
              value={internalValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              autoFocus={autoFocus}
              aria-label={placeholder || language.placeholder}
              role="searchbox"
            />
            
            {clearButton}
          </div>
          
          {buttonPosition === 'right' && searchButton}
        </div>
        
        {resultsDropdown}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
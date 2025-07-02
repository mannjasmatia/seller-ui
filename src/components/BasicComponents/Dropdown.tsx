import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search, Check, Loader2, Plus } from 'lucide-react';

// Types
interface DropdownOption {
  value: string;
  label: string;
  [key: string]: any; // Allow additional properties
}

interface ApiResponse {
  docs: any[];
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  currentPage: number;
  totalDocs: number;
}

interface QueryParams {
  page: string;
  limit: string;
  search: string;
}

interface DynamicDropdownProps {
  query?: (params: QueryParams) => Promise<ApiResponse>;
  // For React Query hooks - pass the hook function directly
  useQueryHook?: (params: QueryParams) => {
    data: ApiResponse | undefined;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };
  defaultValues?: DropdownOption[];
  multiSelect?: boolean;
  allowSelectAll:boolean;
  selectedValues?: string | string[];
  allowSearch?: boolean;
  debounceTimer?: number;
  limit?: number;
  label?:string,
  placeholder?: string;
  onSelectionChange?: (values: string | string[]) => void;
  disabled?: boolean;
  className?: string;
  // Function to transform API response item to DropdownOption
  transformItem: (item: any) => DropdownOption;
}

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Dropdown: React.FC<DynamicDropdownProps> = ({
  query,
  useQueryHook,
  defaultValues = [],
  multiSelect = false,
  selectedValues = multiSelect ? [] : '',
  allowSelectAll=false,
  allowSearch = true,
  debounceTimer = 300,
  limit = 10,
  label,
  placeholder,
  onSelectionChange,
  disabled = false,
  className = '',
  transformItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<DropdownOption[]>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string | string[]>(selectedValues);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: '1',
    limit: limit.toString(),
    search: '',
  });

  // Use React Query hook if provided
  const queryResult = useQueryHook ? useQueryHook(queryParams) : null;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTimer);

  useEffect(()=>{
    if(!query && !useQueryHook && defaultValues.length)
    setOptions(defaultValues)
  },[defaultValues])

  // Handle React Query hook results
  useEffect(() => {
    if (queryResult?.data) {
      const response = queryResult.data;
      const transformedOptions = response.docs.map(transformItem);
      
      if (parseInt(queryParams.page) === 1) {
        setOptions(transformedOptions);
      } else {
        setOptions(prev => [...prev, ...transformedOptions]);
      }
      
      setHasNext(response.hasNext);
      setCurrentPage(response.currentPage);
      setTotalDocs(response.totalDocs);
    }
  }, [queryResult?.data, queryParams.page, transformItem]);

  // Update loading state from React Query
  useEffect(() => {
    if (useQueryHook) {
      if (parseInt(queryParams.page) === 1) {
        setLoading(queryResult?.isLoading || false);
      } else {
        setLoadingMore(queryResult?.isLoading || false);
      }
    }
  }, [queryResult?.isLoading, queryParams.page, useQueryHook]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && allowSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, allowSearch]);

  // Reset pagination when search term changes
  useEffect(() => {
    if (useQueryHook || query) {
      setCurrentPage(1);
      setOptions([]);
      
      const newParams = {
        page: '1',
        limit: limit.toString(),
        search: debouncedSearchTerm,
      };
      
      if (useQueryHook) {
        setQueryParams(newParams);
      } else if (query) {
        fetchData(1, debouncedSearchTerm, false);
      }
    }
  }, [debouncedSearchTerm]);

  // Fetch data function
  const fetchData = async (page: number, search: string, append: boolean = false) => {
    if (!query) return;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params: QueryParams = {
        page: page.toString(),
        limit: limit.toString(),
        search: search,
      };

      const response = await query(params);
      
      const transformedOptions = response.docs.map(transformItem);

      if (append) {
        setOptions(prev => [...prev, ...transformedOptions]);
      } else {
        setOptions(transformedOptions);
      }

      setHasNext(response.hasNext);
      setCurrentPage(page);
      setTotalDocs(response.totalDocs);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      if (!append) {
        setOptions([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (query && !defaultValues.length) {
      fetchData(1, '', false);
    } else if (useQueryHook && !defaultValues.length) {
      // For React Query hooks, just set initial params
      setQueryParams({
        page: '1',
        limit: limit.toString(),
        search: '',
      });
    }
  }, [query, useQueryHook, defaultValues.length, limit]);

  // Filter options based on search term (for default values only)
  const filteredOptions = (!query && !useQueryHook)
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Handle option selection
  const handleOptionToggle = (option: DropdownOption) => {
    let newSelected: string | string[];

    if (multiSelect) {
      const currentSelected = Array.isArray(internalSelected) ? internalSelected : [];
      if (currentSelected.includes(option.value)) {
        newSelected = currentSelected.filter(val => val !== option.value);
      } else {
        newSelected = [...currentSelected, option.value];
      }
    } else {
      newSelected = option.value;
      setIsOpen(false);
    }

    setInternalSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  // Remove selected option (for multiselect)
  const removeSelectedOption = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSelected = Array.isArray(internalSelected) ? internalSelected : [];
    const newSelected = currentSelected.filter(val => val !== valueToRemove);
    setInternalSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  // Clear all selections
  const clearAllSelections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = multiSelect ? [] : '';
    setInternalSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  // Handle show more
  const handleShowMore = () => {
    if (hasNext && !loadingMore) {
      const nextPage = currentPage + 1;
      
      if (useQueryHook) {
        setQueryParams(prev => ({
          ...prev,
          page: nextPage.toString(),
        }));
      } else if (query) {
        fetchData(nextPage, debouncedSearchTerm, true);
      }
    }
  };

  // Handle select all / clear all
  const handleSelectAll = () => {
    if(!allowSelectAll){
        return 
    }
    const allOptionValues = filteredOptions.map(opt => opt.value);
    const currentSelected = Array.isArray(internalSelected) ? internalSelected : [];
    const isAllSelected = allOptionValues.every(value => currentSelected.includes(value));
    
    if (isAllSelected) {
      // Remove all current options from selection
      const remainingSelected = currentSelected.filter(value => !allOptionValues.includes(value));
      setInternalSelected(remainingSelected);
      onSelectionChange?.(remainingSelected);
    } else {
      // Add all current options to selection
      const newSelected = [...new Set([...currentSelected, ...allOptionValues])];
      setInternalSelected(newSelected);
      onSelectionChange?.(newSelected);
    }
  };

  // Get display text for selected values
  const getDisplayText = () => {
    if (multiSelect) {
      const selectedArray = Array.isArray(internalSelected) ? internalSelected : [];
      if (selectedArray.length === 0) return placeholder;
      if (selectedArray.length === 1) {
        const option = options.find(opt => opt.value === selectedArray[0]);
        return option?.label || selectedArray[0];
      }
      return `${selectedArray.length} ${label ?? " items "} selected`;
    } else {
      if (!internalSelected || internalSelected === '') return placeholder;
      const option = options.find(opt => opt.value === internalSelected);
      return option?.label || internalSelected;
    }
  };

  // Get selected options for multiselect display
  const getSelectedOptions = (): DropdownOption[] => {
    if (!multiSelect) return [];
    const selectedArray = Array.isArray(internalSelected) ? internalSelected : [];
    return options.filter(opt => selectedArray.includes(opt.value));
  };

  const selectedArray = Array.isArray(internalSelected) ? internalSelected : [];
  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every(opt => selectedArray.includes(opt.value));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main dropdown button */}
      {label && <div className="flex gap-1">
        <h4 className='block text-sm font-medium text-gray-700 mb-1'>{label}</h4>
        </div>}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl text-left focus:outline-none transition-all duration-200 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed border-gray-200' 
            : isOpen 
              ? 'border-cb-red shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex-1 min-w-0">
          {selectedArray.length === 0 ? (
            <span className="text-gray-500 truncate font-medium">{getDisplayText()}</span>
          ) : selectedArray.length === 1 ? (
            <span className="text-gray-900 truncate font-medium">
              {getSelectedOptions()[0]?.label || getDisplayText()}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">
                {getDisplayText()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          {selectedArray.length > 0 && (
            <button
              onClick={clearAllSelections}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Selected Items Display (for multiselect) */}
      {multiSelect && selectedArray.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {getSelectedOptions().slice(0, 4).map((option, index) => (
            <span
              key={option.value}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-cb-red bg-opacity-10 text-white border border-cb-red/20"
            >
              {option.label}
              <button
                onClick={(e) => removeSelectedOption(option.value, e)}
                className="ml-2 hover:text-cb-red transition-colors duration-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedArray.length > 4 && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{selectedArray.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden">
          {/* Search input */}
          {allowSearch && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search ${multiSelect ? label ?? "items" : 'options'}...`}
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
          )}

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {(queryResult?.error || (query && !loading && !filteredOptions.length && searchTerm)) ? (
              <div className="p-4 text-center text-red-600">
                <p className="font-medium">Failed to load options</p>
                <p className="text-sm">{queryResult?.error?.message || 'No data found'}</p>
              </div>
            ) : loading && currentPage === 1 ? (
              <div className="p-6 text-center">
                <Loader2 className="h-6 w-6 text-cb-red mx-auto animate-spin mb-2" />
                <p className="text-sm text-gray-600">Loading options...</p>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="mb-2">
                  <Search className="h-8 w-8 mx-auto text-gray-300" />
                </div>
                <p className="font-medium">
                  {searchTerm ? 'No options found' : 'No options available'}
                </p>
                {searchTerm && (
                  <p className="text-xs mt-1">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <>
                {/* Select All / Clear All (for multiselect) */}
                {multiSelect && allowSelectAll && (
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {totalDocs || filteredOptions.length} options available
                      </span>
                      <button
                        onClick={handleSelectAll}
                        className="text-sm font-medium text-cb-red hover:text-cb-red/80 transition-colors duration-200"
                      >
                        {isAllSelected ? 'Clear All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                )}

                {filteredOptions.map((option) => {
                  const isSelected = multiSelect
                    ? selectedArray.includes(option.value)
                    : internalSelected === option.value;

                  return (
                    <div
                      key={option.value}
                      onClick={() => handleOptionToggle(option)}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'bg-cb-red/5 border-r-2 border-cb-red' : ''
                      }`}
                    >
                      <span className={`flex-1 font-medium ${isSelected ? 'text-cb-red' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-cb-red flex-shrink-0" />
                      )}
                    </div>
                  );
                })}

                {/* Load More button for API queries */}
                {(query || useQueryHook) && hasNext && (
                  <div className="p-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleShowMore}
                      disabled={loadingMore}
                      className="w-full text-cb-red hover:bg-cb-red hover:text-white transition-all duration-200 font-medium py-2 px-4 rounded-lg border border-transparent hover:border-cb-red flex items-center justify-center space-x-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading more...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Load More ({totalDocs - filteredOptions.length} remaining)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Footer Info */}
                {(query || useQueryHook) && (
                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 text-center">
                      Showing {filteredOptions.length} of {totalDocs} options
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
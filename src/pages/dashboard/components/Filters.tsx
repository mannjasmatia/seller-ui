// src/pages/dashboard/components/Filters.tsx
import { useMemo, useState } from "react";
import { FilterState, Product } from "../types.dashboard";
import { Calendar, Check, ChevronDown, Loader2 } from "lucide-react";
import dashboardTranslations from "../translations.json";

interface FilterProps {
  filterState: FilterState;
  products: Product[];
  timeGranularityOptions: { value: string; label: string }[];
  onProductsChange: (products: string[]) => void;
  onGranularityChange: (granularity: string) => void;
  onCustomDateChange: (field: 'customFromDate' | 'customToDate', value: string) => void;
  isLoading?: boolean;
}

const Filter: React.FC<FilterProps> = ({
  filterState,
  products,
  timeGranularityOptions,
  onProductsChange,
  onGranularityChange,
  onCustomDateChange,
  isLoading = false
}) => {
  // Function to calculate optimal granularity based on date range
  const calculateGranularity = (fromDate: Date, toDate: Date): 'days' | 'weeks' | 'months' | 'years' => {
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'days';
    if (diffDays <= 90) return 'weeks';
    if (diffDays <= 730) return 'months';
    return 'years';
  };

  // Calculate granularity info for display
  const granularityInfo = useMemo(() => {
    if (filterState.timeGranularity === 'custom' && filterState.customFromDate && filterState.customToDate) {
      const fromDate = new Date(filterState.customFromDate);
      const toDate = new Date(filterState.customToDate);
      const autoGranularity = calculateGranularity(fromDate, toDate);
      const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        granularity: autoGranularity,
        days: diffDays
      };
    }
    return null;
  }, [filterState.timeGranularity, filterState.customFromDate, filterState.customToDate]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {dashboardTranslations.dashboard.filters.title}
        </h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {dashboardTranslations.dashboard.filters.title}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {dashboardTranslations.dashboard.filters.products}
          </label>
          <MultiSelectDropdown
            options={products}
            selected={filterState.selectedProducts}
            onChange={onProductsChange}
            placeholder={dashboardTranslations.dashboard.filters.allProducts}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {dashboardTranslations.dashboard.filters.timePeriod}
          </label>
          <SingleSelectDropdown
            options={timeGranularityOptions}
            selected={filterState.timeGranularity}
            onChange={onGranularityChange}
          />
        </div>
      </div>
      
      {/* Custom Date Range */}
      {filterState.timeGranularity === 'custom' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {dashboardTranslations.dashboard.filters.customDateRange}
          </h3>
          <DateRangePicker
            fromDate={filterState.customFromDate}
            toDate={filterState.customToDate}
            onFromDateChange={(date) => onCustomDateChange('customFromDate', date)}
            onToDateChange={(date) => onCustomDateChange('customToDate', date)}
          />
          
          {/* Granularity Info */}
          {granularityInfo && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {dashboardTranslations.dashboard.filters.autoGranularity}
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {dashboardTranslations.dashboard.filters.granularityInfo
                  .replace('{granularity}', granularityInfo.granularity)
                  .replace('{days}', granularityInfo.days.toString())
                  .replace('{breakdown}', 
                    granularityInfo.granularity === 'days' ? 'Daily' : 
                    granularityInfo.granularity === 'weeks' ? 'Weekly' : 
                    granularityInfo.granularity === 'months' ? 'Monthly' : 'Yearly'
                  )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Multi-select Dropdown Component
const MultiSelectDropdown: React.FC<{ 
  options: Product[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}> = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const selectAll = () => {
    onChange(options.map(option => option.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const displayText = selected.length === 0 
    ? placeholder 
    : selected.length === options.length 
      ? dashboardTranslations.dashboard.filters.allProducts
      : `${selected.length} selected`;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border-2 border-red-200 rounded-lg text-left focus:outline-none focus:border-red-400 transition-colors"
      >
        <span className="text-gray-700 truncate">{displayText}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {options.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading products...</p>
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-center w-4 h-4 mr-3">
                  {selected.includes(option.id) && (
                    <Check className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <span className="text-gray-700">{option.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Single Select Dropdown Component
const SingleSelectDropdown: React.FC<{ 
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}> = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === selected);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border-2 border-red-200 rounded-lg text-left focus:outline-none focus:border-red-400 transition-colors"
      >
        <span className="text-gray-700">{selectedOption?.label || 'Select...'}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                selected === option.value ? 'bg-red-50 text-red-700' : 'text-gray-700'
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Date Range Picker Component
const DateRangePicker: React.FC<{ 
  fromDate: string; 
  toDate: string; 
  onFromDateChange: (date: string) => void; 
  onToDateChange: (date: string) => void; 
}> = ({ fromDate, toDate, onFromDateChange, onToDateChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {dashboardTranslations.dashboard.filters.fromDate}
        </label>
        <div className="relative">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              onFromDateChange(e.target.value)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
          />
          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {dashboardTranslations.dashboard.filters.toDate}
        </label>
        <div className="relative">
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 transition-colors"
          />
          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Filter;
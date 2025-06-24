// src/pages/AddProduct/components/CategorySearchDropdown.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface CategorySearchDropdownProps {
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  categories: Category[];
}

const CategorySearchDropdown: React.FC<CategorySearchDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select a category",
  error,
  label = "Category",
  categories = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const selectedCategory = categories.find(cat => cat._id === value);

  const handleCategorySelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-2 bg-white border-2 rounded-lg text-left 
          focus:outline-none focus:border-cb-red transition-colors
          ${error ? 'border-red-500' : 'border-gray-200'}
        `}
      >
        <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-cb-red"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No categories found' : 'No categories available'}
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id)}
                  className={`
                    flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer
                    ${value === category._id ? 'bg-cb-red bg-opacity-10 text-cb-red' : 'text-gray-700'}
                  `}
                >
                  <span>{category.name}</span>
                  {value === category._id && (
                    <Check className="h-4 w-4 text-cb-red" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySearchDropdown;
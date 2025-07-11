// src/pages/AddProduct/components/ProductInfoForm.tsx
import React from 'react';
import { Plus, X, HelpCircle } from 'lucide-react';
import { Category, ProductInfo, ValidationError } from '../types.add-product';
import Input from '../../../components/BasicComponents/Input';
import Button from '../../../components/BasicComponents/Button';
import CategorySearchDropdown from './CategorySearchDropdown';

interface ProductInfoFormProps {
  data: ProductInfo;
  categories: Category[];
  validationErrors: ValidationError[];
  onUpdate: (data: Partial<ProductInfo>) => void;
  getError: (field: string) => string | undefined;
  addAboutPoint: () => void;
  removeAboutPoint: (index: number) => void;
  updateAboutPoint: (index: number, value: string) => void;
  translations: any;
}

const ProductInfoForm: React.FC<ProductInfoFormProps> = ({
  data,
  categories,
  validationErrors,
  onUpdate,
  getError,
  addAboutPoint,
  removeAboutPoint,
  updateAboutPoint,
  translations
}) => {
  return (
    <div className="space-y-8">
      {/* Product Name */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            label={translations.productInfo.name}
            placeholder={translations.productInfo.namePlaceholder}
            value={data.name}
            onChange={(value) => onUpdate({ name: value })}
            error={getError('name')}
            hint={translations.productInfo.nameHint}
            fullWidth
            validation={{ required: true, minLength: 3, maxLength: 200 }}
          />
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Enter a descriptive name that customers will easily understand
            </div>
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <CategorySearchDropdown
          value={data.categoryId}
          onChange={(categoryId) => onUpdate({ categoryId })}
          placeholder={translations.productInfo.categoryPlaceholder}
          error={getError('categoryId')}
          label={translations.productInfo.category}
          categories={categories}
        />
      </div>

      {/* About Product */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {translations.productInfo.about}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">{translations.productInfo.aboutHint}</p>
        
        <div className="space-y-3">
          {data.about.map((point, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <Input
                  type="textarea"
                  placeholder={translations.productInfo.aboutPlaceholder}
                  value={point}
                  onChange={(value) => updateAboutPoint(index, value)}
                  rows={2}
                  fullWidth
                  validation={{ maxLength: 500 }}
                />
              </div>
              {data.about.length > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAboutPoint(index)}
                  leftIcon={<X className="h-4 w-4" />}
                  ariaLabel={translations.productInfo.removePoint}
                  className="mt-1"
                >
                  {translations.productInfo.removePoint}
                </Button>
              )}
            </div>
          ))}
        </div>

        {data.about.length < 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={addAboutPoint}
            leftIcon={<Plus className="h-4 w-4" />}
            className="mt-4"
          >
            {translations.productInfo.addAboutPoint}
          </Button>
        )}

        {getError('about') && (
          <p className="mt-2 text-sm text-red-600">{getError('about')}</p>
        )}
      </div>

      {/* MOQ */}
      <div>
        <Input
          type="number"
          label={translations.productInfo.moq}
          placeholder={translations.productInfo.moqPlaceholder}
          value={data.moq}
          onChange={(value) => onUpdate({ moq: Number(value) || 1 })}
          hint={translations.productInfo.moqHint}
          fullWidth
          validation={{ required: true, min: 1 }}
        />
      </div>
    </div>
  );
};

export default ProductInfoForm;
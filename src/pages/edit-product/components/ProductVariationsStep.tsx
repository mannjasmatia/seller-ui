// src/pages/EditProduct/components/ProductVariationsStep.tsx
import React from 'react';
import { Plus, X, Settings, Tag } from 'lucide-react';
import { CustomizableOption, ProductVariation, ProductVariations, ValidationError } from '../types.edit-product';
import Button from '../../../components/BasicComponents/Button';
import Input from '../../../components/BasicComponents/Input';

interface ProductVariationsStepProps {
  data: ProductVariations;
  validationErrors: ValidationError[];
  onUpdate: (data: Partial<ProductVariations>) => void;
  translations: any;
}

const ProductVariationsStep: React.FC<ProductVariationsStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  translations
}) => {
  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  // Variation Functions
  const addVariation = () => {
    const newVariation: ProductVariation = {
      field: '',
      values: ['']
    };
    onUpdate({
      variations: [...data.variations, newVariation]
    });
  };

  const removeVariation = (index: number) => {
    const newVariations = data.variations.filter((_, i) => i !== index);
    onUpdate({ variations: newVariations });
  };

  const updateVariationField = (index: number, field: string) => {
    const newVariations = [...data.variations];
    newVariations[index].field = field;
    onUpdate({ variations: newVariations });
  };

  const addVariationValue = (variationIndex: number) => {
    const newVariations = [...data.variations];
    newVariations[variationIndex].values.push('');
    onUpdate({ variations: newVariations });
  };

  const removeVariationValue = (variationIndex: number, valueIndex: number) => {
    const newVariations = [...data.variations];
    if (newVariations[variationIndex].values.length > 1) {
      newVariations[variationIndex].values = newVariations[variationIndex].values.filter(
        (_, i) => i !== valueIndex
      );
      onUpdate({ variations: newVariations });
    }
  };

  const updateVariationValue = (variationIndex: number, valueIndex: number, value: string) => {
    const newVariations = [...data.variations];
    newVariations[variationIndex].values[valueIndex] = value;
    onUpdate({ variations: newVariations });
  };

  // Customizable Options Functions
  const addCustomOption = () => {
    const newOption: CustomizableOption = {
      option: '',
      quantity: undefined
    };
    onUpdate({
      customizableOptions: [...data.customizableOptions, newOption]
    });
  };

  const removeCustomOption = (index: number) => {
    const newOptions = data.customizableOptions.filter((_, i) => i !== index);
    onUpdate({ customizableOptions: newOptions });
  };

  const updateCustomOption = (index: number, field: 'option' | 'quantity', value: string | number) => {
    const newOptions = [...data.customizableOptions];
    if (field === 'quantity') {
      newOptions[index].quantity = value as number;
    } else {
      newOptions[index].option = value as string;
    }
    onUpdate({ customizableOptions: newOptions });
  };

  return (
    <div className="space-y-8">
      {/* Product Variations */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Tag className="h-5 w-5 text-cb-red mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {translations.variations.title}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addVariation}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {translations.variations.addVariation}
          </Button>
        </div>

        {data.variations.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {translations.variations.noVariations}
            </h4>
            <p className="text-gray-500 mb-4">
              {translations.variations.addFirstVariation}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.variations.map((variation, variationIndex) => (
              <div key={variationIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Variation {variationIndex + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => removeVariation(variationIndex)}
                    ariaLabel={translations.variations.removeVariation}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Variation Field */}
                <div className="mb-4">
                  <Input
                    type="text"
                    label={translations.variations.variationField}
                    placeholder={translations.variations.variationFieldPlaceholder}
                    value={variation.field}
                    onChange={(value) => updateVariationField(variationIndex, value)}
                    fullWidth
                    validation={{ required: true, maxLength: 50 }}
                  />
                </div>

                {/* Variation Values */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.variations.variationValues}
                  </label>
                  
                  <div className="space-y-2">
                    {variation.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder={`Value ${valueIndex + 1}`}
                            value={value}
                            onChange={(newValue) => updateVariationValue(variationIndex, valueIndex, newValue)}
                            fullWidth
                            validation={{ required: true, maxLength: 100 }}
                          />
                        </div>
                        {variation.values.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariationValue(variationIndex, valueIndex)}
                            ariaLabel={translations.variations.removeValue}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addVariationValue(variationIndex)}
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="mt-2"
                  >
                    {translations.variations.addValue}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customizable Options */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-cb-red mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {translations.variations.customizableOptions}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addCustomOption}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {translations.variations.addCustomOption}
          </Button>
        </div>

        {data.customizableOptions.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {translations.variations.noCustomOptions}
            </h4>
            <p className="text-gray-500">
              {translations.variations.addFirstCustomOption}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.customizableOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Custom Option {index + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => removeCustomOption(index)}
                    ariaLabel={translations.variations.removeCustomOption}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    label={translations.variations.customOptionName}
                    placeholder={translations.variations.customOptionPlaceholder}
                    value={option.option}
                    onChange={(value) => updateCustomOption(index, 'option', value)}
                    fullWidth
                    validation={{ required: true, maxLength: 100 }}
                  />
                  
                  <Input
                    type="number"
                    label={translations.variations.customOptionQuantity}
                    placeholder={translations.variations.customOptionQuantityPlaceholder}
                    value={option.quantity || ''}
                    onChange={(value) => updateCustomOption(index, 'quantity', Number(value) || 0)}
                    fullWidth
                    validation={{ min: 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {getError('variations') && (
        <p className="text-sm text-red-600">{getError('variations')}</p>
      )}
    </div>
  );
};

export default ProductVariationsStep;
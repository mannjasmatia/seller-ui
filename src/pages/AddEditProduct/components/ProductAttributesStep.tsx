// src/pages/products/components/steps/ProductAttributesStep.tsx
import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { ProductAttributeGroup, ValidationError } from '../types.add-edit-product';
import Button from '../../../components/BasicComponents/Button';
import Input from '../../../components/BasicComponents/Input';

interface ProductAttributesStepProps {
  data: ProductAttributeGroup[];
  validationErrors: ValidationError[];
  onUpdate: (data: ProductAttributeGroup[]) => void;
  translations: any;
}

const ProductAttributesStep: React.FC<ProductAttributesStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  translations
}) => {
  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const addAttributeGroup = () => {
    const newGroup: ProductAttributeGroup = {
      name: '',
      attributes: [{ field: '', value: '' }]
    };
    onUpdate([...data, newGroup]);
  };

  const removeAttributeGroup = (groupIndex: number) => {
    const newData = data.filter((_, index) => index !== groupIndex);
    onUpdate(newData);
  };

  const updateGroupName = (groupIndex: number, name: string) => {
    const newData = [...data];
    newData[groupIndex].name = name;
    onUpdate(newData);
  };

  const addAttribute = (groupIndex: number) => {
    const newData = [...data];
    newData[groupIndex].attributes.push({ field: '', value: '' });
    onUpdate(newData);
  };

  const removeAttribute = (groupIndex: number, attributeIndex: number) => {
    const newData = [...data];
    if (newData[groupIndex].attributes.length > 1) {
      newData[groupIndex].attributes = newData[groupIndex].attributes.filter(
        (_, index) => index !== attributeIndex
      );
      onUpdate(newData);
    }
  };

  const updateAttribute = (
    groupIndex: number, 
    attributeIndex: number, 
    field: 'field' | 'value', 
    value: string
  ) => {
    const newData = [...data];
    newData[groupIndex].attributes[attributeIndex][field] = value;
    onUpdate(newData);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {translations.attributes.noAttributes}
        </h3>
        <p className="text-gray-500 mb-6">
          {translations.attributes.addFirstGroup}
        </p>
        <Button
          variant="solid"
          onClick={addAttributeGroup}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          {translations.attributes.addAttributeGroup}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data && Array.isArray(data) && data?.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          {/* Group Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 mr-4">
              <Input
                type="text"
                label={translations.attributes.attributeGroupName}
                placeholder={translations.attributes.attributeGroupPlaceholder}
                value={group.name}
                onChange={(value) => updateGroupName(groupIndex, value)}
                fullWidth
                validation={{ required: true, maxLength: 100 }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeAttributeGroup(groupIndex)}
              leftIcon={<Trash2 className="h-4 w-4" />}
              ariaLabel={translations.attributes.removeGroup}
              className="mt-6"
            >
              {translations.attributes.removeGroup}
            </Button>
          </div>

          {/* Attributes */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Attributes
            </label>
            
            {group.attributes.map((attribute, attributeIndex) => (
              <div key={attributeIndex} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={translations.attributes.attributeFieldPlaceholder}
                    value={attribute.field}
                    onChange={(value) => updateAttribute(groupIndex, attributeIndex, 'field', value)}
                    fullWidth
                    validation={{ required: true, maxLength: 50 }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={translations.attributes.attributeValuePlaceholder}
                    value={attribute.value}
                    onChange={(value) => updateAttribute(groupIndex, attributeIndex, 'value', value)}
                    fullWidth
                    validation={{ required: true, maxLength: 255 }}
                  />
                </div>
                {group.attributes.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAttribute(groupIndex, attributeIndex)}
                    leftIcon={<X className="h-4 w-4" />}
                    ariaLabel={translations.attributes.removeAttribute}
                  >
                    {translations.attributes.removeAttribute}
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => addAttribute(groupIndex)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="mt-2"
            >
              {translations.attributes.addAttribute}
            </Button>
          </div>
        </div>
      ))}

      {/* Add New Group Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={addAttributeGroup}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          {translations.attributes.addAttributeGroup}
        </Button>
      </div>

      {getError('attributes') && (
        <p className="text-sm text-red-600">{getError('attributes')}</p>
      )}
    </div>
  );
};

export default ProductAttributesStep;
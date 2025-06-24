// src/pages/EditProduct/components/ProductServicesStep.tsx
import React from 'react';
import { Plus, X, Wrench } from 'lucide-react';
import { ValidationError } from '../types.edit-product';
import Button from '../../../components/BasicComponents/Button';
import Input from '../../../components/BasicComponents/Input';

interface ProductServicesStepProps {
  data: string[];
  validationErrors: ValidationError[];
  onUpdate: (data: string[]) => void;
  translations: any;
}

const ProductServicesStep: React.FC<ProductServicesStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  translations
}) => {
  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const addService = () => {
    onUpdate([...data, '']);
  };

  const removeService = (index: number) => {
    const newServices = data.filter((_, i) => i !== index);
    onUpdate(newServices);
  };

  const updateService = (index: number, value: string) => {
    const newServices = [...data];
    newServices[index] = value;
    onUpdate(newServices);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Wrench className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {translations.services.noServices}
        </h3>
        <p className="text-gray-500 mb-6">
          {translations.services.addFirstService}
        </p>
        <Button
          variant="solid"
          onClick={addService}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          {translations.services.addService}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Wrench className="h-5 w-5 text-cb-red mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {translations.services.title}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addService}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {translations.services.addService}
          </Button>
        </div>

        <div className="space-y-4">
          {data.map((service, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Service {index + 1}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => removeService(index)}
                  ariaLabel={translations.services.removeService}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <Input
                type="textarea"
                placeholder={translations.services.servicePlaceholder}
                value={service}
                onChange={(value) => updateService(index, value)}
                hint={translations.services.serviceHint}
                rows={2}
                fullWidth
                validation={{ required: true, minLength: 1, maxLength: 200 }}
              />
            </div>
          ))}
        </div>

        {getError('services') && (
          <p className="mt-4 text-sm text-red-600">{getError('services')}</p>
        )}
      </div>
    </div>
  );
};

export default ProductServicesStep;
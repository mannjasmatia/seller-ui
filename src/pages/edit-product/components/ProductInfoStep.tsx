// src/pages/EditProduct/components/ProductInfoStep.tsx
import React from "react";
import { Plus, X, HelpCircle } from "lucide-react";
import { Category, ProductInfo, ValidationError } from "../types.edit-product";
import Input from "../../../components/BasicComponents/Input";
import Button from "../../../components/BasicComponents/Button";
import CategorySearchDropdown from "./CategorySearchDropdown";

interface ProductInfoStepProps {
  data: ProductInfo;
  categories: Category[];
  validationErrors: ValidationError[];
  onUpdate: (data: Partial<ProductInfo>) => void;
  translations: any;
}

const ProductInfoStep: React.FC<ProductInfoStepProps> = ({
  data,
  categories,
  validationErrors,
  onUpdate,
  translations,
}) => {
  const getError = (field: string) => {
    return validationErrors.find((error) => error.field === field)?.message;
  };

  const handleAboutChange = (index: number, value: string) => {
    const newAbout = [...data.about];
    newAbout[index] = value;

    // Validate length
    if (value.trim().length > 500) {
      // Don't update if exceeding limit
      return;
    }

    onUpdate({ about: newAbout });
  };

  console.log("ProductInfoStep data:", data);

  const addAboutPoint = () => {
    if (data.about.length < 10) {
      onUpdate({ about: [...data.about, ""] });
    }
  };

  const removeAboutPoint = (index: number) => {
    // Ensure at least 2 points remain (considering non-empty ones)
    const nonEmptyPoints = data.about.filter((point) => point.trim()).length;
    if (
      nonEmptyPoints > 2 ||
      (nonEmptyPoints === 2 && !data.about[index].trim())
    ) {
      const newAbout = data.about.filter((_, i) => i !== index);
      onUpdate({ about: newAbout });
    }
  };

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
            error={getError("name")}
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
          error={getError("categoryId")}
          label={translations.productInfo.category}
        />
      </div>

      {/* About Product */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {translations.productInfo.about}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          {translations.productInfo.aboutHint}
        </p>

        <div className="space-y-3">
          {data.about.map((point, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <Input
                  type="textarea"
                  placeholder={translations.productInfo.aboutPlaceholder}
                  value={point}
                  onChange={(value) => handleAboutChange(index, value)}
                  rows={2}
                  fullWidth
                  validation={{
                    maxLength: 500,
                    errorMessages: {
                      maxLength:
                        "Each about point must be at most 500 characters",
                    },
                  }}
                  error={getError(`about.${index}`)}
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
                  disabled={
                    data.about.filter((p) => p.trim()).length <= 2 &&
                    !!point.trim()
                  }
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

        {getError("about") && (
          <p className="mt-2 text-sm text-red-600">{getError("about")}</p>
        )}
      </div>

      {/* MOQ */}
      {data && data?.moq && (
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
      )}
    </div>
  );
};

export default ProductInfoStep;

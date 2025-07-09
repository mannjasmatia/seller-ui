// src/pages/EditProduct/components/ProductPricingStep.tsx
import React from "react";
import { Plus, X, DollarSign, Clock } from "lucide-react";
import {
  LeadTime,
  ProductPricing,
  QuantityPriceTier,
  ValidationError,
} from "../types.edit-product";
import Input from "../../../components/BasicComponents/Input";
import Button from "../../../components/BasicComponents/Button";

interface ProductPricingStepProps {
  data: ProductPricing;
  validationErrors: ValidationError[];
  onUpdate: (data: Partial<ProductPricing>) => void;
  translations: any;
}

const ProductPricingStep: React.FC<ProductPricingStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  translations,
}) => {
  const getError = (field: string) => {
    return validationErrors.find((error) => error.field === field)?.message;
  };

  // Price Tier Functions
  const updatePriceTier = (
    index: number,
    field: keyof QuantityPriceTier,
    value: number | undefined
  ) => {
    const newTiers = [...data.quantityPriceTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };

    // Auto-adjust next tier's min value when current max changes
    if (field === "max" && value && index < newTiers.length - 1) {
      if (newTiers[index + 1].min <= value) {
        newTiers[index + 1].min = value + 1;
      }
    }

    onUpdate({ quantityPriceTiers: newTiers });
  };

  const addPriceTier = () => {
    const lastTier =
      data.quantityPriceTiers[data.quantityPriceTiers.length - 1];
    const newTier: QuantityPriceTier = {
      min: lastTier?.max ? lastTier.max + 1 : (lastTier?.min || 0) + 1,
      max: undefined,
      price: 0,
    };

    onUpdate({
      quantityPriceTiers: [...data.quantityPriceTiers, newTier],
    });
  };

  const removePriceTier = (index: number) => {
    const newTiers = data.quantityPriceTiers.filter((_, i) => i !== index);
    onUpdate({ quantityPriceTiers: newTiers });
  };

  // Lead Time Functions
  const addLeadTime = () => {
    const newLeadTime: LeadTime = {
      min:
        data.leadTime.length > 0
          ? (data.leadTime[data.leadTime.length - 1].max || 0) + 1
          : 1,
      max: undefined,
      days: 1,
    };
    onUpdate({
      leadTime: [...data.leadTime, newLeadTime],
    });
  };

  const removeLeadTime = (index: number) => {
    if (data.leadTime.length > 1) {
      const newLeadTimes = data.leadTime.filter((_, i) => i !== index);
      onUpdate({ leadTime: newLeadTimes });
    }
  };

  const updateLeadTime = (
    index: number,
    field: keyof LeadTime,
    value: number | undefined
  ) => {
    const newLeadTimes = [...data.leadTime];
    newLeadTimes[index] = { ...newLeadTimes[index], [field]: value };

    // Auto-adjust next lead time's min value when current max changes
    if (field === "max" && value && index < newLeadTimes.length - 1) {
      if (newLeadTimes[index + 1].min <= value) {
        newLeadTimes[index + 1].min = value + 1;
      }
    }

    onUpdate({ leadTime: newLeadTimes });
  };

  return (
    <div className="space-y-8">
      {/* Price Range */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-cb-red mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            {translations.pricing.priceRange}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label={translations.pricing.minPrice}
            placeholder={translations.pricing.minPricePlaceholder}
            value={data.minPrice}
            onChange={(value) => onUpdate({ minPrice: Number(value) || 0 })}
            error={getError("minPrice")}
            hint={translations.pricing.minPriceHint}
            fullWidth
            validation={{ required: true, min: 1 }}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            type="number"
            label={translations.pricing.maxPrice}
            placeholder={translations.pricing.maxPricePlaceholder}
            value={data.maxPrice}
            onChange={(value) => onUpdate({ maxPrice: Number(value) || 0 })}
            error={getError("maxPrice")}
            hint={translations.pricing.maxPriceHint}
            fullWidth
            validation={{ required: true, min: data.minPrice + 1 }}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Quantity Price Tiers */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {translations.pricing.quantityTiers}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addPriceTier}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {translations.pricing.addTier}
          </Button>
        </div>

        {data.quantityPriceTiers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {translations.pricing.noTiers}
          </p>
        ) : (
          <div className="space-y-4">
            {data.quantityPriceTiers.map((tier, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {translations.pricing.tier} {index + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => removePriceTier(index)}
                    ariaLabel={translations.pricing.removeTier}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="number"
                    label={translations.pricing.tierMin}
                    placeholder={translations.pricing.tierMinPlaceholder}
                    value={tier.min}
                    onChange={(value) =>
                      updatePriceTier(index, "min", Number(value) || 1)
                    }
                    fullWidth
                    validation={{
                      required: true,
                      min: 1,
                      errorMessages: {
                        required: translations.validation.required,
                        min: translations.validation.minValue.replace('{min}', '1'),
                      },
                    }}
                    error={getError(`quantityPriceTiers.${index}.min`)}
                  />

                  <Input
                    type="number"
                    label={translations.pricing.tierMax}
                    placeholder={translations.pricing.tierMaxPlaceholder}
                    value={tier.max || ""}
                    onChange={(value) =>
                      updatePriceTier(
                        index,
                        "max",
                        value ? Number(value) : undefined
                      )
                    }
                    fullWidth
                    validation={{
                      min: tier.min + 1,
                      errorMessages: {
                        min: translations.validation.minValue.replace('{min}', (tier.min + 1).toString()),
                      },
                    }}
                    hint={
                      index === data.quantityPriceTiers.length - 1
                        ? translations.pricing.lastTierNote
                        : ""
                    }
                    error={getError(`quantityPriceTiers.${index}.max`)}
                  />

                  <Input
                    type="number"
                    label={translations.pricing.tierPrice}
                    placeholder={translations.pricing.tierPricePlaceholder}
                    value={tier.price}
                    onChange={(value) =>
                      updatePriceTier(index, "price", Number(value) || 0)
                    }
                    fullWidth
                    validation={{
                      required: true,
                      min: 0,
                      errorMessages: {
                        required: translations.validation.required,
                        min: translations.validation.nonNegative,
                      },
                    }}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    error={getError(`quantityPriceTiers.${index}.price`)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead Time */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-cb-red mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {translations.pricing.leadTime}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addLeadTime}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {translations.pricing.addLeadTime}
          </Button>
        </div>

        <div className="space-y-4">
          {data.leadTime.map((leadTime, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {translations.pricing.leadTimeRange} {index + 1}
                </span>
                {data.leadTime.length > 1 && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => removeLeadTime(index)}
                    ariaLabel={translations.pricing.removeLeadTime}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  label={translations.pricing.leadTimeMin}
                  placeholder={translations.pricing.leadTimeMinPlaceholder}
                  value={leadTime.min}
                  onChange={(value) =>
                    updateLeadTime(index, "min", Number(value) || 1)
                  }
                  fullWidth
                  validation={{
                    required: true,
                    min: 1,
                    errorMessages: {
                      required: translations.validation.required,
                      min: translations.validation.minValue.replace('{min}', '1'),
                    },
                  }}
                  error={getError(`leadTime.${index}.min`)}
                />

                <Input
                  type="number"
                  label={translations.pricing.leadTimeMax}
                  placeholder={translations.pricing.leadTimeMaxPlaceholder}
                  value={leadTime.max || ""}
                  onChange={(value) =>
                    updateLeadTime(
                      index,
                      "max",
                      value ? Number(value) : undefined
                    )
                  }
                  fullWidth
                  validation={{
                    min: leadTime.min + 1,
                    errorMessages: {
                      min: translations.validation.minValue.replace('{min}', (leadTime.min + 1).toString()),
                    },
                  }}
                  hint={
                    index === data.leadTime.length - 1
                      ? translations.pricing.lastLeadTimeNote
                      : ""
                  }
                  error={getError(`leadTime.${index}.max`)}
                />

                <Input
                  type="number"
                  label={translations.pricing.leadTimeDays}
                  placeholder={translations.pricing.leadTimeDaysPlaceholder}
                  value={leadTime.days}
                  onChange={(value) =>
                    updateLeadTime(index, "days", Number(value) || 1)
                  }
                  fullWidth
                  validation={{
                    required: true,
                    min: 1,
                    errorMessages: {
                      required: translations.validation.required,
                      min: translations.validation.minValue.replace('{min}', '1'),
                    },
                  }}
                  error={getError(`leadTime.${index}.days`)}
                />
              </div>
            </div>
          ))}
        </div>

        {getError("leadTime") && (
          <p className="mt-2 text-sm text-red-600">{getError("leadTime")}</p>
        )}
      </div>
    </div>
  );
};

export default ProductPricingStep;
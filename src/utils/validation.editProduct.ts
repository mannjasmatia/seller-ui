// src/pages/edit-product/utils/validation.ts
import { 
  ProductFormData, 
  ProductAttributeGroup, 
  QuantityPriceTier, 
  LeadTime,
  ProductVariation,
  CustomizableOption,
  ProductDescription,
  ValidationError 
} from '../pages/edit-product/types.edit-product';

export class ProductValidator {
  
  // Product Info Validation
  static validateProductInfo(data: ProductFormData['productInfo']): ValidationError[] {
    const errors: ValidationError[] = [];

    // Name validation
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Product name is required' });
    } else if (data.name.trim().length < 3) {
      errors.push({ field: 'name', message: 'Product name must be at least 3 characters' });
    } else if (data.name.trim().length > 200) {
      errors.push({ field: 'name', message: 'Product name must be at most 200 characters' });
    }

    // Category validation
    if (!data.categoryId?.trim()) {
      errors.push({ field: 'categoryId', message: 'Category is required' });
    }

    // About validation
    if (!data.about || !Array.isArray(data.about)) {
      errors.push({ field: 'about', message: 'About is required' });
    } else {
      const validAboutPoints = data.about.filter(point => point?.trim());
      if (validAboutPoints.length < 2) {
        errors.push({ field: 'about', message: 'Please mention at least two points in about section' });
      }
      if (data.about.length > 10) {
        errors.push({ field: 'about', message: 'Maximum 10 about points allowed' });
      }
      
      // Validate each point
      data.about.forEach((point, index) => {
        if (point?.trim() && point.trim().length > 500) {
          errors.push({ field: `about.${index}`, message: 'Each about point must be at most 500 characters' });
        }
      });
    }

    return errors;
  }

  // Product Attributes Validation
  static validateProductAttributes(data: ProductAttributeGroup[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data || !Array.isArray(data) || data.length === 0) {
      return errors; // Attributes are optional
    }

    // Check for duplicate attribute names
    const attributeNames = data.map(attr => attr.name?.toLowerCase()?.trim()).filter(Boolean);
    const uniqueNames = new Set(attributeNames);
    if (attributeNames.length !== uniqueNames.size) {
      errors.push({ field: 'attributes', message: 'Duplicate attribute names are not allowed' });
    }

    data.forEach((group, groupIndex) => {
      // Group name validation
      if (!group.name?.trim()) {
        errors.push({ field: `attributes.${groupIndex}.name`, message: 'Attribute group name is required' });
      } else if (group.name.trim().length > 100) {
        errors.push({ field: `attributes.${groupIndex}.name`, message: 'Attribute group name must be at most 100 characters' });
      }

      // Attributes array validation
      if (!group.attributes || !Array.isArray(group.attributes) || group.attributes.length === 0) {
        errors.push({ field: `attributes.${groupIndex}.attributes`, message: 'Attributes field must be a non empty array' });
      } else {
        // Check for duplicate field names within group
        const fieldNames = group.attributes.map(attr => attr.field?.toLowerCase()?.trim()).filter(Boolean);
        const uniqueFields = new Set(fieldNames);
        if (fieldNames.length !== uniqueFields.size) {
          errors.push({ field: `attributes.${groupIndex}.attributes`, message: `Duplicate field names found in attribute group` });
        }

        group.attributes.forEach((attr, attrIndex) => {
          // Field validation
          if (!attr.field?.trim()) {
            errors.push({ field: `attributes.${groupIndex}.attributes.${attrIndex}.field`, message: 'Field name is required' });
          } else if (attr.field.trim().length > 50) {
            errors.push({ field: `attributes.${groupIndex}.attributes.${attrIndex}.field`, message: 'Field name must be at most 50 characters' });
          }

          // Value validation
          if (!attr.value?.trim()) {
            errors.push({ field: `attributes.${groupIndex}.attributes.${attrIndex}.value`, message: 'Field value is required' });
          } else if (attr.value.trim().length > 255) {
            errors.push({ field: `attributes.${groupIndex}.attributes.${attrIndex}.value`, message: 'Field value must be at most 255 characters' });
          }
        });
      }
    });

    return errors;
  }

  // Product Images Validation
  static validateProductImages(data: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data || !Array.isArray(data)) {
      return errors; // Images are optional
    }

    data.forEach((image, index) => {
      if (image && typeof image !== 'string') {
        errors.push({ field: `images.${index}`, message: 'Each image must be a string URL' });
      }
    });

    return errors;
  }

  // Product Pricing Validation
  static validateProductPricing(data: ProductFormData['pricing']): ValidationError[] {
    const errors: ValidationError[] = [];

    // Base price validation
    if (!data.basePrice || typeof data.basePrice !== 'number' || data.basePrice < 1) {
      errors.push({ field: 'basePrice', message: 'Base price must be at least 1' });
    }

    // Quantity price tiers validation
    if (!data.quantityPriceTiers || !Array.isArray(data.quantityPriceTiers) || data.quantityPriceTiers.length === 0) {
      errors.push({ field: 'quantityPriceTiers', message: 'Quantity price tiers must be a non-empty array' });
    } else {
      data.quantityPriceTiers.forEach((tier, index) => {
        // Min validation
        if (!tier.min || tier.min < 1) {
          errors.push({ field: `quantityPriceTiers.${index}.min`, message: 'Tier minimum must be at least 1' });
        }

        // Max validation (required for all except last)
        const isLastElement = index === data.quantityPriceTiers.length - 1;
        if (!isLastElement && (!tier.max || tier.max < 1)) {
          errors.push({ field: `quantityPriceTiers.${index}.max`, message: 'Max quantity is required for all tiers except the last one' });
        }

        // Price validation
        if (tier.price === undefined || tier.price === null || tier.price < 0) {
          errors.push({ field: `quantityPriceTiers.${index}.price`, message: 'Tier price cannot be negative' });
        }

        // Range validation
        if (tier.max && tier.min > tier.max) {
          errors.push({ field: `quantityPriceTiers.${index}`, message: 'Minimum quantity cannot be greater than maximum quantity' });
        }

        // Overlapping validation
        if (index < data.quantityPriceTiers.length - 1) {
          const nextTier = data.quantityPriceTiers[index + 1];
          if (tier.max && tier.max >= nextTier.min) {
            errors.push({ field: `quantityPriceTiers.${index}`, message: `Tier ${index + 1} and ${index + 2}: overlapping quantity ranges` });
          }
        }
      });
    }

    // Lead time validation
    if (!data.leadTime || !Array.isArray(data.leadTime) || data.leadTime.length === 0) {
      errors.push({ field: 'leadTime', message: 'Lead time must be a non-empty array' });
    } else {
      data.leadTime.forEach((leadTime, index) => {
        // Min validation
        if (!leadTime.min || leadTime.min < 1) {
          errors.push({ field: `leadTime.${index}.min`, message: 'Lead time minimum must be at least 1' });
        }

        // Max validation (required for all except last)
        const isLastElement = index === data.leadTime.length - 1;
        if (!isLastElement && (!leadTime.max || leadTime.max < 1)) {
          errors.push({ field: `leadTime.${index}.max`, message: 'Max lead time is required for all ranges except the last one' });
        }

        // Days validation
        if (!leadTime.days || leadTime.days < 1) {
          errors.push({ field: `leadTime.${index}.days`, message: 'Lead time days must be at least 1' });
        }

        // Range validation
        if (leadTime.max && leadTime.min > leadTime.max) {
          errors.push({ field: `leadTime.${index}`, message: 'Lead time minimum cannot be greater than maximum' });
        }

        // Overlapping validation
        if (index < data.leadTime.length - 1) {
          const nextLeadTime = data.leadTime[index + 1];
          if (leadTime.max && leadTime.max >= nextLeadTime.min) {
            errors.push({ field: `leadTime.${index}`, message: `Lead time ${index + 1} and ${index + 2}: overlapping ranges` });
          }
        }
      });
    }

    return errors;
  }

  // Product Variations Validation
  static validateProductVariations(data: ProductFormData['variations']): ValidationError[] {
    const errors: ValidationError[] = [];

    // Variations validation (optional)
    if (data.variations && Array.isArray(data.variations)) {
      data.variations.forEach((variation, index) => {
        // Field validation
        if (!variation.field?.trim()) {
          errors.push({ field: `variations.${index}.field`, message: 'Variation field is required' });
        } else if (variation.field.trim().length > 50) {
          errors.push({ field: `variations.${index}.field`, message: 'Variation field must be at most 50 characters' });
        }

        // Values validation
        if (!variation.values || !Array.isArray(variation.values) || variation.values.length === 0) {
          errors.push({ field: `variations.${index}.values`, message: 'Variation values must be a non-empty array' });
        } else {
          variation.values.forEach((value, valueIndex) => {
            if (!value?.trim()) {
              errors.push({ field: `variations.${index}.values.${valueIndex}`, message: 'Each variation value must be a non-empty string' });
            } else if (value.trim().length > 100) {
              errors.push({ field: `variations.${index}.values.${valueIndex}`, message: 'Each variation value must be at most 100 characters' });
            }
          });
        }
      });
    }

    // Customizable options validation (optional)
    if (data.customizableOptions && Array.isArray(data.customizableOptions)) {
      data.customizableOptions.forEach((option, index) => {
        // Option name validation
        if (!option.option?.trim()) {
          errors.push({ field: `customizableOptions.${index}.option`, message: 'Customizable option name is required' });
        } else if (option.option.trim().length > 100) {
          errors.push({ field: `customizableOptions.${index}.option`, message: 'Customizable option must be at most 100 characters' });
        }

        // Quantity validation (optional)
        if (option.quantity !== undefined && (typeof option.quantity !== 'number' || option.quantity < 0)) {
          errors.push({ field: `customizableOptions.${index}.quantity`, message: 'Customizable option quantity must be a non-negative integer' });
        }
      });
    }

    return errors;
  }

  // Product Services Validation
  static validateProductServices(data: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data || !Array.isArray(data)) {
      return errors; // Services are optional
    }

    if (data.length > 0) {
      data.forEach((service, index) => {
        if (!service?.trim()) {
          errors.push({ field: `services.${index}`, message: 'Each service must be a non-empty string' });
        } else if (service.trim().length > 200) {
          errors.push({ field: `services.${index}`, message: 'Each service must be at most 200 characters' });
        }
      });
    }

    return errors;
  }

  // Product Description Validation
  static validateProductDescription(data: ProductDescription): ValidationError[] {
    const errors: ValidationError[] = [];

    // Points validation (optional)
    if (data.points && Array.isArray(data.points)) {
      data.points.forEach((point, index) => {
        if (point?.trim() && point.trim().length > 500) {
          errors.push({ field: `description.points.${index}`, message: 'Each point must be at most 500 characters' });
        }
      });
    }

    // Attributes validation (optional)
    if (data.attributes && Array.isArray(data.attributes)) {
      data.attributes.forEach((attr, index) => {
        // Field validation
        if (!attr.field?.trim()) {
          errors.push({ field: `description.attributes.${index}.field`, message: 'Attribute field is required' });
        } else if (attr.field.trim().length > 100) {
          errors.push({ field: `description.attributes.${index}.field`, message: 'Attribute field must be at most 100 characters' });
        }

        // Value validation
        if (!attr.value?.trim()) {
          errors.push({ field: `description.attributes.${index}.value`, message: 'Attribute value is required' });
        } else if (attr.value.trim().length > 500) {
          errors.push({ field: `description.attributes.${index}.value`, message: 'Attribute value must be at most 500 characters' });
        }
      });
    }

    return errors;
  }

  // Main validation function for each step
  static validateStep(step: string, formData: ProductFormData): ValidationError[] {
    switch (step) {
      case 'productInfo':
        return this.validateProductInfo(formData.productInfo);
      case 'attributes':
        return this.validateProductAttributes(formData.attributes);
      case 'images':
        return this.validateProductImages(formData.images);
      case 'pricing':
        return this.validateProductPricing(formData.pricing);
      case 'variations':
        return this.validateProductVariations(formData.variations);
      case 'services':
        return this.validateProductServices(formData.services);
      case 'description':
        return this.validateProductDescription(formData.description);
      default:
        return [];
    }
  }
}
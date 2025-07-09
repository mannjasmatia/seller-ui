// src/pages/edit-product/utils/validation.ts
import { 
  ProductFormData, 
  ProductAttributeGroup, 
  QuantityPriceTier, 
  LeadTime,
  ProductVariation,
  CustomizableOption,
  ProductDescription,
  ValidationError, 
  ProductImagesData
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
  static validateProductImages(data: ProductImagesData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Safety check for data structure
  if (!data || typeof data !== 'object') {
    errors.push({ 
      field: 'images', 
      message: 'Image data is required' 
    });
    return errors;
  }

  const { images = [], originalImages = [], newFiles = [] } = data;

  // Check if there's at least one image (existing or new)
  const existingCount = images?.filter?.(img => 
    img && typeof img === 'string' && originalImages?.includes?.(img)
  )?.length || 0;
  const newFilesCount = newFiles?.length || 0;
  
  if (existingCount === 0 && newFilesCount === 0) {
    errors.push({ 
      field: 'images', 
      message: 'You need to upload at least one image' 
    });
  }
  
  // Validate total count doesn't exceed 10
  if (existingCount + newFilesCount > 10) {
    errors.push({
      field: 'images',
      message: 'Maximum 10 images allowed'
    });
  }
  
  // Validate existing images are strings
  if (Array.isArray(images)) {
    images?.forEach?.((image, index) => {
      if (!image || typeof image !== 'string' || !image?.trim?.()) {
        errors.push({ 
          field: `images.${index}`, 
          message: 'Each image must be a non-empty string' 
        });
      }
    });
  }
  
  // Validate new files
  if (Array.isArray(newFiles)) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    newFiles?.forEach?.((file, index) => {
      if (!file || !(file instanceof File)) {
        errors.push({
          field: `newFiles.${index}`,
          message: 'Invalid file'
        });
        return;
      }
      
      // Validate file type
      if (!validTypes?.includes?.(file?.type)) {
        errors.push({
          field: `newFiles.${index}`,
          message: 'Only JPG, PNG, and WebP files are allowed'
        });
      }
      
      // Validate file size
      if ((file?.size || 0) > maxSize) {
        errors.push({
          field: `newFiles.${index}`,
          message: 'File size must be less than 5MB'
        });
      }
      
      // Validate file name
      if (!file?.name || !file?.name?.trim?.()) {
        errors.push({
          field: `newFiles.${index}`,
          message: 'File must have a valid name'
        });
      }
    });
  }
  
  return errors;
}

  // Product Pricing Validation
  static validateProductPricing(data: ProductFormData['pricing']): ValidationError[] {
    const errors: ValidationError[] = [];

    // Min price validation
    if (!data.minPrice || typeof data.minPrice !== 'number' || data.minPrice < 1) {
      errors.push({ field: 'minPrice', message: 'Minimum price must be at least 1' });
    }

    // Max price validation
    if (!data.maxPrice || typeof data.maxPrice !== 'number' || data.maxPrice < 1) {
      errors.push({ field: 'maxPrice', message: 'Maximum price must be at least 1' });
    }

    // Price range validation
    if (data.minPrice && data.maxPrice && data.minPrice >= data.maxPrice) {
      errors.push({ field: 'maxPrice', message: 'Maximum price must be greater than minimum price' });
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

  // Safety check for data structure
  if (!data || typeof data !== 'object') {
    errors.push({ 
      field: 'description', 
      message: 'Description data is required' 
    });
    return errors;
  }

  const { points = [], attributes = [], images = [], newFiles = [] } = data;

  // Points validation
  if (!Array.isArray(points) || points.length === 0) {
    errors.push({ 
      field: 'description.points', 
      message: 'At least one description point is required' 
    });
  } else {
    // Check if at least one point has content
    const validPoints = points.filter(point => point && typeof point === 'string' && point.trim().length > 0);
    if (validPoints.length === 0) {
      errors.push({ 
        field: 'description.points', 
        message: 'At least one description point must have content' 
      });
    }

    // Validate individual points
    points.forEach((point, index) => {
      if (point && typeof point === 'string') {
        if (point.trim().length === 0) {
          errors.push({
            field: `description.points.${index}`,
            message: 'Description point cannot be empty'
          });
        } else if (point.length > 500) {
          errors.push({
            field: `description.points.${index}`,
            message: 'Description point must be at most 500 characters'
          });
        }
      } else if (point !== '') {
        errors.push({
          field: `description.points.${index}`,
          message: 'Description point must be a string'
        });
      }
    });

    // Check maximum points limit
    if (points.length > 10) {
      errors.push({
        field: 'description.points',
        message: 'Maximum 10 description points allowed'
      });
    }
  }

  // Attributes validation
  if (Array.isArray(attributes)) {
    const fieldNames = new Set<string>();
    
    attributes.forEach((attribute, index) => {
      if (!attribute || typeof attribute !== 'object') {
        errors.push({
          field: `description.attributes.${index}`,
          message: 'Invalid attribute structure'
        });
        return;
      }

      // Field validation
      if (!attribute.field || typeof attribute.field !== 'string') {
        errors.push({
          field: `description.attributes.${index}.field`,
          message: 'Attribute field is required'
        });
      } else {
        const trimmedField = attribute.field.trim();
        if (trimmedField.length === 0) {
          errors.push({
            field: `description.attributes.${index}.field`,
            message: 'Attribute field cannot be empty'
          });
        } else if (trimmedField.length > 50) {
          errors.push({
            field: `description.attributes.${index}.field`,
            message: 'Attribute field must be at most 50 characters'
          });
        } else {
          // Check for duplicate field names (case insensitive)
          const lowerField = trimmedField.toLowerCase();
          if (fieldNames.has(lowerField)) {
            errors.push({
              field: `description.attributes.${index}.field`,
              message: 'Duplicate attribute field names are not allowed'
            });
          } else {
            fieldNames.add(lowerField);
          }
        }
      }

      // Value validation
      if (!attribute.value || typeof attribute.value !== 'string') {
        errors.push({
          field: `description.attributes.${index}.value`,
          message: 'Attribute value is required'
        });
      } else {
        const trimmedValue = attribute.value.trim();
        if (trimmedValue.length === 0) {
          errors.push({
            field: `description.attributes.${index}.value`,
            message: 'Attribute value cannot be empty'
          });
        } else if (trimmedValue.length > 500) {
          errors.push({
            field: `description.attributes.${index}.value`,
            message: 'Attribute value must be at most 500 characters'
          });
        }
      }
    });

    // Check maximum attributes limit
    if (attributes.length > 20) {
      errors.push({
        field: 'description.attributes',
        message: 'Maximum 20 attributes allowed'
      });
    }
  }

  // Images validation (optional but if present, must be valid)
  if (Array.isArray(images)) {
    // Validate existing images are strings
    images.forEach((image, index) => {
      if (!image || typeof image !== 'string' || !image.trim()) {
        errors.push({ 
          field: `description.images.${index}`, 
          message: 'Each image must be a non-empty string' 
        });
      }
    });

    // Check maximum images count (including new files)
    const totalImageCount = images.length + (newFiles?.length || 0);
    if (totalImageCount > 10) {
      errors.push({
        field: 'description.images',
        message: 'Maximum 10 description images allowed'
      });
    }
  }
  
  // New files validation (if present)
  if (Array.isArray(newFiles)) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    newFiles.forEach((file, index) => {
      if (!file || !(file instanceof File)) {
        errors.push({
          field: `description.newFiles.${index}`,
          message: 'Invalid file'
        });
        return;
      }
      
      // Validate file type
      if (!validTypes.includes(file.type)) {
        errors.push({
          field: `description.newFiles.${index}`,
          message: 'Only JPG, PNG, and WebP files are allowed'
        });
      }
      
      // Validate file size
      if (file.size > maxSize) {
        errors.push({
          field: `description.newFiles.${index}`,
          message: 'File size must be less than 5MB'
        });
      }
      
      // Validate file name length
      if (file.name && file.name.length > 255) {
        errors.push({
          field: `description.newFiles.${index}`,
          message: 'File name is too long'
        });
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
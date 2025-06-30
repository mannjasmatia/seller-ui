// src/pages/edit-product/utils/changeTracking.ts
import {
  ProductAttribute,
  ProductAttributeGroup,
  ProductFormData,
  ProductImagesData,
} from "../pages/edit-product/types.edit-product";

export class ChangeTracker {
  // Deep compare two objects/arrays for equality
  private static deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return false;

    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== "object") return obj1 === obj2;

    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!this.deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  // Clean data for comparison (remove empty strings, null, undefined)
  private static cleanForComparison(data: any): any {
    if (data === null || data === undefined) return undefined;

    if (typeof data === "string") {
      const trimmed = data?.trim?.() || "";
      return trimmed === "" ? undefined : trimmed;
    }

    if (Array.isArray(data)) {
      const cleaned =
        data
          ?.map?.((item) => this.cleanForComparison(item))
          ?.filter?.((item) => item !== undefined && item !== "") || [];
      return cleaned?.length === 0 ? undefined : cleaned;
    }

    if (typeof data === "object") {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(data || {})) {
        const cleanedValue = this.cleanForComparison(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned)?.length === 0 ? undefined : cleaned;
    }

    return data;
  }

  // Compare specific step data
  static hasStepChanged(
    step: string,
    originalData: ProductFormData,
    currentData: ProductFormData
  ): boolean {
    if (!originalData && !currentData) return false;
    if (!originalData || !currentData) return true;

    const getStepData = (data: ProductFormData, stepName: string) => {
      if (!data || typeof data !== "object") return null;

      switch (stepName) {
        case "productInfo":
          return data.productInfo;
        case "attributes":
          return data.attributes;
        case "images":
          return data.images;
        case "pricing":
          return data.pricing;
        case "variations":
          return data.variations;
        case "services":
          return data.services;
        case "description":
          return data.description;
        default:
          return null;
      }
    };

    if (step === 'attributes') {
      return this.hasAttributesChanged(originalData.attributes, currentData.attributes);
    }

    if (step === "images") {
      const originalImages = originalData?.images;
      const currentImages = currentData?.images;
      return this.hasImagesChanged(originalImages, currentImages);
    }

    const originalStepData = this.cleanForComparison(
      getStepData(originalData, step)
    );
    const currentStepData = this.cleanForComparison(
      getStepData(currentData, step)
    );

    return !this.deepEqual(originalStepData, currentStepData);
  }

  // Check if any step has changes
  static hasAnyChanges(
    originalData: ProductFormData,
    currentData: ProductFormData
  ): boolean {
    const steps = [
      "productInfo",
      "attributes",
      "images",
      "pricing",
      "variations",
      "services",
      "description",
    ];
    return steps.some((step) =>
      this.hasStepChanged(step, originalData, currentData)
    );
  }

  // Get list of changed steps
  static getChangedSteps(
    originalData: ProductFormData,
    currentData: ProductFormData
  ): string[] {
    const steps = [
      "productInfo",
      "attributes",
      "images",
      "pricing",
      "variations",
      "services",
      "description",
    ];
    return steps.filter((step) =>
      this.hasStepChanged(step, originalData, currentData)
    );
  }

  // Special comparison for product info (handles about array properly)
  static hasProductInfoChanged(
    original: ProductFormData["productInfo"],
    current: ProductFormData["productInfo"]
  ): boolean {
    // Clean about arrays - filter out empty strings
    const cleanAbout = (about: string[]) =>
      about.filter((item) => item.trim() !== "");

    const originalCleaned = {
      name: original.name?.trim() || "",
      categoryId: original.categoryId?.trim() || "",
      about: cleanAbout(original.about || []),
      moq: original.moq || 1,
    };

    const currentCleaned = {
      name: current.name?.trim() || "",
      categoryId: current.categoryId?.trim() || "",
      about: cleanAbout(current.about || []),
      moq: current.moq || 1,
    };

    return !this.deepEqual(originalCleaned, currentCleaned);
  }

  // Special comparison for attributes (handles nested structure)
    // FIXED: Special comparison for attributes (handles nested structure properly)
  static hasAttributesChanged(
    original: ProductFormData['attributes'], 
    current: ProductFormData['attributes']
  ): boolean {
    // Handle null/undefined cases
    if (!original && !current) return false;
    if (!original || !current) return true;
    
    const cleanAttributes = (attrs: ProductAttributeGroup[]): ProductAttributeGroup[] => {
      if (!attrs || !Array.isArray(attrs)) return [];
      
      return attrs
        .filter(group => group?.name?.trim()) // Filter out groups with empty names
        .map(group => ({
          name: group.name.trim().toLowerCase(), // Normalize to lowercase for consistent comparison
          attributes: (group.attributes || [])
            .filter(attr => 
              attr?.field?.trim() && attr?.value?.trim() // Filter out empty attributes
            )
            .map(attr => ({
              field: attr.field.trim(), // Keep original case for field
              value: attr.value.trim(), // Keep original case for value
            }))
            .sort((a, b) => a.field.localeCompare(b.field)) // Sort attributes by field name
        }))
        .filter(group => group.attributes.length > 0) // Filter out groups with no valid attributes
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort groups by name
    };
    
    const originalCleaned = cleanAttributes(original);
    const currentCleaned = cleanAttributes(current);
    
    // Log for debugging (remove in production)
    console.log('Attributes Comparison:', {
      original: originalCleaned,
      current: currentCleaned,
      isEqual: this.deepEqual(originalCleaned, currentCleaned)
    });
    
    return !this.deepEqual(originalCleaned, currentCleaned);
  }

  // Special comparison for services (handles array of strings)
  static hasServicesChanged(original: string[], current: string[]): boolean {
    const cleanServices = (services: string[]) => {
      if (!services || !Array.isArray(services)) return [];
      return services
        .filter((service) => service?.trim())
        .map((service) => service.trim());
    };

    const originalCleaned = cleanServices(original);
    const currentCleaned = cleanServices(current);

    return !this.deepEqual(originalCleaned, currentCleaned);
  }

  // Special comparison for description points
  static hasDescriptionChanged(
    original: ProductFormData["description"],
    current: ProductFormData["description"]
  ): boolean {
    const cleanDescription = (desc: any) => {
      if (!desc) return { points: [], attributes: [], images: [] };

      return {
        points: (desc.points || [])
          .filter((point: string) => point?.trim())
          .map((point: string) => point.trim()),
        attributes: (desc.attributes || [])
          .filter((attr: any) => attr.field?.trim() && attr.value?.trim())
          .map((attr: any) => ({
            field: attr.field.trim(),
            value: attr.value.trim(),
          })),
        images: (desc.images || []).filter((img: string) => img?.trim()),
      };
    };

    const originalCleaned = cleanDescription(original);
    const currentCleaned = cleanDescription(current);

    // Check if points or attributes have changed
    const pointsOrAttributesChanged = !this.deepEqual(
      {
        points: originalCleaned.points,
        attributes: originalCleaned.attributes,
      },
      { points: currentCleaned.points, attributes: currentCleaned.attributes }
    );

    // Check if there are new files to upload
    const hasNewFiles = current?.newFiles && current.newFiles.length > 0;

    // Check if existing images have been modified (added/removed)
    // Compare original images with current images to detect changes
    const originalImages = (original?.images || [])
      .filter((img: string) => img?.trim())
      .sort();
    const currentImages = (current?.images || [])
      .filter((img: string) => img?.trim())
      .sort();
    const existingImagesChanged = !this.deepEqual(
      originalImages,
      currentImages
    );

    // Return true if any of these conditions are met:
    // 1. Points or attributes have changed
    // 2. There are new files ready to upload
    // 3. Existing images have been added/removed
    return pointsOrAttributesChanged || hasNewFiles || existingImagesChanged;
  }
  static hasImagesChanged(
    original: ProductImagesData,
    current: ProductImagesData
  ): boolean {
    // Safety checks
    if (!original && !current) return false;
    if (!original || !current) return true;

    // Safely extract arrays with defaults
    const originalImages = original?.originalImages || [];
    const currentImages = current?.images || [];
    const currentNewFiles = current?.newFiles || [];

    // Check if any original images were removed
    const removedImages =
      originalImages?.filter?.(
        (img) => img && !currentImages?.includes?.(img)
      ) || [];

    // Check if new files were added
    const hasNewFiles = (currentNewFiles?.length || 0) > 0;

    // Check if the order of existing images changed
    const existingImagesInCurrent =
      currentImages?.filter?.(
        (img) => img && originalImages?.includes?.(img)
      ) || [];
    const originalImagesFiltered =
      originalImages?.filter?.(
        (img) => img && currentImages?.includes?.(img)
      ) || [];

    const orderChanged = !this.deepEqual(
      existingImagesInCurrent,
      originalImagesFiltered
    );

    return removedImages.length > 0 || hasNewFiles || orderChanged;
  }
}

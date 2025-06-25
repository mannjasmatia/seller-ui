// src/pages/EditProduct/useEditProduct.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ProductStep,
  ProductFormData,
  ValidationError,
  ProductImagesData,
} from "./types.edit-product";
import {
  useGetProductInfoApi,
  useUpdateProductInfoApi,
  useGetProductAttributesApi,
  useSyncProductAttributesApi,
  useGetProductImagesApi,
  useSyncProductImagesApi,
  useGetProductPricingApi,
  useSyncProductPricingApi,
  useGetProductVariationsApi,
  useSyncProductVariationsApi,
  useGetProductServicesApi,
  useSyncProductServicesApi,
  useGetProductDescriptionApi,
  useSyncProductDescriptionApi,
  useSyncProductDescriptionImagesApi,
  useGetCategoriesApi,
} from "../../api/api-hooks/useEditProductApi";
import { customToast } from "../../toast-config/customToast";
import translations from "./translations.json";
import { ProductValidator } from "../../utils/validation.editProduct";
import { ChangeTracker } from "../../utils/changeTracker.editProduct";

const STEPS: ProductStep[] = [
  "productInfo",
  "attributes",
  "images",
  "pricing",
  "variations",
  "services",
  "description",
];

const STEP_ROUTES = {
  productInfo: "product-info",
  attributes: "attributes",
  images: "images",
  pricing: "pricing",
  variations: "variations",
  services: "services",
  description: "description",
};

export const useEditProduct = () => {
  const navigate = useNavigate();
  const { productId, step: stepParam, lang } = useParams();

  // Convert step param to step index
  const currentStepIndex = useMemo(() => {
    if (!stepParam) return 0;
    const stepKey = Object.keys(STEP_ROUTES).find(
      (key) => STEP_ROUTES[key as ProductStep] === stepParam
    ) as ProductStep;
    return stepKey ? STEPS.indexOf(stepKey) : 0;
  }, [stepParam]);

  const currentStep = STEPS[currentStepIndex];

  // State
  const [formData, setFormData] = useState<ProductFormData>({
    productInfo: {
      name: "",
      categoryId: "",
      about: ["", ""],
      //   moq: 1
    },
    attributes: [],
    images: {
        images: [],
        originalImages: [],
        newFiles: []
    }, 
    pricing: {
      basePrice: 0,
      quantityPriceTiers: [],
      leadTime: [],
    },
    variations: {
      variations: [],
      customizableOptions: [],
    },
    services: [],
    description: {
      points: [],
      attributes: [],
      images: [],
    },
  });

  //   This was needed to track original form data for change detection
  const [originalFormData, setOriginalFormData] = useState<ProductFormData>({
    productInfo: {
      name: "",
      categoryId: "",
      about: ["", ""],
    },
    attributes: [],
    images: {
        images: [],
        originalImages: [],
        newFiles: []
    },
    pricing: {
      basePrice: 0,
      quantityPriceTiers: [],
      leadTime: [],
    },
    variations: {
      variations: [],
      customizableOptions: [],
    },
    services: [],
    description: {
      points: [],
      attributes: [],
      images: [],
    },
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [pendingNavigationStep, setPendingNavigationStep] = useState<
    number | null
  >(null);

  // API Hooks - Main product info (always loaded)
  const { data: productData, isLoading: isLoadingProduct } =
    useGetProductInfoApi(productId || "");
  const { data: categoriesData } = useGetCategoriesApi();

  // Step-specific API hooks - only enabled when on that step
  const { data: attributesData, isLoading: isLoadingAttributes } =
    useGetProductAttributesApi(productId || "", currentStep === "attributes");
  const { data: imagesData, isLoading: isLoadingImages } =
    useGetProductImagesApi(productId || "", currentStep === "images");
    console.log("========>Images data:", imagesData);
  const { data: pricingData, isLoading: isLoadingPricing } =
    useGetProductPricingApi(productId || "", currentStep === "pricing");
  const { data: variationsData, isLoading: isLoadingVariations } =
    useGetProductVariationsApi(productId || "", currentStep === "variations");
  const { data: servicesData, isLoading: isLoadingServices } =
    useGetProductServicesApi(productId || "", currentStep === "services");
  const { data: descriptionData, isLoading: isLoadingDescription } =
    useGetProductDescriptionApi(productId || "", currentStep === "description");

  // Mutation hooks
  const { mutate: updateProductInfo, isPending: isUpdatingProductInfo } =
    useUpdateProductInfoApi();
  const { mutate: syncAttributes, isPending: isSyncingAttributes } =
    useSyncProductAttributesApi();
  const { mutate: syncImages, isPending: isSyncingImages } =
    useSyncProductImagesApi();
  const { mutate: syncPricing, isPending: isSyncingPricing } =
    useSyncProductPricingApi();
  const { mutate: syncVariations, isPending: isSyncingVariations } =
    useSyncProductVariationsApi();
  const { mutate: syncServices, isPending: isSyncingServices } =
    useSyncProductServicesApi();
  const { mutate: syncDescription, isPending: isSyncingDescription } =
    useSyncProductDescriptionApi();
  const {
    mutate: syncDescriptionImages,
    isPending: isSyncingDescriptionImages,
  } = useSyncProductDescriptionImagesApi();

  // Initialize form data when loading product info
  useEffect(() => {
    if (productData) {
      const productInfo = {
        name: productData.name || "",
        categoryId: productData.categoryId._id || "",
        about: productData.about || ["", ""],
      };

      setFormData((prev) => ({
        ...prev,
        productInfo,
      }));

      // Store original data
      setOriginalFormData((prev) => ({
        ...prev,
        productInfo,
      }));

      // Set completed steps based on product completion status
      if (productData.stepStatus) {
        const completed = new Set<number>();
        STEPS.forEach((step, index) => {
          if (productData.stepStatus[step]) {
            completed.add(index);
          }
        });
        setCompletedSteps(completed);
      }
    }
  }, [productData]);

  // Update all the step data loading effects similarly:
  useEffect(() => {
    if (attributesData) {
      setFormData((prev) => ({
        ...prev,
        attributes: attributesData || [],
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        attributes: attributesData || [],
      }));
    }
  }, [attributesData]);

  useEffect(() => {
    console.log("Images data effect triggered", imagesData);
  if (imagesData) {
    console.log("Images data loaded:", imagesData);
    const imageData = {
      images: imagesData || [],
      originalImages: imagesData || [],
      newFiles: []
    };
    
    setFormData(prev => ({
      ...prev,
      images: imageData
    }));
    setOriginalFormData(prev => ({
      ...prev,
      images: imageData
    }));
  }
}, [imagesData]);

  useEffect(() => {
    if (pricingData) {
      const pricing = {
        basePrice: pricingData.basePrice || 0,
        quantityPriceTiers: pricingData.quantityPriceTiers || [],
        leadTime: pricingData.leadTime || [],
      };
      setFormData((prev) => ({
        ...prev,
        pricing,
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        pricing,
      }));
    }
  }, [pricingData]);

  useEffect(() => {
    if (variationsData) {
      const variations = {
        variations: variationsData.variations || [],
        customizableOptions: variationsData.customizableOptions || [],
      };
      setFormData((prev) => ({
        ...prev,
        variations,
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        variations,
      }));
    }
  }, [variationsData]);

  useEffect(() => {
    if (servicesData) {
      setFormData((prev) => ({
        ...prev,
        services: servicesData || [],
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        services: servicesData || [],
      }));
    }
  }, [servicesData]);

  useEffect(() => {
    if (descriptionData) {
      const description = {
        points: descriptionData.points || [],
        attributes: descriptionData.attributes || [],
        images: descriptionData.images || [],
      };
      setFormData((prev) => ({
        ...prev,
        description,
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        description,
      }));
    }
  }, [descriptionData]);

    const hasImagesChanged = useCallback((): boolean => {
  const { images, originalImages, newFiles } = formData.images;
  
  // Check if any original images were removed
  const removedImages = originalImages.filter(img => !images.includes(img));
  
  // Check if new files were added
  const hasNewFiles = newFiles.length > 0;
  
  return removedImages.length > 0 || hasNewFiles;
}, [formData.images]);

  // Check if current step has changes
  const hasCurrentStepChanged = useCallback((): boolean => {
  switch (currentStep) {
    case 'images':
      return hasImagesChanged();
    case 'productInfo':
      return ChangeTracker.hasProductInfoChanged(originalFormData.productInfo, formData.productInfo);
    case 'attributes':
      return ChangeTracker.hasAttributesChanged(originalFormData.attributes, formData.attributes);
    case 'services':
      return ChangeTracker.hasServicesChanged(originalFormData.services, formData.services);
    case 'description':
      return ChangeTracker.hasDescriptionChanged(originalFormData.description, formData.description);
    default:
      return ChangeTracker.hasStepChanged(currentStep, originalFormData, formData);
  }
}, [currentStep, originalFormData, formData, hasImagesChanged]);

  const hasUnsavedChanges = useMemo(() => {
    return hasCurrentStepChanged();
  }, [hasCurrentStepChanged]);

  // Navigation functions
  const navigateToStep = useCallback(
    (stepIndex: number, force = false) => {
      if (hasUnsavedChanges && !force) {
        setPendingNavigationStep(stepIndex);
        return false;
      }

      const step = STEPS[stepIndex];
      const route = STEP_ROUTES[step];
      navigate(`/${lang}/products/edit/${productId}/${route}`);
      return true;
    },
    [navigate, lang, productId, hasUnsavedChanges]
  );

  // Add these new functions after validateCurrentStep:

  const handleNavigationConfirm = useCallback(
    (saveFirst: boolean) => {
      if (saveFirst && pendingNavigationStep !== null) {
        saveCurrentStep().then((success) => {
          if (success && pendingNavigationStep !== null) {
            navigateToStep(pendingNavigationStep, true);
          }
          setPendingNavigationStep(null);
        });
      } else if (pendingNavigationStep !== null) {
        navigateToStep(pendingNavigationStep, true);
        setPendingNavigationStep(null);
      }
    },
    [pendingNavigationStep, navigateToStep]
  );

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      navigateToStep(currentStepIndex + 1);
    }
  }, [currentStepIndex, navigateToStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      navigateToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, navigateToStep]);

  // Form data update functions
  const updateFormData = useCallback(
    <K extends keyof ProductFormData>(
      section: K,
      data: ProductFormData[K] | Partial<ProductFormData[K]>
    ) => {
      setFormData((prev) => ({
        ...prev,
        [section]:
          typeof data === "object" && data !== null && !Array.isArray(data)
            ? { ...(prev[section] as object), ...data }
            : data,
      }));
    },
    []
  );

    const validateImages = useCallback((imageData: ProductImagesData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check if there's at least one image (existing or new)
  const existingCount = imageData.images.length;
  const newFilesCount = imageData.newFiles.length;
  
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
  
  // Validate file types for new files
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  imageData.newFiles.forEach((file, index) => {
    if (!validTypes.includes(file.type)) {
      errors.push({
        field: `images.newFiles.${index}`,
        message: 'Only JPG, PNG, and WebP files are allowed'
      });
    }
    
    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push({
        field: `images.newFiles.${index}`,
        message: 'File size must be less than 5MB'
      });
    }
  });
  
  return errors;
}, []);

  // Validation functions
  const validateCurrentStep = useCallback((): boolean => {
  let errors: ValidationError[] = [];
  
  switch (currentStep) {
    case 'images':
      errors = validateImages(formData.images);
      break;
    default:
      errors = ProductValidator.validateStep(currentStep, formData);
  }
  
  setValidationErrors(errors);
  return errors.length === 0;
}, [currentStep, formData, validateImages]);

  // Helper function to create FormData for file uploads
const createFormDataForImages = (imageData: ProductImagesData) => {
  const formDataObj = new FormData();
  
  if (!imageData) return formDataObj;
  
  const { images = [], newFiles = [] } = imageData;
  
  // Add existing images to keep
  images?.forEach?.((image, index) => {
    if (image && typeof image === 'string') {
      formDataObj.append(`images[${index}]`, image);
    }
  });
  
  // Add new files
  newFiles?.forEach?.(file => {
    if (file instanceof File) {
      formDataObj.append('files', file);
    }
  });
  
  return formDataObj;
}

  // Save functions
  const saveCurrentStep = useCallback(async () => {
    if (!validateCurrentStep()) {
      customToast.error(translations.messages.saveError);
      return false;
    }

    if (!productId) {
      customToast.error("Product ID not found");
      return false;
    }

    try {
      switch (currentStep) {
        case "productInfo":
          await new Promise((resolve, reject) => {
            updateProductInfo(
              { productId, data: formData.productInfo },
              {
                onSuccess: resolve,
                onError: reject,
              }
            );
          });
          break;

        case "attributes":
          await new Promise((resolve, reject) => {
            syncAttributes(
              { productId, data: { attributes: formData.attributes } },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case "images":
        // Create FormData for image upload
        const formDataObj = new FormData();
        
        // Add existing images that should be kept
        formData.images.images.forEach((image, index) => {
          formDataObj.append(`images[${index}]`, image);
        });
        
        // Add new files
        formData.images.newFiles.forEach(file => {
          formDataObj.append('files', file);
        });
        
        await new Promise((resolve, reject) => {
          syncImages(
            { productId, formData: formDataObj },
            {
              onSuccess: (response) => {
                // Update the form data to reflect the saved state
                const newImageUrls = response?.data?.response || [];
                const updatedImageData = {
                  images: [...formData.images.images, ...newImageUrls],
                  originalImages: [...formData.images.images, ...newImageUrls],
                  newFiles: []
                };
                
                setFormData(prev => ({
                  ...prev,
                  images: updatedImageData
                }));
                
                setOriginalFormData(prev => ({
                  ...prev,
                  images: updatedImageData
                }));
                
                resolve(response);
              },
              onError: reject
            }
          );
        });
        break;

        case "pricing":
          await new Promise((resolve, reject) => {
            syncPricing(
              { productId, data: formData.pricing },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case "variations":
          await new Promise((resolve, reject) => {
            syncVariations(
              { productId, data: formData.variations },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case "services":
          await new Promise((resolve, reject) => {
            syncServices(
              { productId, data: { services: formData.services } },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case "description":
          await new Promise((resolve, reject) => {
            syncDescription(
              {
                productId,
                data: {
                  points: formData.description.points,
                  attributes: formData.description.attributes,
                },
              },
              { onSuccess: resolve, onError: reject }
            );
          });

        //   if (formData.description.images.length > 0) {
        //     const descImageFormData = createFormDataForImages(
        //       formData.description.images
        //     );
        //     await new Promise((resolve, reject) => {
        //       syncDescriptionImages(
        //         { productId, formData: descImageFormData },
        //         { onSuccess: resolve, onError: reject }
        //       );
        //     });
        //   }
          break;
      }

      setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));
      customToast.success(translations.messages.saveSuccess);
      return true;
    } catch (error) {
      customToast.error(translations.messages.saveError);
      return false;
    }
  }, [
    currentStep,
    currentStepIndex,
    formData,
    productId,
    validateCurrentStep,
    updateProductInfo,
    syncAttributes,
    syncImages,
    syncPricing,
    syncVariations,
    syncServices,
    syncDescription,
    syncDescriptionImages,
  ]);

  const saveAndNext = useCallback(async () => {
    const success = await saveCurrentStep();
    if (success) {
      goToNextStep();
    }
  }, [saveCurrentStep, goToNextStep]);

  // File upload helpers


  // Get categories for dropdown
  const categories = useMemo(() => {
    return categoriesData?.docs || [];
  }, [categoriesData]);

  // Check if step is completed
  const isStepCompleted = useCallback(
    (stepIndex: number) => {
      return completedSteps.has(stepIndex);
    },
    [completedSteps]
  );

  // Check current step loading state
  const isCurrentStepLoading = useMemo(() => {
    switch (currentStep) {
      case "productInfo":
        return isLoadingProduct;
      case "attributes":
        return isLoadingAttributes;
      case "images":
        return isLoadingImages;
      case "pricing":
        return isLoadingPricing;
      case "variations":
        return isLoadingVariations;
      case "services":
        return isLoadingServices;
      case "description":
        return isLoadingDescription;
      default:
        return false;
    }
  }, [
    currentStep,
    isLoadingProduct,
    isLoadingAttributes,
    isLoadingImages,
    isLoadingPricing,
    isLoadingVariations,
    isLoadingServices,
    isLoadingDescription,
  ]);

  // Check if current step has pending operations
  const isPending = useMemo(() => {
    switch (currentStep) {
      case "productInfo":
        return isUpdatingProductInfo;
      case "attributes":
        return isSyncingAttributes;
      case "images":
        return isSyncingImages;
      case "pricing":
        return isSyncingPricing;
      case "variations":
        return isSyncingVariations;
      case "services":
        return isSyncingServices;
      case "description":
        return isSyncingDescription || isSyncingDescriptionImages;
      default:
        return false;
    }
  }, [
    currentStep,
    isUpdatingProductInfo,
    isSyncingAttributes,
    isSyncingImages,
    isSyncingPricing,
    isSyncingVariations,
    isSyncingServices,
    isSyncingDescription,
    isSyncingDescriptionImages,
  ]);

  // Progress calculation
  const progressPercentage = useMemo(() => {
    return Math.round((completedSteps.size / STEPS.length) * 100);
  }, [completedSteps]);

  return {
    // State
    formData,
    validationErrors,
    completedSteps,
    currentStepIndex,
    currentStep,
    isPending,
    isCurrentStepLoading,
    progressPercentage,

    // to track changes
    hasCurrentStepChanged,
    hasUnsavedChanges, // Updated to use change tracking
    originalFormData,

    // Pending navigation
    pendingNavigationStep,
    handleNavigationConfirm,
    setPendingNavigationStep,

    // Data
    categories,

    // Navigation
    navigateToStep,
    goToNextStep,
    goToPreviousStep,

    // Form management
    updateFormData,
    validateCurrentStep,
    saveCurrentStep,
    saveAndNext,
    isStepCompleted,

    // Constants
    STEPS,
    STEP_ROUTES,

    // Utils
    translations,
  };
};

export default useEditProduct;

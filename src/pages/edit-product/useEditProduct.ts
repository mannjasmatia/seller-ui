// src/pages/EditProduct/useEditProduct.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ProductStep, 
  ProductFormData, 
  ValidationError
} from './types.edit-product';
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
  useGetCategoriesApi
} from '../../api/api-hooks/useEditProductApi';
import { customToast } from '../../toast-config/customToast';
import translations from './translations.json';

const STEPS: ProductStep[] = [
  'productInfo',
  'attributes', 
  'images',
  'pricing',
  'variations',
  'services',
  'description'
];

const STEP_ROUTES = {
  'productInfo': 'product-info',
  'attributes': 'attributes',
  'images': 'images', 
  'pricing': 'pricing',
  'variations': 'variations',
  'services': 'services',
  'description': 'description'
};

export const useEditProduct = () => {
  const navigate = useNavigate();
  const { productId, step: stepParam, lang } = useParams();
  
  // Convert step param to step index
  const currentStepIndex = useMemo(() => {
    if (!stepParam) return 0;
    const stepKey = Object.keys(STEP_ROUTES).find(
      key => STEP_ROUTES[key as ProductStep] === stepParam
    ) as ProductStep;
    return stepKey ? STEPS.indexOf(stepKey) : 0;
  }, [stepParam]);

  const currentStep = STEPS[currentStepIndex];

  // State
  const [formData, setFormData] = useState<ProductFormData>({
    productInfo: {
      name: '',
      categoryId: '',
      about: ['', ''],
    //   moq: 1
    },
    attributes: [],
    images: [],
    pricing: {
      basePrice: 0,
      quantityPriceTiers: [],
      leadTime: []
    },
    variations: {
      variations: [],
      customizableOptions: []
    },
    services: [],
    description: {
      points: [],
      attributes: [],
      images: []
    }
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [pendingNavigationStep, setPendingNavigationStep] = useState<number | null>(null);

  // API Hooks - Main product info (always loaded)
  const { data: productData, isLoading: isLoadingProduct } = useGetProductInfoApi(productId || '');
  const { data: categoriesData } = useGetCategoriesApi();

  // Step-specific API hooks - only enabled when on that step
  const { data: attributesData, isLoading: isLoadingAttributes } = useGetProductAttributesApi(
    productId || '', 
    currentStep === 'attributes'
  );
  const { data: imagesData, isLoading: isLoadingImages } = useGetProductImagesApi(
    productId || '', 
    currentStep === 'images'
  );
  const { data: pricingData, isLoading: isLoadingPricing } = useGetProductPricingApi(
    productId || '', 
    currentStep === 'pricing'
  );
  const { data: variationsData, isLoading: isLoadingVariations } = useGetProductVariationsApi(
    productId || '', 
    currentStep === 'variations'
  );
  const { data: servicesData, isLoading: isLoadingServices } = useGetProductServicesApi(
    productId || '', 
    currentStep === 'services'
  );
  const { data: descriptionData, isLoading: isLoadingDescription } = useGetProductDescriptionApi(
    productId || '', 
    currentStep === 'description'
  );

  // Mutation hooks
  const { mutate: updateProductInfo, isPending: isUpdatingProductInfo } = useUpdateProductInfoApi();
  const { mutate: syncAttributes, isPending: isSyncingAttributes } = useSyncProductAttributesApi();
  const { mutate: syncImages, isPending: isSyncingImages } = useSyncProductImagesApi();
  const { mutate: syncPricing, isPending: isSyncingPricing } = useSyncProductPricingApi();
  const { mutate: syncVariations, isPending: isSyncingVariations } = useSyncProductVariationsApi();
  const { mutate: syncServices, isPending: isSyncingServices } = useSyncProductServicesApi();
  const { mutate: syncDescription, isPending: isSyncingDescription } = useSyncProductDescriptionApi();
  const { mutate: syncDescriptionImages, isPending: isSyncingDescriptionImages } = useSyncProductDescriptionImagesApi();

  // Initialize form data when loading product info
  useEffect(() => {
    if (productData) {
      setFormData(prev => ({
        ...prev,
        productInfo: {
          name: productData.name || '',
          categoryId: productData.categoryId._id || '',
          about: productData.about || ['', ''],
        //   moq: productData.moq || 1
        }
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

  // Load step-specific data when available
  useEffect(() => {
    if (attributesData) {
      setFormData(prev => ({
        ...prev,
        attributes: attributesData || []
      }));
    }
  }, [attributesData]);

  useEffect(() => {
    if (imagesData) {
      setFormData(prev => ({
        ...prev,
        images: imagesData || []
      }));
    }
  }, [imagesData]);

  useEffect(() => {
    if (pricingData) {
      setFormData(prev => ({
        ...prev,
        pricing: {
          basePrice: pricingData.basePrice || 0,
          quantityPriceTiers: pricingData.quantityPriceTiers || [],
          leadTime: pricingData.leadTime || []
        }
      }));
    }
  }, [pricingData]);

  useEffect(() => {
    if (variationsData) {
      setFormData(prev => ({
        ...prev,
        variations: {
          variations: variationsData.variations || [],
          customizableOptions: variationsData.customizableOptions || []
        }
      }));
    }
  }, [variationsData]);

  useEffect(() => {
    if (servicesData) {
      setFormData(prev => ({
        ...prev,
        services: servicesData || []
      }));
    }
  }, [servicesData]);

  useEffect(() => {
    if (descriptionData) {
      setFormData(prev => ({
        ...prev,
        description: {
          points: descriptionData.points || [],
          attributes: descriptionData.attributes || [],
          images: descriptionData.images || []
        }
      }));
    }
  }, [descriptionData]);

  // Navigation functions
  const navigateToStep = useCallback((stepIndex: number, force = false) => {
    if (hasUnsavedChanges && !force) {
      setPendingNavigationStep(stepIndex);
      return false;
    }
    
    const step = STEPS[stepIndex];
    const route = STEP_ROUTES[step];
    navigate(`/${lang}/products/edit/${productId}/${route}`);
    return true;
  }, [navigate, lang, productId, hasUnsavedChanges]);

  const handleNavigationConfirm = useCallback((saveFirst: boolean) => {
    if (saveFirst && pendingNavigationStep !== null) {
      saveCurrentStep().then(success => {
        if (success && pendingNavigationStep !== null) {
          navigateToStep(pendingNavigationStep, true);
        }
        setPendingNavigationStep(null);
      });
    } else if (pendingNavigationStep !== null) {
      setHasUnsavedChanges(false);
      navigateToStep(pendingNavigationStep, true);
      setPendingNavigationStep(null);
    }
  }, [pendingNavigationStep, navigateToStep]);

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
  const updateFormData = useCallback(<K extends keyof ProductFormData>(
    section: K,
    data: ProductFormData[K] | Partial<ProductFormData[K]>
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof data === 'object' && data !== null && !Array.isArray(data)
        ? { ...prev[section] as object, ...data }
        : data
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Validation functions
  const validateCurrentStep = useCallback((): boolean => {
    const errors: ValidationError[] = [];

    switch (currentStep) {
      case 'productInfo':
        if (!formData.productInfo.name.trim()) {
          errors.push({ field: 'name', message: translations.validation.required });
        }
        if (!formData.productInfo.categoryId) {
          errors.push({ field: 'categoryId', message: translations.validation.required });
        }
        if (formData.productInfo.about.filter(item => item.trim()).length < 2) {
          errors.push({ field: 'about', message: translations.validation.minPoints.replace('{min}', '2') });
        }
        break;
      
      case 'pricing':
        if (!formData.pricing.basePrice || formData.pricing.basePrice <= 0) {
          errors.push({ field: 'basePrice', message: translations.validation.required });
        }
        if (!formData.pricing.leadTime.length) {
          errors.push({ field: 'leadTime', message: translations.validation.required });
        }
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentStep, formData]);

  // Helper function to create FormData for file uploads
  const createFormDataForImages = (images: string[], files?: FileList) => {
    const formData = new FormData();
    
    if (images) {
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    if (files) {
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
    }
    
    return formData;
  };

  // Save functions
  const saveCurrentStep = useCallback(async () => {
    if (!validateCurrentStep()) {
      customToast.error(translations.messages.saveError);
      return false;
    }

    if (!productId) {
      customToast.error('Product ID not found');
      return false;
    }

    try {
      switch (currentStep) {
        case 'productInfo':
          await new Promise((resolve, reject) => {
            updateProductInfo(
              { productId, data: formData.productInfo },
              {
                onSuccess: resolve,
                onError: reject
              }
            );
          });
          break;

        case 'attributes':
          await new Promise((resolve, reject) => {
            syncAttributes(
              { productId, data: { attributes: formData.attributes } },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'images':
          const imageFormData = createFormDataForImages(formData.images);
          await new Promise((resolve, reject) => {
            syncImages(
              { productId, formData: imageFormData },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'pricing':
          await new Promise((resolve, reject) => {
            syncPricing(
              { productId, data: formData.pricing },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'variations':
          await new Promise((resolve, reject) => {
            syncVariations(
              { productId, data: formData.variations },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'services':
          await new Promise((resolve, reject) => {
            syncServices(
              { productId, data: { services: formData.services } },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'description':
          await new Promise((resolve, reject) => {
            syncDescription(
              { 
                productId, 
                data: {
                  points: formData.description.points,
                  attributes: formData.description.attributes
                }
              },
              { onSuccess: resolve, onError: reject }
            );
          });
          
          if (formData.description.images.length > 0) {
            const descImageFormData = createFormDataForImages(formData.description.images);
            await new Promise((resolve, reject) => {
              syncDescriptionImages(
                { productId, formData: descImageFormData },
                { onSuccess: resolve, onError: reject }
              );
            });
          }
          break;
      }

      setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
      setHasUnsavedChanges(false);
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
    syncDescriptionImages
  ]);

  const saveAndNext = useCallback(async () => {
    const success = await saveCurrentStep();
    if (success) {
      goToNextStep();
    }
  }, [saveCurrentStep, goToNextStep]);

  // File upload helpers
  const uploadImages = useCallback(async (files: FileList, section: 'images' | 'description') => {
    if (!productId) return false;

    try {
      const formDataObj = new FormData();
      
      const existingImages = section === 'images' ? formData.images : formData.description.images;
      existingImages.forEach((image, index) => {
        formDataObj.append(`images[${index}]`, image);
      });
      
      Array.from(files).forEach(file => {
        formDataObj.append('files', file);
      });

      if (section === 'images') {
        await new Promise((resolve, reject) => {
          syncImages(
            { productId, formData: formDataObj },
            { onSuccess: resolve, onError: reject }
          );
        });
      } else {
        await new Promise((resolve, reject) => {
          syncDescriptionImages(
            { productId, formData: formDataObj },
            { onSuccess: resolve, onError: reject }
          );
        });
      }
      
      customToast.success(translations.messages.uploadSuccess);
      return true;
    } catch (error) {
      customToast.error(translations.messages.uploadError);
      return false;
    }
  }, [productId, syncImages, syncDescriptionImages, formData]);

  // Get categories for dropdown
  const categories = useMemo(() => {
    return categoriesData?.docs || [];
  }, [categoriesData]);

  // Check if step is completed
  const isStepCompleted = useCallback((stepIndex: number) => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  // Check current step loading state
  const isCurrentStepLoading = useMemo(() => {
    switch (currentStep) {
      case 'productInfo':
        return isLoadingProduct;
      case 'attributes':
        return isLoadingAttributes;
      case 'images':
        return isLoadingImages;
      case 'pricing':
        return isLoadingPricing;
      case 'variations':
        return isLoadingVariations;
      case 'services':
        return isLoadingServices;
      case 'description':
        return isLoadingDescription;
      default:
        return false;
    }
  }, [currentStep, isLoadingProduct, isLoadingAttributes, isLoadingImages, isLoadingPricing, isLoadingVariations, isLoadingServices, isLoadingDescription]);

  // Check if current step has pending operations
  const isPending = useMemo(() => {
    switch (currentStep) {
      case 'productInfo':
        return isUpdatingProductInfo;
      case 'attributes':
        return isSyncingAttributes;
      case 'images':
        return isSyncingImages;
      case 'pricing':
        return isSyncingPricing;
      case 'variations':
        return isSyncingVariations;
      case 'services':
        return isSyncingServices;
      case 'description':
        return isSyncingDescription || isSyncingDescriptionImages;
      default:
        return false;
    }
  }, [currentStep, isUpdatingProductInfo, isSyncingAttributes, isSyncingImages, isSyncingPricing, isSyncingVariations, isSyncingServices, isSyncingDescription, isSyncingDescriptionImages]);

  // Progress calculation
  const progressPercentage = useMemo(() => {
    return Math.round((completedSteps.size / STEPS.length) * 100);
  }, [completedSteps]);

  return {
    // State
    formData,
    validationErrors,
    hasUnsavedChanges,
    completedSteps,
    currentStepIndex,
    currentStep,
    isPending,
    isCurrentStepLoading,
    progressPercentage,
    
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
    uploadImages,
    isStepCompleted,
    
    // Constants
    STEPS,
    STEP_ROUTES,
    
    // Utils
    translations
  };
};

export default useEditProduct;
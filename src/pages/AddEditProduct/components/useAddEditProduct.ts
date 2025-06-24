// src/pages/products/hooks/useAddEditProduct.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ProductStep, 
  ProductFormData, 
  ProductInfo,
  ProductAttributeGroup,
  ProductPricing,
  ProductVariations,
  ProductDescription,
  ValidationError
} from '../types.add-edit-product';
import {
  useCreateProductApi,
  useUpdateProductInfoApi,
  useGetProductInfoApi,
  useSyncProductAttributesApi,
  useGetProductAttributesApi,
  useSyncProductImagesApi,
  useGetProductImagesApi,
  useSyncProductPricingApi,
  useGetProductPricingApi,
  useSyncProductVariationsApi,
  useGetProductVariationsApi,
  useSyncProductServicesApi,
  useGetProductServicesApi,
  useSyncProductDescriptionApi,
  useSyncProductDescriptionImagesApi,
  useGetProductDescriptionApi,
  useGetCategoriesApi
} from '../../../api/api-hooks/useAddEditProduct';
import { customToast } from '../../../toast-config/customToast';
import translations from '../translations.json';

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

export const useAddEditProduct = () => {
  const navigate = useNavigate();
  const { productId, step: stepParam, lang } = useParams();
  const isEditMode = !!productId;
  
  // Convert step param to step index
  const currentStepIndex = useMemo(() => {
    if (!stepParam) return 0;
    const stepKey = Object.keys(STEP_ROUTES).find(
      key => STEP_ROUTES[key as ProductStep] === stepParam
    ) as ProductStep;
    return stepKey ? STEPS.indexOf(stepKey) : 0;
  }, [stepParam]);

  // State
  const [formData, setFormData] = useState<ProductFormData>({
    productInfo: {
      name: '',
      categoryId: '',
      about: ['', ''],
      moq: 1
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


  // API Hooks
  const { data: categoriesData } = useGetCategoriesApi();
  const { data: productData, isLoading: isLoadingProduct } = useGetProductInfoApi(productId || '');
  
  // Product Info APIs
  const { mutate: createProduct, isPending: isCreatingProduct } = useCreateProductApi();
  const { mutate: updateProductInfo, isPending: isUpdatingProductInfo } = useUpdateProductInfoApi();
  
  // Step-specific APIs
  const { mutate: syncAttributes, isPending: isSyncingAttributes } = useSyncProductAttributesApi();
  const { mutate: syncImages, isPending: isSyncingImages } = useSyncProductImagesApi();
  const { mutate: syncPricing, isPending: isSyncingPricing } = useSyncProductPricingApi();
  const { mutate: syncVariations, isPending: isSyncingVariations } = useSyncProductVariationsApi();
  const { mutate: syncServices, isPending: isSyncingServices } = useSyncProductServicesApi();
  const { mutate: syncDescription, isPending: isSyncingDescription } = useSyncProductDescriptionApi();
  const { mutate: syncDescriptionImages, isPending: isSyncingDescriptionImages } = useSyncProductDescriptionImagesApi();

  // Load existing data for each step when in edit mode
  const { data: attributesData } = useGetProductAttributesApi(productId || '');
  const { data: imagesData } = useGetProductImagesApi(productId || '');
  const { data: pricingData } = useGetProductPricingApi(productId || '');
  const { data: variationsData } = useGetProductVariationsApi(productId || '');
  const { data: servicesData } = useGetProductServicesApi(productId || '');
  const { data: descriptionData } = useGetProductDescriptionApi(productId || '');

  // Initialize form data when loading existing product
  useEffect(() => {
    if (isEditMode && productData?.data?.response) {
      const product = productData.data.response;
      setFormData(prev => ({
        ...prev,
        productInfo: {
          name: product.name || '',
          categoryId: product.categoryId || '',
          about: product.about || ['', ''],
          moq: product.moq || 1
        }
      }));
      
      // Set completed steps based on product completion status
      if (product.stepStatus) {
        const completed = new Set<number>();
        STEPS.forEach((step, index) => {
          if (product.stepStatus[step]) {
            completed.add(index);
          }
        });
        setCompletedSteps(completed);
      }
    }
  }, [productData, isEditMode]);

  // Load step-specific data
  useEffect(() => {
    if (attributesData?.data?.response) {
      setFormData(prev => ({
        ...prev,
        attributes: attributesData.data.response || []
      }));
    }
  }, [attributesData]);

  useEffect(() => {
    if (imagesData?.data?.response) {
      setFormData(prev => ({
        ...prev,
        images: imagesData.data.response || []
      }));
    }
  }, [imagesData]);

  useEffect(() => {
    if (pricingData?.data?.response) {
      const pricing = pricingData.data.response;
      setFormData(prev => ({
        ...prev,
        pricing: {
          basePrice: pricing.basePrice || 0,
          quantityPriceTiers: pricing.quantityPriceTiers || [],
          leadTime: pricing.leadTime || []
        }
      }));
    }
  }, [pricingData]);

  useEffect(() => {
    if (variationsData?.data?.response) {
      const variations = variationsData.data.response;
      setFormData(prev => ({
        ...prev,
        variations: {
          variations: variations.variations || [],
          customizableOptions: variations.customizableOptions || []
        }
      }));
    }
  }, [variationsData]);

  useEffect(() => {
    if (servicesData?.data?.response) {
      setFormData(prev => ({
        ...prev,
        services: servicesData.data.response || []
      }));
    }
  }, [servicesData]);

  useEffect(() => {
    if (descriptionData?.data?.response) {
      const description = descriptionData.data.response;
      setFormData(prev => ({
        ...prev,
        description: {
          points: description.points || [],
          attributes: description.attributes || [],
          images: description.images || []
        }
      }));
    }
  }, [descriptionData]);

  // Navigation functions
  const navigateToStep = useCallback((stepIndex: number, force = false) => {
    if (hasUnsavedChanges && !force) {
      setPendingNavigationStep(stepIndex);
      return false; // Indicates navigation was blocked
    }
    
    const step = STEPS[stepIndex];
    const route = STEP_ROUTES[step];
    if (isEditMode) {
      navigate(`/${lang}/products/edit/${productId}/${route}`);
    } else {
      navigate(`/${lang}/products/add/${route}`);
    }
    return true;
  }, [navigate, lang, productId, isEditMode, hasUnsavedChanges]);

  const handleNavigationConfirm = useCallback((saveFirst: boolean) => {
  if (saveFirst && pendingNavigationStep !== null) {
    // Save first, then navigate
    saveCurrentStep().then(success => {
      if (success && pendingNavigationStep !== null) {
        navigateToStep(pendingNavigationStep, true);
      }
      setPendingNavigationStep(null);
    });
  } else if (pendingNavigationStep !== null) {
    // Navigate without saving
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
    const currentStep = STEPS[currentStepIndex];

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
  }, [currentStepIndex, formData]);

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

    const currentStep = STEPS[currentStepIndex];

    try {
      switch (currentStep) {
        case 'productInfo':
          if (isEditMode) {
            await new Promise((resolve, reject) => {
              updateProductInfo(
                { productId: productId!, data: formData.productInfo },
                {
                  onSuccess: resolve,
                  onError: reject
                }
              );
            });
          } else {
            const result = await new Promise((resolve, reject) => {
              createProduct(formData.productInfo, {
                onSuccess: resolve,
                onError: reject
              });
            });
            // Navigate to edit mode with the new product ID
            const newProductId = (result as any)?.data?.response?._id;
            if (newProductId) {
              navigate(`/${lang}/products/edit/${newProductId}/${STEP_ROUTES[currentStep]}`);
            }
          }
          break;

        case 'attributes':
          if (!productId) return false;
          await new Promise((resolve, reject) => {
            syncAttributes(
              { productId, data: { attributes: formData.attributes } },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'images':
          if (!productId) return false;
          const imageFormData = createFormDataForImages(formData.images);
          await new Promise((resolve, reject) => {
            syncImages(
              { productId, formData: imageFormData },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'pricing':
          if (!productId) return false;
          await new Promise((resolve, reject) => {
            syncPricing(
              { productId, data: formData.pricing },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'variations':
          if (!productId) return false;
          await new Promise((resolve, reject) => {
            syncVariations(
              { productId, data: formData.variations },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'services':
          if (!productId) return false;
          await new Promise((resolve, reject) => {
            syncServices(
              { productId, data: { services: formData.services } },
              { onSuccess: resolve, onError: reject }
            );
          });
          break;

        case 'description':
          if (!productId) return false;
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
          
          // Save description images separately if there are any
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
    currentStepIndex, 
    formData, 
    isEditMode, 
    productId, 
    validateCurrentStep,
    updateProductInfo,
    createProduct,
    syncAttributes,
    syncImages,
    syncPricing,
    syncVariations,
    syncServices,
    syncDescription,
    syncDescriptionImages,
    navigate,
    lang
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
      
      // Add existing images from state
      const existingImages = section === 'images' ? formData.images : formData.description.images;
      existingImages.forEach((image, index) => {
        formDataObj.append(`images[${index}]`, image);
      });
      
      // Add new files
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

  // Check if current step has pending operations
  const isPending = useMemo(() => {
    const currentStep = STEPS[currentStepIndex];
    switch (currentStep) {
      case 'productInfo':
        return isCreatingProduct || isUpdatingProductInfo;
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
  }, [
    currentStepIndex,
    isCreatingProduct,
    isUpdatingProductInfo,
    isSyncingAttributes,
    isSyncingImages,
    isSyncingPricing,
    isSyncingVariations,
    isSyncingServices,
    isSyncingDescription,
    isSyncingDescriptionImages
  ]);

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
    isEditMode,
    isPending,
    isLoadingProduct,
    progressPercentage,

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

export default useAddEditProduct;
// src/pages/EditProduct/useEditProduct.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ProductStep,
  ProductFormData,
  ValidationError,
  ProductImagesData,
  ProductDescription,
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
      moq: 0,
    },
    attributes: [
      {
        name: "",
        attributes: [
          {
            field: "",
            value: "",
          },
        ],
      },
    ],
    images: {
      images: [],
      originalImages: [],
      newFiles: [],
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

  // This was needed to track original form data for change detection
  const [originalFormData, setOriginalFormData] = useState<ProductFormData>({
    productInfo: {
      name: "",
      categoryId: "",
      about: ["", ""],
      moq: 0,
    },
    attributes: [
      {
        name: "",
        attributes: [
          {
            field: "",
            value: "",
          },
        ],
      },
    ],
    images: {
      images: [],
      originalImages: [],
      newFiles: [],
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

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [pendingNavigationStep, setPendingNavigationStep] = useState<number | null>(null);

  // API Hooks - Main product info (always loaded)
  const {
    data: productData,
    isLoading: isLoadingProduct,
    refetch: refetchProductInfo,
  } = useGetProductInfoApi(productId || "");
  const { data: categoriesData } = useGetCategoriesApi();

  // Step-specific API hooks - only enabled when on that step
  const {
    data: attributesData,
    isLoading: isLoadingAttributes,
    refetch: refetchAttributes,
  } = useGetProductAttributesApi(productId || "", currentStep === "attributes");
  const {
    data: imagesData,
    isLoading: isLoadingImages,
    refetch: refetchImages,
  } = useGetProductImagesApi(productId || "", currentStep === "images");
  const {
    data: pricingData,
    isLoading: isLoadingPricing,
    refetch: refetchPricing,
  } = useGetProductPricingApi(productId || "", currentStep === "pricing");
  const {
    data: variationsData,
    isLoading: isLoadingVariations,
    refetch: refetchVariations,
  } = useGetProductVariationsApi(productId || "", currentStep === "variations");
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    refetch: refetchServices,
  } = useGetProductServicesApi(productId || "", currentStep === "services");
  const {
    data: descriptionData,
    isLoading: isLoadingDescription,
    refetch: refetchDescription,
  } = useGetProductDescriptionApi(productId || "", currentStep === "description");

  // Mutation hooks
  const { mutate: updateProductInfo, isPending: isUpdatingProductInfo } = useUpdateProductInfoApi();
  const { mutate: syncAttributes, isPending: isSyncingAttributes } = useSyncProductAttributesApi();
  const { mutate: syncImages, isPending: isSyncingImages } = useSyncProductImagesApi();
  const { mutate: syncPricing, isPending: isSyncingPricing } = useSyncProductPricingApi();
  const { mutate: syncVariations, isPending: isSyncingVariations } = useSyncProductVariationsApi();
  const { mutate: syncServices, isPending: isSyncingServices } = useSyncProductServicesApi();
  const { mutate: syncDescription, isPending: isSyncingDescription } = useSyncProductDescriptionApi();
  const { mutate: syncDescriptionImages, isPending: isSyncingDescriptionImages } =
    useSyncProductDescriptionImagesApi();

  // Initialize form data when loading product info
  useEffect(() => {
    if (productData) {
      const productInfo = {
        name: productData.name || "",
        categoryId: productData.categoryId?._id || productData.categoryId || "",
        about: productData.about || ["", ""],
        moq: productData.moq || 0,
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
      // This is needed for change detection of nested arrays 
      // METHOD-1
      // const newAttributesData = attributesData.map((attrGroup: any) => ({
      //   name: attrGroup.name || "",
      //   attributes: (attrGroup.attributes || []).map((attr: any) => ({
      //     field: attr.field || "",
      //     value: attr.value || "",
      //   })),
      // }));

      // Alternative way of creating completely different array with diff pointers for nested arrays
      // METHOD-2 
      const originalAttributes = JSON.parse(JSON.stringify(attributesData))

      setFormData((prev) => ({
        ...prev,
        attributes: attributesData || [],
      }));

      setOriginalFormData((prev) => ({
        ...prev,
        attributes: originalAttributes || [],
      }));
    }
  }, [attributesData]);

  useEffect(() => {
    if (imagesData) {
      const imageData = {
        images: imagesData || [],
        originalImages: imagesData || [],
        newFiles: [],
      };

      // NEEDED FOR CHANGE DETECTION : Way of creating completely different array with diff pointers for nested arrays
      const originalImageData = JSON.parse(JSON.stringify(imageData))
      

      setFormData((prev) => ({
        ...prev,
        images: imageData,
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        images: originalImageData,
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

      // NEEDED FOR CHANGE DETECTION : Way of creating completely different array with diff pointers for nested arrays
      const originalPricing = JSON.parse(JSON.stringify(pricing))

      setFormData((prev) => ({
        ...prev,
        pricing,
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        originalPricing,
      }));
    }
  }, [pricingData]);

  useEffect(() => {
    if (variationsData) {
      const variations = {
        variations: variationsData.variations || [],
        customizableOptions: variationsData.customizableOptions || [],
      };

      // NEEDED FOR CHANGE DETECTION : Way of creating completely different array with diff pointers for nested arrays
      const originalVariations = JSON.parse(JSON.stringify(variations))
      
      setFormData((prev) => ({
        ...prev,
        variations,
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        originalVariations,
      }));
    }
  }, [variationsData]);

  useEffect(() => {
    if (servicesData) {

      // NEEDED FOR CHANGE DETECTION : Way of creating completely different array with diff pointers for nested arrays
      const originalServicesData = JSON.parse(JSON.stringify(servicesData))

      setFormData((prev) => ({
        ...prev,
        services: servicesData || [],
      }));
      setOriginalFormData((prev) => ({
        ...prev,
        services: originalServicesData || [],
      }));
    }
  }, [servicesData]);

  useEffect(() => {
    if (descriptionData) {
      const description = {
        points: descriptionData.points || [""],
        attributes: descriptionData.attributes || [],
        images: descriptionData.images || [],
        originalImages: descriptionData.images || [], // Track original images
        newFiles: [], // Initialize empty new files array
      };

      // NEEDED FOR CHANGE DETECTION : Way of creating completely different array with diff pointers for nested arrays
      const originalDescription = JSON.parse(JSON.stringify(description))

      setFormData((prev) => ({
        ...prev,
        description,
      }));

      setOriginalFormData((prev) => ({
        ...prev,
        originalDescription,
      }));
    }
  }, [descriptionData]);

  const hasImagesChanged = useCallback((): boolean => {
    const { images, originalImages, newFiles } = formData.images;

    // Check if any original images were removed
    const removedImages = originalImages.filter((img) => !images.includes(img));

    // Check if new files were added
    const hasNewFiles = newFiles.length > 0;

    return removedImages.length > 0 || hasNewFiles;
  }, [formData.images]);

  const handleDescriptionImagesUpload = useCallback(
    async (files: FileList): Promise<boolean> => {
      try {
        if (currentStep === "description") {
          // For description step, store files temporarily and upload immediately
          const formDataObj = new FormData();

          // Add existing description images to keep
          formData.description.images.forEach((image, index) => {
            formDataObj.append(`images[${index}]`, image);
          });

          // Add new files
          Array.from(files).forEach((file) => {
            formDataObj.append("files", file);
          });

          await new Promise((resolve, reject) => {
            syncDescriptionImages(
              { productId: productId || "", formData: formDataObj },
              {
                onSuccess: (response) => {
                  refetchDescription().then(() => {
                    customToast.success(translations.messages.uploadSuccess);
                    resolve(response);
                  });
                },
                onError: (error) => {
                  customToast.error(translations.messages.uploadError);
                  reject(error);
                },
              }
            );
          });

          return true;
        } else {
          // For other contexts, store files temporarily
          const currentNewFiles = formData.description.newFiles || [];
          const newFiles = [...currentNewFiles, ...Array.from(files)];

          updateFormData("description", {
            ...formData.description,
            newFiles,
          });

          customToast.info(`${files.length} file(s) added. Save to upload to server.`);
          return true;
        }
      } catch (error) {
        console.error("Upload error:", error);
        customToast.error(translations.messages.uploadError);
        return false;
      }
    },
    [productId, formData, currentStep]
  );

  const handleDescriptionImageRemove = useCallback(
    (index: number) => {
      const currentImages = [...formData.description.images];
      currentImages.splice(index, 1);

      updateFormData("description", {
        ...formData.description,
        images: currentImages,
      });

      customToast.success(translations.messages.removeSuccess || "Image removed successfully");
    },
    [formData, translations]
  );

  // Check if current step has changes
  const hasCurrentStepChanged = useCallback((): boolean => {
    switch (currentStep) {
      case "images":
        return hasImagesChanged();
      case "productInfo":
        return ChangeTracker.hasProductInfoChanged(originalFormData.productInfo, formData.productInfo);
      case "attributes":
        return ChangeTracker.hasAttributesChanged(originalFormData.attributes, formData.attributes);
      case "services":
        return ChangeTracker.hasServicesChanged(originalFormData.services, formData.services);
      case "description":
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
        console.warn("Unsaved changes detected. Prompting user to save first.");
        setPendingNavigationStep(stepIndex);
        return false;
      }

      console.log("Navigating to step index:", stepIndex);

      const step = STEPS[stepIndex];
      const route = STEP_ROUTES[step];
      navigate(`/${lang}/products/edit/${productId}/${route}`);
      return true;
    },
    [navigate, lang, productId, hasUnsavedChanges]
  );

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
    console.log("Current step index:", currentStepIndex);
    if (currentStepIndex < STEPS.length - 1) {
      navigateToStep(currentStepIndex + 1, true);
    }
  }, [currentStepIndex, navigateToStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      navigateToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, navigateToStep]);

  // Form data update functions
  const updateFormData = useCallback(
    <K extends keyof ProductFormData>(section: K, data: ProductFormData[K] | Partial<ProductFormData[K]>) => {
      console.log("Data in updateFormData : ", data)

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
        field: "images",
        message: "You need to upload at least one image",
      });
    }

    // Validate total count doesn't exceed 10
    if (existingCount + newFilesCount > 10) {
      errors.push({
        field: "images",
        message: "Maximum 10 images allowed",
      });
    }

    // Validate file types for new files
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    imageData.newFiles.forEach((file, index) => {
      if (!validTypes.includes(file.type)) {
        errors.push({
          field: `images.newFiles.${index}`,
          message: "Only JPG, PNG, and WebP files are allowed",
        });
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push({
          field: `images.newFiles.${index}`,
          message: "File size must be less than 5MB",
        });
      }
    });

    return errors;
  }, []);

  // Validation functions
  const validateCurrentStep = useCallback((): boolean => {
    let errors: ValidationError[] = [];

    switch (currentStep) {
      case "images":
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
      if (image && typeof image === "string") {
        formDataObj.append(`images[${index}]`, image);
      }
    });

    // Add new files
    newFiles?.forEach?.((file) => {
      if (file instanceof File) {
        formDataObj.append("files", file);
      }
    });

    return formDataObj;
  };

  const createFormDataForDescriptionImages = useCallback((descriptionData: ProductDescription) => {
    const formDataObj = new FormData();

    if (!descriptionData) return formDataObj;

    const { images = [], newFiles = [] } = descriptionData;

    // Add existing images to keep (same format as ProductImagesStep)
    images?.forEach?.((image, index) => {
      if (image && typeof image === "string") {
        formDataObj.append(`images[${index}]`, image);
      }
    });

    // Add new files
    newFiles?.forEach?.((file) => {
      if (file instanceof File) {
        formDataObj.append("files", file);
      }
    });

    return formDataObj;
  }, []);

  // Image upload helper function
  const uploadImages = useCallback(
    async (files: FileList, section: "images" | "description" = "images") => {
      if (!productId) {
        customToast.error("Product ID not found");
        return false;
      }

      if (!files || files.length === 0) {
        return false;
      }

      try {
        // Validate files before adding
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const invalidFiles = Array.from(files).filter((file) => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
          customToast.error("Please select only JPG, PNG, or WebP files.");
          return false;
        }

        // Check file sizes (5MB limit)
        const oversizedFiles = Array.from(files).filter((file) => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
          customToast.error("Each file must be less than 5MB");
          return false;
        }

        if (section === "images") {
          // Check total count
          const currentImageCount = formData.images.images.length + formData.images.newFiles.length;
          if (currentImageCount + files.length > 10) {
            customToast.error("Maximum 10 images allowed");
            return false;
          }

          // Add files to newFiles array for immediate UI update
          const newFilesArray = Array.from(files);
          updateFormData("images", {
            ...formData.images,
            newFiles: [...formData.images.newFiles, ...newFilesArray],
          });

          customToast.success(`${files.length} file(s) added. Save to upload to server.`);
          return true;
        } else {
          // Handle description images upload immediately
          const formDataObj = new FormData();

          // Add existing description images
          formData.description.images.forEach((image, index) => {
            formDataObj.append(`images[${index}]`, image);
          });

          // Add new files
          Array.from(files).forEach((file) => {
            formDataObj.append("files", file);
          });

          await new Promise((resolve, reject) => {
            syncDescriptionImages(
              { productId, formData: formDataObj },
              {
                onSuccess: (response) => {
                  refetchDescription().then(() => {
                    customToast.success(translations.messages.uploadSuccess);
                    resolve(response);
                  });
                },
                onError: (error) => {
                  customToast.error(translations.messages.uploadError);
                  reject(error);
                },
              }
            );
          });

          return true;
        }
      } catch (error) {
        console.error("Upload error:", error);
        customToast.error(translations.messages.uploadError);
        return false;
      }
    },
    [productId, formData, updateFormData, syncDescriptionImages, refetchDescription]
  );

  // Remove image helper function
  const removeImage = useCallback(
    (index: number, section: "images" | "description" = "images") => {
      if (section === "images") {
        const currentImages = [...formData.images.images];
        currentImages.splice(index, 1);

        updateFormData("images", {
          ...formData.images,
          images: currentImages,
        });
      } else {
        const currentImages = [...formData.description.images];
        currentImages.splice(index, 1);

        updateFormData("description", {
          ...formData.description,
          images: currentImages,
        });
      }
    },
    [formData, updateFormData]
  );

  // Handle description image removal (for existing images)
  const removeDescriptionImage = useCallback(
    (index: number) => {
      const currentImages = [...formData.description.images];
      currentImages.splice(index, 1);

      updateFormData("description", {
        ...formData.description,
        images: currentImages,
      });
    },
    [formData, updateFormData]
  );

  // Upload images function for description (follows ProductImagesStep pattern)
  const uploadDescriptionImages = useCallback(
    async (files: FileList): Promise<boolean> => {
      try {
        // Store files temporarily in newFiles array (same as ProductImagesStep)
        const currentNewFiles = formData.description.newFiles || [];
        const newFiles = [...currentNewFiles, ...Array.from(files)];

        updateFormData("description", {
          ...formData.description,
          newFiles,
        });

        return true;
      } catch (error) {
        console.error("Upload error:", error);
        return false;
      }
    },
    [formData, updateFormData]
  );

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
                onSuccess: (response) => {
                  refetchProductInfo();
                  resolve(response);
                },
                onError: reject,
              }
            );
          });

          // Update original data after successful save
          setOriginalFormData((prev) => ({
            ...prev,
            productInfo: formData.productInfo,
          }));
          break;

        case "attributes":
          await new Promise((resolve, reject) => {
            syncAttributes(
              { productId, data: { attributes: formData.attributes } },
              {
                onSuccess: (response) => {
                  refetchAttributes();
                  resolve(response);
                },
                onError: reject,
              }
            );
          });

          setOriginalFormData((prev) => ({
            ...prev,
            attributes: formData.attributes,
          }));
          break;

        case "images":
          // Create FormData for image upload
          const formDataObj = createFormDataForImages(formData.images);

          await new Promise((resolve, reject) => {
            syncImages(
              { productId, formData: formDataObj },
              {
                onSuccess: async (response) => {
                  // Refetch images to get the latest state from server
                  await refetchImages();

                  // Reset newFiles since they've been uploaded
                  const updatedImageData = {
                    images: formData.images.images,
                    originalImages: formData.images.images,
                    newFiles: [],
                  };

                  setFormData((prev) => ({
                    ...prev,
                    images: updatedImageData,
                  }));

                  setOriginalFormData((prev) => ({
                    ...prev,
                    images: updatedImageData,
                  }));

                  resolve(response);
                },
                onError: reject,
              }
            );
          });
          break;

        case "pricing":
          await new Promise((resolve, reject) => {
            syncPricing(
              { productId, data: formData.pricing },
              {
                onSuccess: (response) => {
                  refetchPricing();
                  resolve(response);
                },
                onError: reject,
              }
            );
          });

          setOriginalFormData((prev) => ({
            ...prev,
            pricing: formData.pricing,
          }));
          break;

        case "variations":
          await new Promise((resolve, reject) => {
            syncVariations(
              { productId, data: formData.variations },
              {
                onSuccess: (response) => {
                  refetchVariations();
                  resolve(response);
                },
                onError: reject,
              }
            );
          });

          setOriginalFormData((prev) => ({
            ...prev,
            variations: formData.variations,
          }));
          break;

        case "services":
          await new Promise((resolve, reject) => {
            syncServices(
              { productId, data: { services: formData.services } },
              {
                onSuccess: (response) => {
                  refetchServices();
                  resolve(response);
                },
                onError: reject,
              }
            );
          });

          setOriginalFormData((prev) => ({
            ...prev,
            services: formData.services,
          }));
          break;

        case "description":
          // Save description points and attributes first
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

          // If there are new files to upload or image changes, handle images separately
          if (
            (formData.description.newFiles && formData.description.newFiles.length > 0) ||
            JSON.stringify(formData.description.images) !==
              JSON.stringify(formData.description.originalImages)
          ) {
            const descriptionImageFormData = createFormDataForDescriptionImages(formData.description);
            await new Promise((resolve, reject) => {
              syncDescriptionImages(
                { productId, formData: descriptionImageFormData },
                { onSuccess: resolve, onError: reject }
              );
            });
          }
          break;
      }

      setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));
      customToast.success(translations.messages.saveSuccess);
      return true;
    } catch (error) {
      console.error("Save error:", error);
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
    refetchProductInfo,
    refetchAttributes,
    refetchImages,
    refetchPricing,
    refetchVariations,
    refetchServices,
    refetchDescription,
    createFormDataForImages,
  ]);

  const saveAndNext = useCallback(async () => {
    const success = await saveCurrentStep();
    console.log("Save and next success:", success);
    if (success) {
      goToNextStep();
    }
  }, [saveCurrentStep, goToNextStep]);

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
    hasUnsavedChanges,
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

    // Image specific helpers
    uploadImages,
    removeImage,

    handleDescriptionImagesUpload,
    handleDescriptionImageRemove,

    // Constants
    STEPS,
    STEP_ROUTES,

    // Utils
    translations,
  };
};

export default useEditProduct;

// src/pages/AddProduct/useAddProduct.ts
import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductInfo, ValidationError } from './types.add-product';
import { useCreateProductApi, useGetCategoriesApi } from '../../api/api-hooks/useAddProductApi';
import { customToast } from '../../toast-config/customToast';
import translations from './translations.json';

export const useAddProduct = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  
  // State
  const [formData, setFormData] = useState<ProductInfo>({
    name: '',
    categoryId: '',
    about: ['', ''],
    moq: 1
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // API Hooks
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesApi();
  const { mutate: createProduct, isPending: isCreating } = useCreateProductApi();

  // Form data update function
  const updateFormData = useCallback((data: Partial<ProductInfo>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const errors: ValidationError[] = [];

    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: translations.validation.required });
    } else if (formData.name.trim().length < 3) {
      errors.push({ field: 'name', message: translations.validation.minLength.replace('{min}', '3') });
    } else if (formData.name.trim().length > 200) {
      errors.push({ field: 'name', message: translations.validation.maxLength.replace('{max}', '200') });
    }

    if (!formData.categoryId) {
      errors.push({ field: 'categoryId', message: translations.validation.required });
    }

    const validAboutPoints = formData.about.filter(item => item.trim());
    if (validAboutPoints.length < 2) {
      errors.push({ field: 'about', message: translations.validation.minPoints.replace('{min}', '2') });
    }

    if (formData.moq && formData.moq < 1) {
      errors.push({ field: 'moq', message: translations.validation.minValue.replace('{min}', '1') });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  // Get error for specific field
  const getError = useCallback((field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  }, [validationErrors]);

  // Handle about points
  const addAboutPoint = useCallback(() => {
    if (formData.about.length < 10) {
      updateFormData({ about: [...formData.about, ''] });
    }
  }, [formData.about, updateFormData]);

  const removeAboutPoint = useCallback((index: number) => {
    if (formData.about.length > 2) {
      const newAbout = formData.about.filter((_, i) => i !== index);
      updateFormData({ about: newAbout });
    }
  }, [formData.about, updateFormData]);

  const updateAboutPoint = useCallback((index: number, value: string) => {
    const newAbout = [...formData.about];
    newAbout[index] = value;
    updateFormData({ about: newAbout });
  }, [formData.about, updateFormData]);

  // Save product
  const saveProduct = useCallback(async () => {
    if (!validateForm()) {
      customToast.error(translations.messages.saveError);
      return false;
    }

    // Clean up about points by removing empty ones
    const cleanedAbout = formData.about.filter(point => point.trim());
    const dataToSave = {
      ...formData,
      about: cleanedAbout
    };

    return new Promise((resolve) => {
      createProduct(dataToSave, {
        onSuccess: (response: any) => {
          const productId = response?.data?.response?._id;
          if (productId) {
            setHasUnsavedChanges(false);
            customToast.success(translations.messages.saveSuccess);
            // Navigate to edit mode with attributes step
            navigate(`/${lang}/products/edit/${productId}/attributes`);
            resolve(true);
          } else {
            customToast.error('Product created but ID not received');
            resolve(false);
          }
        },
        onError: (error: any) => {
          console.error('Create product error:', error);
          customToast.error(translations.messages.saveError);
          resolve(false);
        }
      });
    });
  }, [formData, validateForm, createProduct, navigate, lang]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate(`/${lang}/products`);
  }, [navigate, lang]);

  // Get categories for dropdown
  const categories = useMemo(() => {
    return categoriesData?.docs || [];
  }, [categoriesData]);

  return {
    // State
    formData,
    validationErrors,
    hasUnsavedChanges,
    isCreating,
    isLoadingCategories,
    
    // Data
    categories,
    
    // Functions
    updateFormData,
    validateForm,
    getError,
    addAboutPoint,
    removeAboutPoint,
    updateAboutPoint,
    saveProduct,
    handleCancel,
    
    // Utils
    translations
  };
};

export default useAddProduct;
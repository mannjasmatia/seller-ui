// src/pages/products/useProductsList.ts
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchAllCategoriesApi } from '../../api/api-hooks/useCategoryApi';
import { customToast } from '../../toast-config/customToast';
import translations from './translations.json';
import { useProductsApi } from '../../api/api-hooks/useProductApi';
import { ProductFilters } from './types.products';

export const useProductsList = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters]);

  // API query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit,
    search: debouncedSearchTerm || undefined,
    categories: filters.categories?.length ? filters.categories : undefined,
    isVerified: filters.isVerified,
    inComplete: filters.inComplete,
    sortBy: filters.sortBy,
    createdAt: filters.createdAt,
  }), [currentPage, limit, debouncedSearchTerm, filters]);

  // API calls
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch
  } = useProductsApi(queryParams);

  // const {
  //   data: categoriesData,
  //   isLoading: isLoadingCategories
  // } = useFetchAllCategoriesApi({
  //   page: 1,
  //   limit: 100
  // });

  // Computed values
  const products = productsData?.docs || [];
  const totalPages = productsData?.totalPages || 1;
  const totalProducts = productsData?.total || 0;
  // const categories = categoriesData?.docs || [];

  // Navigation functions
  const handleAddProduct = useCallback(() => {
    navigate(`/${lang}/products/add/product-info`);
  }, [navigate, lang]);

  const handleEditProduct = useCallback((productId: string, incompleteSteps?: string[]) => {
    if (incompleteSteps && incompleteSteps.length > 0) {
      const firstIncompleteStep = incompleteSteps[0];
      const stepRoutes = {
        'productInfo': 'product-info',
        'attributes': 'attributes',
        'images': 'images',
        'pricing': 'pricing',
        'variations': 'variations',
        'services': 'services',
        'description': 'description'
      };
      const route = stepRoutes[firstIncompleteStep as keyof typeof stepRoutes] || 'product-info';
      navigate(`/${lang}/products/edit/${productId}/${route}`);
    } else {
      navigate(`/${lang}/products/edit/${productId}/product-info`);
    }
  }, [navigate, lang]);

  const handleCompleteNow = useCallback((productId: string, incompleteSteps?: string[]) => {
    if (incompleteSteps && incompleteSteps.length > 0) {
      const firstIncompleteStep = incompleteSteps[0];
      const stepRoutes = {
        'productInfo': 'product-info',
        'attributes': 'attributes',
        'images': 'images',
        'pricing': 'pricing',
        'variations': 'variations',
        'services': 'services',
        'description': 'description'
      };
      const route = stepRoutes[firstIncompleteStep as keyof typeof stepRoutes] || 'product-info';
      navigate(`/${lang}/products/edit/${productId}/${route}`);
    } else {
      customToast.info(translations.messages.productAlreadyComplete);
    }
  }, [navigate, lang]);

  const handleCardClick = useCallback((productId: string) => {
    navigate(`/${lang}/products/${productId}`);
  }, [navigate, lang]);

  const handleDeleteProduct = useCallback((productId: string) => {
    // TODO: Implement delete functionality with confirmation modal
    customToast.info(`Delete product ${productId} - To be implemented`);
  }, []);

  // Pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  // Convert camelCase to kebab-case for routes
  const camelToKebab = (str: string) => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  };

  return {
    // Data
    products,
    totalProducts,
    totalPages,
    currentPage,
    isLoading,
    isError,
    error,
    
    // Search and filters
    searchTerm,
    setSearchTerm: handleSearch,
    debouncedSearchTerm,
    filters,
    setFilters,
    resetFilters,
    
    // UI state
    showFilterModal,
    setShowFilterModal,
    
    // Actions
    handleAddProduct,
    handleEditProduct,
    handleCompleteNow,
    handleCardClick,
    handleDeleteProduct,
    handlePageChange,
    handleSearch,
    
    // Categories
    // categories,
    // isLoadingCategories,
    
    // Utilities
    refetch,
    camelToKebab,
  };
};

export default useProductsList; 
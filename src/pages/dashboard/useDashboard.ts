// src/pages/dashboard/useDashboard.ts
import { useState, useMemo, useCallback } from "react";
import { FilterState, Product } from "./types.dashboard";
import { useProductNamesApi, useProductsApi } from "../../api/api-hooks/useProductApi";
import { ProductsQueryParams } from "../products/types.products";
import { customToast } from "../../toast-config/customToast";
import dashboardTranslations from "./translations.json";
import moment from "moment";
import { validateFromToDate } from "../../utils/validateFromToDate";

export const useDashboard = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    selectedProducts: [],
    timeGranularity: "all-time",
    customFromDate: "",
    customToDate: "",
  });

  // Fetch products for dropdown
  const productsParams: ProductsQueryParams = useMemo(
    () => ({
      page: 1,
      limit: 10, // Get enough products for dropdown
      // isVerified: false, // Only get verified products
      // inComplete: true, // Only get complete products
    }),
    []
  );

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useProductNamesApi(productsParams);

  // Transform products data for dropdown use
  const products: Product[] = useMemo(() => {
    if (!productsResponse?.docs) return [];

    return productsResponse.docs.map((product) => ({
      id: product._id,
      name: product.name,
    }));
  }, [productsResponse]);

  // Get selected product IDs
  const selectedProductIds = useMemo(() => {
    if (filterState.selectedProducts.length === 0) {
      // If no products selected, return all product IDs
      return products.map((p) => p.id);
    }
    return filterState.selectedProducts;
  }, [filterState.selectedProducts, products]);

  // Time granularity options
  const timeGranularityOptions = useMemo(
    () => [
      {
        value: "all-time",
        label: dashboardTranslations.dashboard.filters.options.allTime,
      },
      {
        value: "this-week",
        label: dashboardTranslations.dashboard.filters.options.thisWeek,
      },
      {
        value: "this-month",
        label: dashboardTranslations.dashboard.filters.options.thisMonth,
      },
      {
        value: "this-year",
        label: dashboardTranslations.dashboard.filters.options.thisYear,
      },
      {
        value: "last-2-years",
        label: dashboardTranslations.dashboard.filters.options.last2Years,
      },
      {
        value: "last-5-years",
        label: dashboardTranslations.dashboard.filters.options.last5Years,
      },
      {
        value: "custom",
        label: dashboardTranslations.dashboard.filters.options.custom,
      },
    ],
    []
  );

  // Update selected products
  const handleProductsChange = useCallback((selectedProducts: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedProducts }));
  }, []);

  // Update time granularity
  const handleGranularityChange = useCallback(
    (timeGranularity: string) => {
      let updates: Partial<FilterState> = { timeGranularity };

      // Set default dates when custom is selected
      if (
        timeGranularity === "custom" &&
        !filterState.customFromDate &&
        !filterState.customToDate
      ) {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        updates.customFromDate = thirtyDaysAgo.toISOString().split("T")[0];
        updates.customToDate = today.toISOString().split("T")[0];
      }

      setFilterState((prev) => ({ ...prev, ...updates }));
    },
    [filterState.customFromDate, filterState.customToDate]
  );

  // Update custom date range
  const handleCustomDateChange = useCallback(
    (field: "customFromDate" | "customToDate", value: string) => {

      if (field === "customFromDate"){
        const {isValid, message} = validateFromToDate(value, filterState.customToDate)
        if (!isValid){
            customToast.error(message)
            return
        }
      }

      if (field === "customToDate"){
        const {isValid, message} = validateFromToDate(filterState.customFromDate, value)
        if (!isValid){
            customToast.error(message)
            return
        }
      }

      setFilterState((prev) => ({ ...prev, [field]: value }));
    },
    [filterState.customFromDate, filterState.customToDate]
  );

  // Calculate summary metrics based on real data
  const summaryMetrics = useMemo(() => {
    // These would typically come from the analytics API
    // For now, we'll show placeholder values that would be calculated from real data
    return {
      totalProductsSold: "Loading...", // Will be replaced with real data
      totalProfit: "Loading...", // Will be replaced with real data
      averagePerPeriod: "Loading...", // Will be replaced with real data
      selectedProductsCount:
        filterState.selectedProducts.length === 0
          ? "All"
          : filterState.selectedProducts.length,
    };
  }, [filterState.selectedProducts.length]);

  // Handle products loading error
  const handleProductsRetry = useCallback(() => {
    refetchProducts();
    customToast.info(dashboardTranslations.dashboard.loading.products);
  }, [refetchProducts]);

  return {
    // State
    filterState,
    products,
    selectedProductIds,
    timeGranularityOptions,
    summaryMetrics,

    // Loading states
    isProductsLoading,
    isProductsError,
    productsError,

    // Handlers
    handleProductsChange,
    handleGranularityChange,
    handleCustomDateChange,
    handleProductsRetry,
  };
};

export default useDashboard;

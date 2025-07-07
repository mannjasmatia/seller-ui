import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  useGetOrdersApi, 
  useGetOrderByIdApi, 
  useUpdateOrderStatusApi, 
  OrdersListParams
} from '../../api/api-hooks/useOrdersApi';
import { 
  OrdersState, 
  OrderFilters, 
  OrderPagination, 
  StatusUpdateFormData, 
  OrderStatus,
  Order
} from './types.orders';
import { RootState } from '../../store/appStore';
import { customToast } from '../../toast-config/customToast';

const INITIAL_FILTERS: OrderFilters = {
  status: '',
  searchQuery: '',
  dateRange: undefined,
};

const INITIAL_PAGINATION: OrderPagination = {
  page: 1,
  limit: 10,
  total: 0,
  hasNext: false,
  hasPrev: false,
};

export const useOrders = () => {
  const language = useSelector((state: RootState) => state.language?.value)['orders'];
  
  const [state, setState] = useState<OrdersState>({
    selectedOrder: null,
    filters: INITIAL_FILTERS,
    pagination: INITIAL_PAGINATION,
    isDetailModalOpen: false,
    isStatusModalOpen: false,
    isCancelModalOpen: false,
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<StatusUpdateFormData | null>(null);

  // API params for orders list (includes search and filters)
  const ordersParams: OrdersListParams = useMemo(() => ({
    page: state.pagination.page,
    limit: state.pagination.limit,
    ...(state.filters.status && { status: state.filters.status as OrderStatus }),
    ...(state.filters.searchQuery.trim() && { search: state.filters.searchQuery.trim() }),
  }), [state.pagination.page, state.pagination.limit, state.filters.status, state.filters.searchQuery]);

  // API hooks
  const { 
    data: ordersData, 
    isLoading: isLoadingOrders, 
    isError: isOrdersError, 
    error: ordersError,
    refetch: refetchOrders 
  } = useGetOrdersApi(ordersParams);

  const { 
    data: selectedOrderData, 
    isLoading: isLoadingOrderDetail,
    isError: isOrderDetailError 
  } = useGetOrderByIdApi(state.selectedOrder?.orderId || '');

  const { 
    mutate: updateOrderStatus, 
    isPending: isUpdatingStatus, 
    isError: isUpdateError, 
    isSuccess: isUpdateSuccess 
  } = useUpdateOrderStatusApi();

  // Update pagination when orders data changes  
  useEffect(() => {
    if (ordersData) {
      setState(prev => ({
        ...prev,
        pagination: {
          page: ordersData.currentPage || ordersData.currentPage || 1,
          limit: ordersData.docs?.length || prev.pagination.limit,
          total: ordersData.totalDocs || 0,
          hasNext: ordersData.hasNext || false,
          hasPrev: ordersData.hasPrev || false,
        }
      }));
    }
  }, [ordersData]);

  // Handle status update success
  useEffect(() => {
    if (isUpdateSuccess) {
      customToast.success(language?.success?.statusUpdated || 'Order status updated successfully');
      setState(prev => ({ ...prev, isStatusModalOpen: false }));
      setIsConfirmModalOpen(false);
      setStatusUpdateData(null);
      refetchOrders();
    }
  }, [isUpdateSuccess, language, refetchOrders]);

  // Handle errors
  useEffect(() => {
    if (isUpdateError) {
      customToast.error(language?.errors?.updateFailed || 'Failed to update order status');
      setIsConfirmModalOpen(false);
    }
  }, [isUpdateError, language]);

// Simple debounce implementation without lodash
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const debounced = (...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => {
        if (timer) clearTimeout(timer);
        timer = null;
    };
    return debounced;
}

const debouncedRefetch = useMemo(
    () => debounce(() => {
        refetchOrders();
    }, 500),
    [refetchOrders]
);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedRefetch.cancel();
    };
  }, [debouncedRefetch]);

  

  // Filter functions
  const setStatusFilter = useCallback((status: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, status },
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, searchQuery },
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const setDateRange = useCallback((dateRange: { start: string; end: string } | undefined) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, dateRange },
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: INITIAL_FILTERS,
      pagination: { ...prev.pagination, page: 1 }
    }));
    refetchOrders();
  }, [refetchOrders]);

  // Pagination functions
  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, limit, page: 1 }
    }));
  }, []);

  // Modal functions
  const openDetailModal = useCallback((order: Order) => {
    setState(prev => ({
      ...prev,
      selectedOrder: order,
      isDetailModalOpen: true
    }));
  }, []);

  const closeDetailModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedOrder: null,
      isDetailModalOpen: false
    }));
  }, []);

  const openStatusModal = useCallback((order: Order) => {
    setState(prev => ({
      ...prev,
      selectedOrder: order,
      isStatusModalOpen: true
    }));
  }, []);

  const closeStatusModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isStatusModalOpen: false
    }));
    setStatusUpdateData(null);
  }, []);

  const openCancelModal = useCallback((order: Order) => {
    setState(prev => ({
      ...prev,
      selectedOrder: order,
      isCancelModalOpen: true
    }));
  }, []);

  const closeCancelModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCancelModalOpen: false
    }));
  }, []);

  // Confirmation modal functions
  const openConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(false);
    setStatusUpdateData(null);
  }, []);

  // Action functions
  const handleStatusUpdate = useCallback((data: StatusUpdateFormData) => {
    if (!state.selectedOrder) return;
    
    setStatusUpdateData(data);
    setState(prev => ({ ...prev, isStatusModalOpen: false }));
    setIsConfirmModalOpen(true);
  }, [state.selectedOrder]);

  const handleConfirmStatusUpdate = useCallback(() => {
    if (!state.selectedOrder || !statusUpdateData) return;
    
    updateOrderStatus({
      orderId: state.selectedOrder.orderId,
      ...statusUpdateData
    });
  }, [state.selectedOrder, statusUpdateData, updateOrderStatus]);

  // Utility functions
  const getOrderStatusBadgeColor = useCallback((status: OrderStatus) => {
    const statusColors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      ready_to_ship: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-green-100 text-green-800',
      in_transit: 'bg-teal-100 text-teal-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const formatOrderStatus = useCallback((status: OrderStatus) => {
    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      ready_to_ship: 'Ready to Ship',
      shipped: 'Shipped',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
    };
    return statusLabels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }, []);

  const isLoading = isLoadingOrders || isUpdatingStatus;

  return {
    // State
    orders: ordersData?.docs,
    selectedOrder: selectedOrderData,
    filters: state.filters,
    pagination: state.pagination,
    statusUpdateData,
    
    // Modal states
    isDetailModalOpen: state.isDetailModalOpen,
    isStatusModalOpen: state.isStatusModalOpen,
    isCancelModalOpen: state.isCancelModalOpen,
    isConfirmModalOpen,
    
    // Loading states
    isLoading,
    isLoadingOrders,
    isLoadingOrderDetail,
    isUpdatingStatus,
    
    // Error states
    isError: isOrdersError || isOrderDetailError,
    error: ordersError,
    
    // Actions
    setStatusFilter,
    setSearchQuery,
    setDateRange,
    clearFilters,
    setPage,
    setLimit,
    openDetailModal,
    closeDetailModal,
    openStatusModal,
    closeStatusModal,
    openCancelModal,
    closeCancelModal,
    openConfirmModal,
    closeConfirmModal,
    handleStatusUpdate,
    handleConfirmStatusUpdate,
    refetchOrders,
    
    // Utilities
    getOrderStatusBadgeColor,
    formatOrderStatus,
  };
};
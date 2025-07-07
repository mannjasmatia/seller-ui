import { useState, useCallback, useEffect } from 'react';
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
  CancelOrderFormData, 
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

  // API params for orders list
  const ordersParams: OrdersListParams = {
    page: state.pagination.page,
    limit: state.pagination.limit,
    ...(state.filters.status && { status: state.filters.status as OrderStatus }),
  };

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

//   const { 
//     mutate: cancelOrder, 
//     isPending: isCancelling, 
//     isError: isCancelError, 
//     isSuccess: isCancelSuccess 
//   } = useCancelOrderApi();

  // Update pagination when orders data changes
  useEffect(() => {
    if (ordersData) {
      setState(prev => ({
        ...prev,
        pagination: {
          page: ordersData.currentPage,
          limit: ordersData.docs.length,
          total: ordersData.totalDocs,
          hasNext: ordersData.hasNext,
          hasPrev: ordersData.hasPrev,
        }
      }));
    }
  }, [ordersData]);

  // Handle status update success
  useEffect(() => {
    if (isUpdateSuccess) {
      customToast.success(language.success.statusUpdated || 'Order status updated successfully');
      setState(prev => ({ ...prev, isStatusModalOpen: false }));
    }
  }, [isUpdateSuccess, language]);

  // Handle cancel success
//   useEffect(() => {
//     if (isCancelSuccess) {
//       customToast.success(language.success.orderCancelled || 'Order cancelled successfully');
//       setState(prev => ({ ...prev, isCancelModalOpen: false }));
//     }
//   }, [isCancelSuccess, language]);

  // Handle errors
  useEffect(() => {
    if (isUpdateError) {
      customToast.error(language.errors.updateFailed || 'Failed to update order status');
    }
    // if (isCancelError) {
    //   customToast.error(language.errors.cancelFailed || 'Failed to cancel order');
    // }
  }, [isUpdateError, language]);

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
  }, []);

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

  // Action functions
  const handleUpdateStatus = useCallback((data: StatusUpdateFormData) => {
    if (!state.selectedOrder) return;
    
    updateOrderStatus({
      orderId: state.selectedOrder.orderId,
      ...data
    });
  }, [state.selectedOrder, updateOrderStatus]);

//   const handleCancelOrder = useCallback((data: CancelOrderFormData) => {
//     if (!state.selectedOrder) return;
    
//     updateOrderStatus({
//       orderId: state.selectedOrder.orderId,
//       ...data
//     });
//   }, [state.selectedOrder, cancelOrder]);

  // Utility functions
  const getFilteredOrders = useCallback(() => {
    if (!ordersData?.docs) return [];
    
    let filtered = ordersData.docs;
    
    // Apply search filter
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(query) ||
        order.buyer.fullName.toLowerCase().includes(query) ||
        order.product.name.toLowerCase().includes(query) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [ordersData?.docs, state.filters.searchQuery]);

  const getOrderStatusBadgeColor = useCallback((status: OrderStatus) => {
    const statusColors : any = {
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
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l:any) => l.toUpperCase());
  }, []);

  const isLoading = isLoadingOrders || isUpdatingStatus ;

  return {
    // State
    orders: getFilteredOrders(),
    selectedOrder: selectedOrderData,
    filters: state.filters,
    pagination: state.pagination,
    
    // Modal states
    isDetailModalOpen: state.isDetailModalOpen,
    isStatusModalOpen: state.isStatusModalOpen,
    isCancelModalOpen: state.isCancelModalOpen,
    
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
    handleUpdateStatus,
    refetchOrders,
    
    // Utilities
    getOrderStatusBadgeColor,
    formatOrderStatus,
  };
};
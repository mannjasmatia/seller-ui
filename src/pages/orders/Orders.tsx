import React from 'react';
import { useSelector } from 'react-redux';
import { Search, Filter, Calendar, Package, Eye, Edit3, Truck, MapPin, Clock, User, Building } from 'lucide-react';
import { RootState } from '../../store/appStore';
import { useOrders } from './useOrders';
import Button from '../../components/BasicComponents/Button';
import Input from '../../components/BasicComponents/Input';
import DynamicImage from '../../components/BasicComponents/Image';
import ConfirmationModal from '../../modals/ConfirmationModal';
import { OrderStatus } from './types.orders';
import OrderDetailModal from './components/OrderDetailModal';
import StatusUpdateModal from './components/StatusUpdateModal';

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const Orders: React.FC = () => {
  const language = useSelector((state: RootState) => state.language?.value)['orders'];
  
  const {
    orders,
    selectedOrder,
    filters,
    pagination,
    isDetailModalOpen,
    isStatusModalOpen,
    isConfirmModalOpen,
    isLoading,
    isLoadingOrders,
    isLoadingOrderDetail,
    isUpdatingStatus,
    isError,
    statusUpdateData,
    setStatusFilter,
    setSearchQuery,
    setPage,
    setLimit,
    clearFilters,
    openDetailModal,
    closeDetailModal,
    openStatusModal,
    closeStatusModal,
    openConfirmModal,
    closeConfirmModal,
    handleStatusUpdate,
    handleConfirmStatusUpdate,
    refetchOrders,
    getOrderStatusBadgeColor,
    formatOrderStatus,
  } = useOrders();

  // Status options for filter
  const statusOptions = [
    { label: language?.filters?.allStatus || 'All Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Ready to Ship', value: 'ready_to_ship' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'In Transit', value: 'in_transit' },
    { label: 'Out for Delivery', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Returned', value: 'returned' },
  ];

  // Items per page options
  const limitOptions = [
    { label: '10 per page', value: 10 },
    { label: '25 per page', value: 25 },
    { label: '50 per page', value: 50 },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      confirmed: <Package className="h-4 w-4" />,
      processing: <Package className="h-4 w-4" />,
      ready_to_ship: <Package className="h-4 w-4" />,
      shipped: <Truck className="h-4 w-4" />,
      in_transit: <Truck className="h-4 w-4" />,
      out_for_delivery: <Truck className="h-4 w-4" />,
      delivered: <Package className="h-4 w-4" />,
      cancelled: <Package className="h-4 w-4" />,
      returned: <Package className="h-4 w-4" />,
    };
    return icons[status] || <Package className="h-4 w-4" />;
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language?.errors?.loadingFailed || 'Failed to load orders'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language?.errors?.tryAgain || 'Please try again later'}
          </p>
          <Button onClick={() => refetchOrders()} variant="solid">
            {language?.actions?.retry || 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language?.title || 'Orders Management'}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {language?.subtitle || 'Manage and track your customer orders'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {pagination.total > 0 && (
                  <span>{pagination.total} {language?.pagination?.results || 'total orders'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder={language?.filters?.searchPlaceholder || 'Search orders by ID, buyer, product, or tracking...'}
                value={filters.searchQuery}
                onChange={(value) => setSearchQuery(value as string)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Input
                type="select"
                value={filters.status}
                onChange={(value) => setStatusFilter(value as string)}
                options={statusOptions}
                leftIcon={<Filter className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            {/* Items per page */}
            <div className="w-full lg:w-36">
              <Input
                type="select"
                value={pagination.limit}
                onChange={(value) => setLimit(value as number)}
                options={limitOptions}
                className="w-full"
              />
            </div>

            {/* Clear Filters */}
            <div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full lg:w-auto"
              >
                {language?.filters?.clearFilters || 'Clear'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoadingOrders ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cb-red"></div>
            </div>
          </div>
        ) : orders?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language?.noOrders?.title || 'No orders found'}
            </h3>
            <p className="text-gray-500">
              {language?.noOrders?.description || 'You haven\'t received any orders yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders?.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Product Image & Info */}
                    <div className="col-span-12 lg:col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <DynamicImage
                            src={order.product.images[0]}
                            alt={order.product.name}
                            objectFit="cover"
                            width="w-full"
                            height="h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            #{order.orderId}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">{order.product.name}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">
                              Qty: {order.quotation.quantity}
                            </span>
                            <span className="text-xs font-medium text-gray-900">
                              {formatCurrency(order.finalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div className="col-span-12 lg:col-span-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {order.buyer.fullName}
                          </p>
                        </div>
                        {order.buyer.companyName && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-600 truncate">
                              {order.buyer.companyName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-12 lg:col-span-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusBadgeColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{formatOrderStatus(order.status)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Date & Tracking */}
                    <div className="col-span-12 lg:col-span-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center space-x-1">
                            <Truck className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600 truncate">
                              {order.trackingNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 lg:col-span-1">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailModal(order)}
                          ariaLabel="View details"
                          className="p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStatusModal(order)}
                            ariaLabel="Update status"
                            className="p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional tracking info for mobile */}
                  {(order.trackingNumber || order.estimatedDeliveryDate) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 lg:hidden">
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        {order.trackingNumber && (
                          <div className="flex items-center space-x-1">
                            <Truck className="h-3 w-3" />
                            <span>Tracking: {order.trackingNumber}</span>
                          </div>
                        )}
                        {order.estimatedDeliveryDate && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Est. Delivery: {formatDate(order.estimatedDeliveryDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
              <div className="text-sm text-gray-700">
                {language?.pagination?.showing || 'Showing'} {((pagination.page - 1) * pagination.limit) + 1} {language?.pagination?.to || 'to'} {Math.min(pagination.page * pagination.limit, pagination.total)} {language?.pagination?.of || 'of'} {pagination.total} {language?.pagination?.results || 'results'}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev || isLoading}
                >
                  {language?.pagination?.previous || 'Previous'}
                </Button>
                <span className="text-sm text-gray-600 px-3">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={!pagination.hasNext || isLoading}
                >
                  {language?.pagination?.next || 'Next'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={isDetailModalOpen}
        order={selectedOrder ?? null}
        isLoading={isLoadingOrderDetail}
        language={language}
        onClose={closeDetailModal}
        getOrderStatusBadgeColor={(status: string) => getOrderStatusBadgeColor(status as OrderStatus)}
        formatOrderStatus={(status: string) => formatOrderStatus(status as OrderStatus)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        open={isStatusModalOpen}
        order={selectedOrder ? selectedOrder : null}
        language={language}
        onClose={closeStatusModal}
        onSubmit={handleStatusUpdate}
        isLoading={isUpdatingStatus}
        formatOrderStatus={formatOrderStatus}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={isConfirmModalOpen}
        title={language?.confirmModal?.title || 'Confirm Status Update'}
        description={
          statusUpdateData 
            ? `${language?.confirmModal?.description || 'Are you sure you want to update the order status to'} "${formatOrderStatus(statusUpdateData.status)}"? ${language?.confirmModal?.warning || 'This action may be irreversible.'}`
            : ''
        }
        confirmButtonText={isUpdatingStatus ? (language?.statusModal?.updating || 'Updating...') : (language?.confirmModal?.confirm || 'Confirm Update')}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmStatusUpdate}
        isLoading={isUpdatingStatus}
        width="lg"
        theme={['cb-red', 'white']}
      />
    </div>
  );
};

export default Orders;
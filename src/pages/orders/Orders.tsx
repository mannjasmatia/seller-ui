import React from 'react';
import { useSelector } from 'react-redux';
import { Search, Filter, Calendar, Package, Eye, Edit3, X, Truck, MapPin, Phone, Mail, User, Building } from 'lucide-react';
import { RootState } from '../../store/appStore';
import { useOrders } from './useOrders';
import Button from '../../components/BasicComponents/Button';
import Input from '../../components/BasicComponents/Input';
import DynamicImage from '../../components/BasicComponents/Image';
import ConfirmationModal from '../../modals/ConfirmationModal';
import { OrderStatus } from './types.orders';

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
    isCancelModalOpen,
    isLoading,
    isLoadingOrders,
    isLoadingOrderDetail,
    isUpdatingStatus,
    isError,
    setStatusFilter,
    setSearchQuery,
    setPage,
    clearFilters,
    openDetailModal,
    closeDetailModal,
    openStatusModal,
    closeStatusModal,
    openCancelModal,
    closeCancelModal,
    handleUpdateStatus,
    refetchOrders,
    getOrderStatusBadgeColor,
    formatOrderStatus,
  } = useOrders();

  const [statusUpdateForm, setStatusUpdateForm] = React.useState({
    status: '' as OrderStatus,
    trackingNumber: '',
    estimatedDeliveryDate: '',
  });

  const [cancelForm, setCancelForm] = React.useState({
    cancellationReason: '',
  });

  // Status options
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

  const handleStatusUpdate = () => {
    if (!statusUpdateForm.status) return;
    
    handleUpdateStatus({
      status: statusUpdateForm.status,
      ...(statusUpdateForm.trackingNumber && { trackingNumber: statusUpdateForm.trackingNumber }),
      ...(statusUpdateForm.estimatedDeliveryDate && { estimatedDeliveryDate: statusUpdateForm.estimatedDeliveryDate }),
    });
  };

//   const handleOrderCancel = () => {
//     handleCancelOrder({
//       ...(cancelForm.cancellationReason && { cancellationReason: cancelForm.cancellationReason }),
//     });
//   };

  const getStatusTransitionOptions = (currentStatus: OrderStatus, canTransitionTo?: OrderStatus[]) => {
    if (!canTransitionTo) return [];
    
    return canTransitionTo.map(status => ({
      label: formatOrderStatus(status),
      value: status
    }));
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language?.errors?.loadingFailed || 'Failed to load orders'}
          </h2>
          <p className="text-gray-600 mb-4">
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
            <h1 className="text-3xl font-bold text-gray-900">
              {language?.title || 'Orders Management'}
            </h1>
            <p className="mt-2 text-gray-600">
              {language?.subtitle || 'Manage and track your customer orders'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder={language?.filters?.searchPlaceholder || 'Search orders...'}
                value={filters.searchQuery}
                onChange={(value) => setSearchQuery(value as string)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Input
                type="select"
                value={filters.status}
                onChange={(value) => setStatusFilter(value as string)}
                options={statusOptions}
                leftIcon={<Filter className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                leftIcon={<X className="h-4 w-4" />}
              >
                {language?.filters?.clearFilters || 'Clear Filters'}
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
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language?.noOrders?.title || 'No orders found'}
            </h3>
            <p className="text-gray-600">
              {language?.noOrders?.description || 'You haven\'t received any orders yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between gap-4 items-center">
                  {/* Product Image */}
                  <div className="lg:col-span-2">
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <DynamicImage
                        src={`${MEDIA_URL}/${order.product.images[0]}`}
                        alt={order.product.name}
                        objectFit="cover"
                        width="w-full"
                        height="h-full"
                        rounded="md"
                      />
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="lg:col-span-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">
                        {language?.orderCard?.orderNumber || 'Order'} #{order.orderId}
                      </h3>
                      <p className="text-sm text-gray-600">{order.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {language?.orderCard?.quantity || 'Qty'}: {order.quotation.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="lg:col-span-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{order.buyer.fullName}</p>
                      <p className="text-sm text-gray-600">{order.buyer.companyName}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadgeColor(order.status)}`}>
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="lg:col-span-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.finalPrice)}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="lg:col-span-1">
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailModal(order)}
                        ariaLabel="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusModal(order)}
                          ariaLabel="Update status"
                        >
                            <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {/* {(order.status === 'pending' || order.status === 'confirmed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCancelModal(order)}
                          ariaLabel="Cancel order"
                          theme={['red-500', 'white']}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Truck className="h-4 w-4" />
                        <span>{language?.orderCard?.tracking || 'Tracking'}: {order.trackingNumber}</span>
                      </div>
                      {order.estimatedDeliveryDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {language?.orderCard?.estimatedDelivery || 'Est. Delivery'}: {formatDate(order.estimatedDeliveryDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {language?.pagination?.showing || 'Showing'} {((pagination.page - 1) * pagination.limit) + 1} {language?.pagination?.to || 'to'} {Math.min(pagination.page * pagination.limit, pagination.total)} {language?.pagination?.of || 'of'} {pagination.total} {language?.pagination?.results || 'results'}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  {language?.pagination?.previous || 'Previous'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  {language?.pagination?.next || 'Next'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDetailModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {language?.detailModal?.title || 'Order Details'} - #{selectedOrder.orderId}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeDetailModal}
                    ariaLabel="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isLoadingOrderDetail ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cb-red"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        {language?.detailModal?.productInfo || 'Product Information'}
                      </h4>
                      <div className="border rounded-lg p-4">
                        <div className="flex space-x-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <DynamicImage
                              src={`${MEDIA_URL}/${selectedOrder?.product?.images[0]}`}
                              alt={selectedOrder.product.name}
                              objectFit="cover"
                              width="w-full"
                              height="h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{selectedOrder?.product.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{selectedOrder.product.category}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {language?.detailModal?.quantity || 'Quantity'}: {selectedOrder.quotation.quantity}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Information */}
                      <h4 className="font-semibold text-gray-900">
                        {language?.detailModal?.orderInfo || 'Order Information'}
                      </h4>
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">{language?.detailModal?.status || 'Status'}:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadgeColor(selectedOrder.status)}`}>
                            {formatOrderStatus(selectedOrder.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">{language?.detailModal?.finalPrice || 'Final Price'}:</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.finalPrice)}</span>
                        </div>
                        {selectedOrder.trackingNumber && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{language?.detailModal?.tracking || 'Tracking'}:</span>
                            <span className="text-sm font-medium text-gray-900">{selectedOrder.trackingNumber}</span>
                          </div>
                        )}
                        {selectedOrder.estimatedDeliveryDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{language?.detailModal?.estimatedDelivery || 'Est. Delivery'}:</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(selectedOrder.estimatedDeliveryDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">{language?.detailModal?.createdAt || 'Created'}:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer & Address Information */}
                    <div className="space-y-4">
                      {/* Buyer Info */}
                      <h4 className="font-semibold text-gray-900">
                        {language?.detailModal?.buyerInfo || 'Buyer Information'}
                      </h4>
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{selectedOrder.buyer.fullName}</span>
                        </div>
                        {selectedOrder.buyer.companyName && (
                          <div className="flex items-center space-x-3">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedOrder.buyer.companyName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedOrder.buyer.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedOrder.buyer.phone}</span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <h4 className="font-semibold text-gray-900">
                        {language?.detailModal?.shippingAddress || 'Shipping Address'}
                      </h4>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="text-sm text-gray-600">
                            <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                            <p>{selectedOrder.shippingAddress.addressLine1}</p>
                            {selectedOrder.shippingAddress.addressLine2 && (
                              <p>{selectedOrder.shippingAddress.addressLine2}</p>
                            )}
                            <p>
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}
                            </p>
                            <p>{selectedOrder.shippingAddress.country}</p>
                            <p className="mt-1">
                              <Phone className="h-3 w-3 inline mr-1" />
                              {selectedOrder.shippingAddress.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Information */}
                      <h4 className="font-semibold text-gray-900">
                        {language?.detailModal?.invoiceInfo || 'Invoice Information'}
                      </h4>
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">{language?.detailModal?.negotiatedPrice || 'Base Price'}:</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.invoice.negotiatedPrice)}</span>
                        </div>
                        {selectedOrder.invoice.taxAmount && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{language?.detailModal?.tax || 'Tax'}:</span>
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.invoice.taxAmount)}</span>
                          </div>
                        )}
                        {selectedOrder.invoice.shippingCharges && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{language?.detailModal?.shipping || 'Shipping'}:</span>
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.invoice.shippingCharges)}</span>
                          </div>
                        )}
                        <div className="border-t pt-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold text-gray-900">{language?.detailModal?.total || 'Total'}:</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(selectedOrder.finalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <ConfirmationModal
        open={isStatusModalOpen}
        title={language?.statusModal?.title || 'Update Order Status'}
        description={language?.statusModal?.description || 'Update the status of this order and add tracking information if needed.'}
        confirmButtonText={isUpdatingStatus ? (language?.statusModal?.updating || 'Updating...') : (language?.statusModal?.update || 'Update Status')}
        onClose={closeStatusModal}
        onConfirm={handleStatusUpdate}
        isLoading={isUpdatingStatus}
        isDisabled={!statusUpdateForm.status}
        width="lg"
      />

      {/* Cancel Order Modal */}
      {/* <ConfirmationModal
        open={isCancelModalOpen}
        title={language?.cancelModal?.title || 'Cancel Order'}
        description={language?.cancelModal?.description || 'Are you sure you want to cancel this order? This action cannot be undone.'}
        confirmButtonText={isCancelling ? (language?.cancelModal?.cancelling || 'Cancelling...') : (language?.cancelModal?.cancel || 'Cancel Order')}
        onClose={closeCancelModal}
        onConfirm={handleOrderCancel}
        isLoading={isCancelling}
        theme={['red-500', 'white']}
        width="lg"
        /> */}
    </div>
  );
};

export default Orders;
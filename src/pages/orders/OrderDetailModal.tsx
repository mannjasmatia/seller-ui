import React, { useEffect, useRef } from 'react';
import Button from '../../components/BasicComponents/Button';
import DynamicImage from '../../components/BasicComponents/Image';
import { X, User, Building, Mail, Phone, MapPin } from 'lucide-react';
import { Order } from './types.orders';

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  isLoading: boolean;
  language: any;
  onClose: () => void;
  getOrderStatusBadgeColor: (status: string) => string;
  formatOrderStatus: (status: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  order,
  isLoading,
  language,
  onClose,
  getOrderStatusBadgeColor,
  formatOrderStatus,
  formatCurrency,
  formatDate,
}) => {
  if (!open || !order) return null;

  const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (open) {
    document.addEventListener("mousedown", handleOutsideClick);
  }

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, [open, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-transparent bg-opacity-75 overflow-y-auto backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen ">
        {/* <div className="fixed inset-0 transition-opacity" onClick={onClose}></div> */}
        <div ref={modalRef} className="h-full inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {language?.detailModal?.title || 'Order Details'} - #{order.orderId}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                ariaLabel="Close"
                className='p-3 bg-red-200 hover:bg-red-300'
              >
                <X className="h-7 w-7" />
              </Button>
            </div>
            {isLoading ? (
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
                          src={`${MEDIA_URL}/${order?.product?.images[0]}`}
                          alt={order.product.name}
                          objectFit="cover"
                          width="w-full"
                          height="h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{order?.product.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{order.product.category}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {language?.detailModal?.quantity || 'Quantity'}: {order.quotation.quantity}
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
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadgeColor(order.status)}`}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{language?.detailModal?.finalPrice || 'Final Price'}:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(order.finalPrice)}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{language?.detailModal?.tracking || 'Tracking'}:</span>
                        <span className="text-sm font-medium text-gray-900">{order.trackingNumber}</span>
                      </div>
                    )}
                    {order.estimatedDeliveryDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{language?.detailModal?.estimatedDelivery || 'Est. Delivery'}:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(order.estimatedDeliveryDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{language?.detailModal?.createdAt || 'Created'}:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</span>
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
                      <span className="text-sm font-medium text-gray-900">{order.buyer.fullName}</span>
                    </div>
                    {order.buyer.companyName && (
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order.buyer.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{order.buyer.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{order.buyer.phone ?? "-"}</span>
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
                        <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                        {/* <p className="mt-1">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {order.shippingAddress.phone}
                        </p> */}
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
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(order.invoice.negotiatedPrice)}</span>
                    </div>
                    {order.invoice.taxAmount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{language?.detailModal?.tax || 'Tax'}:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(order.invoice.taxAmount)}</span>
                      </div>
                    )}
                    {order.invoice.shippingCharges && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{language?.detailModal?.shipping || 'Shipping'}:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(order.invoice.shippingCharges)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">{language?.detailModal?.total || 'Total'}:</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.finalPrice)}</span>
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
  );
};

export default OrderDetailModal;

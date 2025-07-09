import React, { useEffect, useRef } from 'react';
import { X, User, Building, Mail, Phone, MapPin, Package, Calendar, Truck, CreditCard } from 'lucide-react';
import { Order } from '../types.orders';
import Button from '../../../components/BasicComponents/Button';
import DynamicImage from '../../../components/BasicComponents/Image';

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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language?.detailModal?.title || 'Order Details'}
              </h3>
              {order && (
                <p className="text-sm text-gray-600 mt-1">
                  Order #{order.orderId}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              ariaLabel="Close"
              className="p-2 hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cb-red"></div>
              </div>
            ) : order ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <DynamicImage
                          src={order.product.images[0]}
                          alt={order.product.name}
                          objectFit="cover"
                          width="w-full"
                          height="h-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{order.product.name}</h4>
                        <p className="text-sm text-gray-600">{order.product.category}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {language?.detailModal?.quantity || 'Quantity'}: {order.quotation.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadgeColor(order.status)}`}>
                        {formatOrderStatus(order.status)}
                      </span>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        {formatCurrency(order.finalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Buyer Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {language?.detailModal?.buyerInfo || 'Buyer Information'}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">{order.buyer.fullName}</span>
                        </div>
                        {order.buyer.companyName && (
                          <div className="flex items-center space-x-2">
                            <Building className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.buyer.companyName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{order.buyer.email}</span>
                        </div>
                        {order.buyer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.buyer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {language?.detailModal?.shippingAddress || 'Shipping Address'}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Order Details */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        {language?.detailModal?.orderInfo || 'Order Information'}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{language?.detailModal?.status || 'Status'}:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusBadgeColor(order.status)}`}>
                            {formatOrderStatus(order.status)}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 flex items-center">
                              <Truck className="h-3 w-3 mr-1" />
                              {language?.detailModal?.tracking || 'Tracking'}:
                            </span>
                            <span className="font-medium">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.estimatedDeliveryDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {language?.detailModal?.estimatedDelivery || 'Est. Delivery'}:
                            </span>
                            <span className="font-medium">{formatDate(order.estimatedDeliveryDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{language?.detailModal?.createdAt || 'Created'}:</span>
                          <span className="font-medium">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {language?.detailModal?.invoiceInfo || 'Invoice Information'}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{language?.detailModal?.negotiatedPrice || 'Base Price'}:</span>
                          <span className="font-medium">{formatCurrency(order.invoice.negotiatedPrice)}</span>
                        </div>
                        {order.invoice.taxAmount && order.invoice.taxAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{language?.detailModal?.tax || 'Tax'}:</span>
                            <span className="font-medium">{formatCurrency(order.invoice.taxAmount)}</span>
                          </div>
                        )}
                        {order.invoice.shippingCharges && order.invoice.shippingCharges > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{language?.detailModal?.shipping || 'Shipping'}:</span>
                            <span className="font-medium">{formatCurrency(order.invoice.shippingCharges)}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-3">
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-gray-900">{language?.detailModal?.total || 'Total'}:</span>
                            <span className="text-gray-900">{formatCurrency(order.finalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Order not found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
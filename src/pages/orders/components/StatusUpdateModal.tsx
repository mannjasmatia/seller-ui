import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, Calendar, AlertCircle } from 'lucide-react';
import { Order, OrderStatus, StatusUpdateFormData } from '../types.orders';
import Button from '../../../components/BasicComponents/Button';
import Input from '../../../components/BasicComponents/Input';

interface StatusUpdateModalProps {
  open: boolean;
  order: Order | null;
  language: any;
  onClose: () => void;
  onSubmit: (data: StatusUpdateFormData) => void;
  isLoading: boolean;
  formatOrderStatus: (status: string) => string;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  open,
  order,
  language,
  onClose,
  onSubmit,
  isLoading,
  formatOrderStatus,
}) => {
  const [modalElement, setModalElement] = useState<HTMLElement | null>(null);
  const [formData, setFormData] = useState<StatusUpdateFormData>({
    status: '' as OrderStatus,
    trackingNumber: '',
    estimatedDeliveryDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Create portal element on mount
  useEffect(() => {
    const element = document.createElement('div');
    element.id = 'status-update-modal-root';
    document.body.appendChild(element);
    setModalElement(element);
    
    return () => {
      document.body.removeChild(element);
    };
  }, []);

  // Initialize form data when order changes
  useEffect(() => {
    if (order && open) {
      setFormData({
        status: '' as OrderStatus,
        trackingNumber: order.trackingNumber || '',
        estimatedDeliveryDate: order.estimatedDeliveryDate ? 
          new Date(order.estimatedDeliveryDate).toISOString().slice(0, 16) : '',
      });
      setErrors({});
    }
  }, [order, open]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle outside click
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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !order || !modalElement) {
    return null;
  }

  // Get all available status options (not based on transitions)
  const getStatusOptions = () => {
    const allStatuses = [
      'pending',
      'confirmed', 
      'processing',
      'ready_to_ship',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned'
    ] as OrderStatus[];
    
    return allStatuses.map(status => ({
      label: formatOrderStatus(status),
      value: status
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.status) {
      newErrors.status = language?.statusModal?.validation?.statusRequired || 'Status is required';
    }

    // Require tracking number for shipped statuses
    if (['shipped', 'in_transit', 'out_for_delivery'].includes(formData.status) && !formData.trackingNumber?.trim()) {
      newErrors.trackingNumber = language?.statusModal?.validation?.trackingRequired || 'Tracking number is required for shipped orders';
    }

    // Validate estimated delivery date
    if (formData.estimatedDeliveryDate) {
      const selectedDate = new Date(formData.estimatedDeliveryDate);
      const now = new Date();
      
      if (selectedDate <= now) {
        newErrors.estimatedDeliveryDate = language?.statusModal?.validation?.futureDateRequired || 'Estimated delivery date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const submitData: StatusUpdateFormData = {
      status: formData.status,
    };

    if (formData.trackingNumber?.trim()) {
      submitData.trackingNumber = formData.trackingNumber.trim();
    }

    if (formData.estimatedDeliveryDate) {
      submitData.estimatedDeliveryDate = formData.estimatedDeliveryDate;
    }

    onSubmit(submitData);
  };

  // Check if status requires additional fields
  const requiresTracking = ['shipped', 'in_transit', 'out_for_delivery'].includes(formData.status);
  const isShippingStatus = ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(formData.status);

  // Get status color for preview
  const getStatusPreviewColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
      processing: 'text-purple-600 bg-purple-50 border-purple-200',
      ready_to_ship: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      shipped: 'text-green-600 bg-green-50 border-green-200',
      in_transit: 'text-teal-600 bg-teal-50 border-teal-200',
      out_for_delivery: 'text-orange-600 bg-orange-50 border-orange-200',
      delivered: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
      returned: 'text-gray-600 bg-gray-50 border-gray-200',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language?.statusModal?.title || 'Update Order Status'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Order #{order.orderId}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            ariaLabel="Close"
            className="p-2 hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status Display */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              {language?.statusModal?.currentStatus || 'Current Status'}:
            </p>
            <span className="text-sm font-medium text-gray-900">
              {formatOrderStatus(order.status)}
            </span>
          </div>

          {/* Status Selection */}
          <div>
            <Input
              label={language?.statusModal?.newStatus || 'New Status'}
              type="select"
              value={formData.status}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value as OrderStatus }))}
              options={[
                { label: language?.statusModal?.selectStatus || 'Select new status...', value: '' },
                ...getStatusOptions()
              ]}
              error={errors.status}
              disabled={isLoading}
              validation={{
                required:true,
                errorMessages:{
                    required:'New status is required'
                }
              }}
            />
          </div>

          {/* Status Preview */}
          {formData.status && (
            <div className={`p-3 rounded-lg border ${getStatusPreviewColor(formData.status)}`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language?.statusModal?.willUpdateTo || 'Order status will be updated to'}: {formatOrderStatus(formData.status)}
                </span>
              </div>
            </div>
          )}

          {/* Tracking Number */}
          {(requiresTracking || formData.trackingNumber) && (
            <div>
              <Input
                label={language?.statusModal?.trackingNumber || 'Tracking Number'}
                type="text"
                value={formData.trackingNumber}
                onChange={(value) => setFormData(prev => ({ ...prev, trackingNumber: value as string }))}
                placeholder={language?.statusModal?.trackingPlaceholder || 'Enter tracking number'}
                leftIcon={<Truck className="h-4 w-4" />}
                error={errors.trackingNumber}
                disabled={isLoading}
                validation={{
                required:requiresTracking,
                errorMessages:{
                    required:'Tracking number is required'
                }
              }}
                hint={requiresTracking ? (language?.statusModal?.trackingHint || 'Tracking number is required for shipping statuses') : undefined}
              />
            </div>
          )}

          {/* Estimated Delivery Date */}
          {(isShippingStatus || formData.estimatedDeliveryDate) && (
            <div>
              <Input
                label={language?.statusModal?.estimatedDelivery || 'Estimated Delivery Date'}
                type="datetime-local"
                value={formData.estimatedDeliveryDate}
                onChange={(value) => setFormData(prev => ({ ...prev, estimatedDeliveryDate: value as string }))}
                leftIcon={<Calendar className="h-4 w-4" />}
                error={errors.estimatedDeliveryDate}
                disabled={isLoading}
                hint={language?.statusModal?.deliveryHint || 'Optional: Set expected delivery date and time'}
              />
            </div>
          )}

          {/* Warning for irreversible actions */}
          {['delivered', 'cancelled', 'returned'].includes(formData.status) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">
                    {language?.statusModal?.warningTitle || 'Important Notice'}
                  </p>
                  <p className="mt-1">
                    {language?.statusModal?.warningMessage || 'This status change may be irreversible. Please ensure all details are correct before proceeding.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {language?.statusModal?.cancel || 'Cancel'}
          </Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={isLoading || !formData.status}
            isLoading={isLoading}
            theme={['cb-red', 'white']}
          >
            {isLoading 
              ? (language?.statusModal?.updating || 'Updating...') 
              : (language?.statusModal?.update || 'Update Status')
            }
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalElement);
};

export default StatusUpdateModal;
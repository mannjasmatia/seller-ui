import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, FileText, Truck, Receipt } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/appStore';
import Button from '../../../components/BasicComponents/Button';
import Input from '../../../components/BasicComponents/Input';

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (invoiceData: {
    negotiatedPrice: number;
    paymentTerms?: string;
    deliveryTerms?: string;
    taxAmount?: number;
    shippingCharges?: number;
    notes?: string;
  }) => void;
  isGenerating: boolean;
  quotationPriceRange?: {
    min: number;
    max: number;
  };
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  onClose,
  onGenerate,
  isGenerating,
  quotationPriceRange
}) => {
  const language = useSelector((state: RootState) => state.language?.value)['inboxChat']['invoiceModal'];
  
  const [formData, setFormData] = useState({
    negotiatedPrice: quotationPriceRange?.max || 0,
    paymentTerms: 'Payment on delivery',
    deliveryTerms: 'Standard delivery within 5-7 days',
    taxAmount: 0,
    shippingCharges: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.negotiatedPrice || formData.negotiatedPrice <= 0) {
      newErrors.negotiatedPrice = language.validation.priceRequired;
    }

    if (formData.taxAmount < 0) {
      newErrors.taxAmount = language.validation.taxMin;
    }

    if (formData.shippingCharges < 0) {
      newErrors.shippingCharges = language.validation.shippingMin;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onGenerate({
        negotiatedPrice: Number(formData.negotiatedPrice),
        paymentTerms: formData.paymentTerms || undefined,
        deliveryTerms: formData.deliveryTerms || undefined,
        taxAmount: Number(formData.taxAmount) || undefined,
        shippingCharges: Number(formData.shippingCharges) || undefined,
        notes: formData.notes || undefined
      });
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setFormData({
        negotiatedPrice: quotationPriceRange?.max || 0,
        paymentTerms: 'Payment on delivery',
        deliveryTerms: 'Standard delivery within 5-7 days',
        taxAmount: 0,
        shippingCharges: 0,
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  const calculateTotal = () => {
    return Number(formData.negotiatedPrice) + Number(formData.taxAmount) + Number(formData.shippingCharges);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Receipt className="w-6 h-6 mr-2 text-cb-red" />
              {language.title}
            </h2>
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Price Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-cb-red" />
                Price Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={language.negotiatedPrice}
                    type="number"
                    value={formData.negotiatedPrice}
                    onChange={(value) => handleInputChange('negotiatedPrice', value)}
                    placeholder={language.negotiatedPricePlaceholder}
                    error={errors.negotiatedPrice}
                    validation={{ required: true, min: 0.01 }}
                    disabled={isGenerating}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />
                  {quotationPriceRange && (
                    <p className="text-xs text-gray-500 mt-1">
                      Range: {formatCurrency(quotationPriceRange.min)} - {formatCurrency(quotationPriceRange.max)}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    label={language.taxAmount}
                    type="number"
                    value={formData.taxAmount}
                    onChange={(value) => handleInputChange('taxAmount', value)}
                    placeholder={language.taxAmountPlaceholder}
                    error={errors.taxAmount}
                    validation={{ min: 0 }}
                    disabled={isGenerating}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />

                  <Input
                    label={language.shippingCharges}
                    type="number"
                    value={formData.shippingCharges}
                    onChange={(value) => handleInputChange('shippingCharges', value)}
                    placeholder={language.shippingChargesPlaceholder}
                    error={errors.shippingCharges}
                    validation={{ min: 0 }}
                    disabled={isGenerating}
                    leftIcon={<Truck className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-cb-red" />
                Terms & Conditions
              </h3>
              
              <div className="space-y-4">
                <Input
                  label={language.paymentTerms}
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(value) => handleInputChange('paymentTerms', value)}
                  placeholder={language.paymentTermsPlaceholder}
                  disabled={isGenerating}
                />

                <Input
                  label={language.deliveryTerms}
                  type="text"
                  value={formData.deliveryTerms}
                  onChange={(value) => handleInputChange('deliveryTerms', value)}
                  placeholder={language.deliveryTermsPlaceholder}
                  disabled={isGenerating}
                />

                <Input
                  label={language.notes}
                  type="textarea"
                  value={formData.notes}
                  onChange={(value) => handleInputChange('notes', value)}
                  placeholder={language.notesPlaceholder}
                  rows={3}
                  disabled={isGenerating}
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-cb-red/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">
                  {language.totalAmount}:
                </span>
                <span className="text-2xl font-bold text-cb-red">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleClose}
                disabled={isGenerating}
                className="flex-1"
                theme={['gray-500', 'white']}
              >
                {language.cancel}
              </Button>
              <Button
                type="submit"
                variant="solid"
                size="md"
                isLoading={isGenerating}
                disabled={isGenerating}
                className="flex-1"
                theme={['cb-red', 'white']}
              >
                {isGenerating ? language.generating : language.generate}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default InvoiceModal;
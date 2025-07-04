import React from 'react';
import { createPortal } from 'react-dom';
import { X, User, Package, MapPin, Calendar, DollarSign, FileText, Hash } from 'lucide-react';
import { useSelector } from 'react-redux';
import { QuotationDetail } from '../types.quotation';
import { RootState } from '../../../store/appStore';
import Button from '../../../components/BasicComponents/Button';
import DynamicImage from '../../../components/BasicComponents/Image';


interface QuotationDetailModalProps {
  open: boolean;
  quotation: QuotationDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onAccept: (quotationId: string) => void;
  onReject: (quotationId: string) => void;
  onNegotiate: (quotationId: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
  isNegotiating: boolean;
}

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  open,
  quotation,
  isLoading,
  onClose,
  onAccept,
  onReject,
  onNegotiate,
  isAccepting,
  isRejecting,
  isNegotiating
}) => {
  const language = useSelector((state: RootState) => state.language?.value)['inbox'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'negotiation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActionButtons = () => {
    if (!quotation) return null;

    if (quotation.status === 'pending') {
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => onReject(quotation._id)}
            isLoading={isRejecting}
            disabled={isAccepting || isNegotiating}
            className="flex-1"
            theme={['red-500', 'white']}
          >
            {language.actions.reject}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => onNegotiate(quotation._id)}
            isLoading={isNegotiating}
            disabled={isAccepting || isRejecting}
            className="flex-1"
            theme={['blue-500', 'white']}
          >
            {language.actions.negotiate}
          </Button>
          <Button
            variant="solid"
            size="md"
            onClick={() => onAccept(quotation._id)}
            isLoading={isAccepting}
            disabled={isRejecting || isNegotiating}
            className="flex-1"
            theme={['cb-red', 'white']}
          >
            {language.actions.accept}
          </Button>
        </div>
      );
    } else if (quotation.status === 'negotiation' && quotation.chatId) {
      return (
        <Button
          variant="solid"
          size="md"
          onClick={() => {/* Navigate to chat */}}
          className="w-full"
          theme={['cb-red', 'white']}
        >
          {language.actions.viewChat}
        </Button>
      );
    } else if (quotation.hasOrder && quotation.order) {
      return (
        <Button
          variant="solid"
          size="md"
          onClick={() => {/* Navigate to order */}}
          className="w-full"
          theme={['cb-red', 'white']}
        >
          {language.actions.viewOrder}
        </Button>
      );
    }

    return null;
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 my-8">
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {language.detailModal.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isAccepting || isRejecting || isNegotiating}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cb-red mx-auto"></div>
              <p className="mt-4 text-gray-500">{language.loadingQuotations}</p>
            </div>
          ) : quotation ? (
            <div className="px-6 py-4 space-y-6">
              {/* Product Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-cb-red" />
                  {language.detailModal.productInfo}
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  {quotation.productImages && quotation.productImages.length > 0 && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <DynamicImage
                        src={`${MEDIA_URL}/${quotation.productImages[0]}`}
                        alt={quotation.productName}
                        width="w-full"
                        height="h-full"
                        objectFit="cover"
                        rounded="md"
                        className="border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{quotation.productName}</h4>
                    {quotation.productImages && quotation.productImages.length > 1 && (
                      <p className="text-sm text-gray-500 mt-1">
                        +{quotation.productImages.length - 1} more images
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-cb-red" />
                  {language.detailModal.buyerInfo}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {quotation.buyerProfilePic ? (
                      <DynamicImage
                        src={`${MEDIA_URL}/${quotation.buyerProfilePic}`}
                        alt={quotation.buyerName}
                        width="w-full"
                        height="h-full"
                        objectFit="cover"
                        rounded="full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{quotation.buyerName}</p>
                    <p className="text-sm text-gray-500">Buyer</p>
                  </div>
                </div>
              </div>

              {/* Quotation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-cb-red" />
                    {language.detailModal.quotationInfo}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language.detailModal.quantity}:</span>
                      <span className="font-medium">{quotation.quantity} {language.quotationCard.pieces}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language.detailModal.priceRange}:</span>
                      <span className="font-medium">
                        {formatCurrency(quotation.minPrice)} - {formatCurrency(quotation.maxPrice)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language.detailModal.deadline}:</span>
                      <span className="font-medium">{formatDate(quotation.deadline)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language.detailModal.location}:</span>
                      <span className="font-medium">{quotation.state}, {quotation.pinCode}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language.detailModal.status}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{language.detailModal.description}</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {quotation.description || language.detailModal.noDescription}
                    </p>
                  </div>

                  {/* Attributes */}
                  {quotation.attributes && quotation.attributes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{language.detailModal.attributes}</h4>
                      <div className="space-y-2">
                        {quotation.attributes.map((attr, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                            <span className="text-gray-600">{attr.field}:</span>
                            <span className="font-medium">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quotation.attributes.length === 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{language.detailModal.attributes}</h4>
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                        {language.detailModal.noAttributes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Information */}
              {(quotation.chatPhase || quotation.hasActiveInvoice || quotation.hasOrder) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-cb-red" />
                    Business Status
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quotation.chatPhase && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{language.detailModal.chatPhase}</p>
                        <p className="font-medium">{quotation.chatPhase}</p>
                      </div>
                    )}
                    
                    {quotation.hasActiveInvoice && quotation.activeInvoice && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{language.detailModal.invoiceInfo}</p>
                        <p className="font-medium">{formatCurrency(quotation.activeInvoice.amount)}</p>
                        <p className="text-xs text-gray-500">{quotation.activeInvoice.status}</p>
                      </div>
                    )}
                    
                    {quotation.hasOrder && quotation.order && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{language.detailModal.orderInfo}</p>
                        <p className="font-medium">{quotation.order.orderId}</p>
                        <p className="text-xs text-gray-500">{quotation.order.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">{language.errorLoading}</p>
            </div>
          )}

          {/* Footer */}
          {quotation && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              {renderActionButtons()}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default QuotationDetailModal;
import React from 'react';
import { createPortal } from 'react-dom';
import { X, User, Package, MapPin, Calendar, DollarSign, FileText, Hash, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { QuotationDetail } from '../types.quotation';
import { RootState } from '../../../store/appStore';
import Button from '../../../components/BasicComponents/Button';
import DynamicImage from '../../../components/BasicComponents/Image';
import { getStateNameFromCode } from '../../../utils/getStateFromCountry';

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
    //   hour: '2-digit',
    //   minute: '2-digit'
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'negotiation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'negotiation':
        return <FileText className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const renderActionButtons = () => {
    if (!quotation) return null;

    if (quotation.status === 'pending') {
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* <Button
            variant="outline"
            size="md"
            onClick={() => onReject(quotation._id)}
            isLoading={isRejecting}
            disabled={isAccepting || isNegotiating}
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
          >
            {language.actions.reject}
          </Button> */}
          <Button
            variant="outline"
            size="md"
            onClick={() => onNegotiate(quotation._id)}
            isLoading={isNegotiating}
            disabled={isAccepting || isRejecting}
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            {language.actions.negotiate}
          </Button>
          <Button
            variant="solid"
            size="md"
            onClick={() => onAccept(quotation._id)}
            isLoading={isAccepting}
            disabled={isRejecting || isNegotiating}
            className="flex-1 bg-cb-red hover:bg-cb-red/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {language.actions.accept}
          </Button>
        </div>
      );
    } else if (quotation.status === 'negotiation' && quotation.chatId) {
      return (<></>
        // <Button
        //   variant="solid"
        //   size="md"
        //   onClick={() => {/* Navigate to chat */}}
        //   className="w-full bg-cb-red hover:bg-cb-red/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        // >
        //   {language.actions.viewChat}
        // </Button>
      );
    } else if (quotation.hasOrder && quotation.order) {
      return (
        <Button
          variant="solid"
          size="md"
          onClick={() => {/* Navigate to order */}}
          className="w-full bg-cb-red hover:bg-cb-red/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {language.actions.viewOrder}
        </Button>
      );
    }

    return null;
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4 my-8">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-100">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cb-red/10 rounded-lg">
                <FileText className="w-5 h-5 text-cb-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language.detailModal.title}
                </h2>
                <p className="text-sm text-gray-600">Quotation Request Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              disabled={isAccepting || isRejecting || isNegotiating}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="px-8 py-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-red mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">{language.loadingQuotations}</p>
            </div>
          ) : quotation ? (
            <div className="px-6 py-4 space-y-6">
              {/* Status Card Only */}
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getStatusIcon(quotation.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Status</p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(quotation.status)}`}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Request ID</p>
                  <p className="font-mono text-sm font-medium text-gray-700">#{quotation._id.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Product Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="p-1.5 bg-cb-red/10 rounded-lg mr-2">
                        <Package className="w-4 h-4 text-cb-red" />
                      </div>
                      {language.detailModal.productInfo}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {quotation.productImages && quotation.productImages.length > 0 && (
                        <div className="w-24 h-24 flex-shrink-0">
                          <DynamicImage
                            src={quotation.productImages[0]}
                            alt={quotation.productName}
                            width="w-full"
                            height="h-full"
                            objectFit="cover"
                            rounded="lg"
                            className="border border-gray-200"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{quotation.productName}</h4>
                        {quotation.productImages && quotation.productImages.length > 1 && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            <Package className="w-3 h-3" />
                            +{quotation.productImages.length - 1} more images
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buyer Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="p-1.5 bg-cb-red/10 rounded-lg mr-2">
                        <User className="w-4 h-4 text-cb-red" />
                      </div>
                      {language.detailModal.buyerInfo}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {quotation.buyerProfilePic || quotation?.buyerAvatar ? (
                          <DynamicImage
                            src={quotation.buyerProfilePic as string ?? quotation?.buyerAvatar}
                            alt={quotation.buyerName}
                            width="w-12"
                            height="h-12"
                            objectFit="cover"
                            rounded="full"
                            className="border border-gray-200 "
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {quotation?.buyerName?.charAt(0) || "B"}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <CheckCircle className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{quotation.buyerName}</p>
                        <p className="text-sm text-gray-600">Verified Buyer</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{getStateNameFromCode(quotation.state)}, {quotation.pinCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Quotation Details */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="p-1.5 bg-cb-red/10 rounded-lg mr-2">
                        <FileText className="w-4 h-4 text-cb-red" />
                      </div>
                      {language.detailModal.quotationInfo}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600">{language.detailModal.quantity}:</span>
                        <span className="font-semibold text-gray-900">{quotation.quantity} {language.quotationCard.pieces}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600">{language.detailModal.priceRange}:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(quotation.minPrice)} - {formatCurrency(quotation.maxPrice)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600">{language.detailModal.deadline}:</span>
                        <span className="font-semibold text-gray-900">{formatDate(quotation.deadline)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600">{language.detailModal.location}:</span>
                        <span className="font-semibold text-gray-900">{getStateNameFromCode(quotation.state)}, {quotation.pinCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">{language.detailModal.description}</h4>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {quotation.description || language.detailModal.noDescription}
                      </p>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">{language.detailModal.attributes}</h4>
                    {quotation.attributes && quotation.attributes.length > 0 ? (
                      <div className="space-y-2">
                        {quotation.attributes.map((attr, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                            <span className="text-gray-600 text-sm">{attr.field}:</span>
                            <span className="font-semibold text-gray-900 text-sm">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-600 text-sm text-center">
                          {language.detailModal.noAttributes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              {(quotation.chatPhase || quotation.hasActiveInvoice || quotation.hasOrder) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="p-1.5 bg-blue-600/10 rounded-lg mr-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                    </div>
                    Business Status
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quotation.chatPhase && (
                      <div className="text-center bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">{language.detailModal.chatPhase}</p>
                        <p className="font-semibold text-gray-900">{quotation.chatPhase}</p>
                      </div>
                    )}
                    
                    {quotation.hasActiveInvoice && quotation.activeInvoice && (
                      <div className="text-center bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">{language.detailModal.invoiceInfo}</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(quotation.activeInvoice.amount)}</p>
                        <p className="text-xs text-gray-600">{quotation.activeInvoice.status}</p>
                      </div>
                    )}
                    
                    {quotation.hasOrder && quotation.order && (
                      <div className="text-center bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">{language.detailModal.orderInfo}</p>
                        <p className="font-semibold text-gray-900">{quotation.order.orderId}</p>
                        <p className="text-xs text-gray-600">{quotation.order.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">{language.errorLoading}</p>
            </div>
          )}

          {/* Footer */}
          {quotation && (
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
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
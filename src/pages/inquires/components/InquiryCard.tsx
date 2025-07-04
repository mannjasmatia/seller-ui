import React from 'react';
import { MapPin, Calendar, Package, DollarSign, Clock, User } from 'lucide-react';
import { Quotation } from '../types.quotation';
import Button from '../../../components/BasicComponents/Button';
import DynamicImage from '../../../components/BasicComponents/Image';

interface QuotationCardProps {
  quotation: Quotation;
  onViewDetails: (quotationId: string) => void;
  onAccept: (quotationId: string) => void;
  onReject: (quotationId: string) => void;
  onNegotiate: (quotationId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getTimeAgo: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  language: any;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isNegotiating?: boolean;
}

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

export const InquiryCard: React.FC<QuotationCardProps> = ({
  quotation,
  onViewDetails,
  onAccept,
  onReject,
  onNegotiate,
  formatCurrency,
  formatDate,
  getTimeAgo,
  getStatusColor,
  language,
  isAccepting = false,
  isRejecting = false,
  isNegotiating = false
}) => {
  const renderActionButtons = () => {
    if (quotation.status === 'pending') {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onReject(quotation._id);
            }}
            isLoading={isRejecting}
            disabled={isAccepting || isNegotiating}
            className="flex-1"
            theme={['red-500', 'white']}
          >
            {language.actions.reject}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNegotiate(quotation._id);
            }}
            isLoading={isNegotiating}
            disabled={isAccepting || isRejecting}
            className="flex-1"
            theme={['blue-500', 'white']}
          >
            {language.actions.negotiate}
          </Button>
          <Button
            variant="solid"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAccept(quotation._id);
            }}
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
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to chat - implement this
          }}
          className="w-full"
          theme={['cb-red', 'white']}
        >
          {language.actions.viewChat}
        </Button>
      );
    } else if (quotation.hasOrder && quotation.orderId) {
      return (
        <Button
          variant="solid"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to order - implement this
          }}
          className="w-full"
          theme={['cb-red', 'white']}
        >
          {language.actions.viewOrder}
        </Button>
      );
    }

    return (
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
      </div>
    );
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer
        ${!quotation.seen ? 'border-l-4 border-l-cb-red bg-red-50/30' : ''}
      `}
      onClick={() => onViewDetails(quotation._id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Buyer Avatar */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
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

          {/* Buyer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {quotation.buyerName}
              </h3>
              {!quotation.seen && (
                <span className="px-2 py-1 bg-cb-red text-white text-xs rounded-full flex-shrink-0">
                  {language.quotationCard.newRequest}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {quotation.productName}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {getTimeAgo(quotation.createdAt)}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex items-center gap-3 mb-3">
        {quotation.productImage && (
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <DynamicImage
              src={`${MEDIA_URL}/${quotation.productImage}`}
              alt={quotation.productName}
              width="w-full"
              height="h-full"
              objectFit="cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{language.quotationCard.quantity}</span>
              <span className="font-medium">{quotation.quantity}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{language.quotationCard.priceRange}:</span>
            </div>
          </div>
          
          <div className="mt-1 text-sm">
            <span className="font-medium text-gray-900">
              {formatCurrency(quotation.minPrice)} - {formatCurrency(quotation.maxPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{language.quotationCard.deadline}:</span>
          <span className="font-medium">{formatDate(quotation.deadline)}</span>
        </div>
        
        {/* <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{language.quotationCard.location}:</span>
          <span className="font-medium truncate">
            {quotation?.state || 'N/A'}
          </span>
        </div> */}
      </div>

      {/* Business Status */}
      {quotation.businessStatus && quotation.businessStatus !== quotation.status && (
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Business Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.businessStatus)}`}>
              {quotation.businessStatus}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(quotation._id);
          }}
          theme={['cb-red', 'white']}
        >
          {language.actions.viewDetails}
        </Button>
        
        <div className="flex-1 ml-3">
          {renderActionButtons()}
        </div>
      </div>

      {/* Additional Info for Business Logic */}
      {(quotation.hasActiveInvoice || quotation.hasOrder) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {quotation.hasActiveInvoice && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>Invoice: {formatCurrency(quotation.invoiceAmount || 0)}</span>
              </div>
            )}
            {quotation.hasOrder && quotation.orderId && (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>Order: {quotation.orderId}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryCard;
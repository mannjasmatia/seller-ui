import React from 'react';
import { MapPin, Calendar, Package, DollarSign, Clock, User, Eye, MessageCircle } from 'lucide-react';
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
        <div className="flex gap-1.5">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onReject(quotation._id);
            }}
            isLoading={isRejecting}
            disabled={isAccepting || isNegotiating}
            className="px-3 py-1.5 text-sm border-red-200 text-red-600 hover:bg-red-50"
          >
            Reject
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNegotiate(quotation._id);
            }}
            isLoading={isNegotiating}
            disabled={isAccepting || isRejecting}
            className="px-3 py-1 text-sm border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            Negotiate
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
            className="px-4 py-1 text-sm bg-cb-red hover:bg-cb-red/90 text-white"
          >
            Accept
          </Button>
        </div>
      );
    } else if (quotation.status === 'negotiation' && quotation.chatId) {
      return (<></>
        // <Button
        //   variant="outline"
        //   size="sm"
        //   onClick={(e) => {
        //     e.stopPropagation();
        //     // Navigate to chat - implement this
        //   }}
        //   className="px-3 py-2 text-sm border-cb-red text-cb-red hover:bg-cb-red/5 flex items-center gap-1"
        // >
        //   <MessageCircle className="w-4 h-4" />
        //   Chat
        // </Button>
      );
    } else if (quotation.hasOrder && quotation.orderId) {
      return (<></>
        // <Button
        //   variant="outline"
        //   size="sm"
        //   onClick={(e) => {
        //     e.stopPropagation();
        //     // Navigate to order - implement this
        //   }}
        //   className="px-3 py-2 text-sm border-cb-red text-cb-red hover:bg-cb-red/5 flex items-center gap-1"
        // >
        //   <Package className="w-4 h-4" />
        //   Order
        // </Button>
      );
    }

    return (
      <div className={`px-1.5 py-0.5 rounded text-sm font-medium ${getStatusColor(quotation.status)}`}>
        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
      </div>
    );
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group
        ${!quotation.seen ? 'border-l-4 border-l-cb-red bg-gradient-to-r from-red-50/50 to-transparent' : ''}
      `}
      onClick={() => onViewDetails(quotation._id)}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Buyer Avatar */}
          <div className="relative w-10 h-10 flex-shrink-0">
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                {quotation?.buyerName?.charAt(0) || "B"}
              </div>
            )}
            {!quotation.seen && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cb-red rounded-full border border-white"></div>
            )}
          </div>

          {/* Buyer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 text-base truncate">
                {quotation.buyerName}
              </h3>
              {!quotation.seen && (
                <span className="px-1.5 py-0.5 bg-cb-red text-white text-xs rounded font-medium">
                  NEW
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {quotation.productName}
            </p>
          </div>
        </div>

        {/* Time & Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-3 h-3" />
            {getTimeAgo(quotation.createdAt)}
          </div>
          <div className={`px-1.5 py-0.5 rounded text-sm font-medium ${getStatusColor(quotation.status)}`}>
            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="flex gap-2.5 mb-2">
        {/* Product Image */}
        {quotation.productImage && (
          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
            <DynamicImage
              src={`${MEDIA_URL}/${quotation.productImage}`}
              alt={quotation.productName}
              width="w-full"
              height="h-full"
              objectFit="cover"
            />
          </div>
        )}
        
        {/* Product Details - Single Line */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Qty:</span>
              <span className="font-medium text-gray-900">{quotation.quantity}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Due:</span>
              <span className="font-medium text-gray-700">{formatDate(quotation.deadline)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Range:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(quotation.minPrice)} - {formatCurrency(quotation.maxPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Status */}
      {quotation.businessStatus && quotation.businessStatus !== quotation.status && (
        <div className="mb-2 inline-block">
          <div className="inline-flex items-center gap-2 p-1.5 bg-gray-50 rounded text-sm">
            <span className="text-gray-500 font-medium">Business:</span>
            <span className={`px-1.5 py-0.5 rounded text-sm font-medium ${getStatusColor(quotation.businessStatus)}`}>
              {quotation.businessStatus}
            </span>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {(quotation.hasActiveInvoice || quotation.hasOrder) && (
        <div className="mb-2 inline-block">
          <div className="inline-flex items-center gap-3 p-1.5 bg-blue-50/50 rounded border border-blue-100 text-sm">
            {quotation.hasActiveInvoice && (
              <div className="flex items-center gap-1 text-blue-700">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">Invoice: {formatCurrency(quotation.invoiceAmount || 0)}</span>
              </div>
            )}
            {quotation.hasOrder && quotation.orderId && (
              <div className="flex items-center gap-1 text-blue-700">
                <Package className="w-3 h-3" />
                <span className="font-medium">Order: {quotation.orderId}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(quotation._id);
          }}
          className="px-3 py-1 text-sm text-cb-red hover:bg-cb-red/5 flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          Details
        </Button>
        
        <div className="flex items-center gap-1.5">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default InquiryCard;
import React from 'react';
import { Circle, CheckCheck, Check, X, RefreshCw, AlertTriangle, Package, DollarSign, FileText } from 'lucide-react';
import { ChatMessage } from '../type.inbox';
import DynamicImage from '../../../components/BasicComponents/Image';
import { Link, useParams } from 'react-router-dom';

interface MessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  formatTime: (dateString: string) => string;
  onRetry?: (timestamp: number) => void;
  onImageView?: (images: any[], index: number) => void;
  language: any;
}

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

export const Message: React.FC<MessageProps> = ({
  message,
  isOwnMessage,
  formatTime,
  onRetry,
  onImageView,
  language
}) => {
    const {lang} = useParams();
  const getMessageStatusIcon = () => {
    if (!isOwnMessage) return null;

    if(message.seen){
        return <CheckCheck className="w-3 h-3 text-gray-400" />
    }

    switch (message.status) {
      case 'sending':
        return <Circle className="w-3 h-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'failed':
        return (
          <button 
            onClick={() => onRetry?.(message.timestamp || 0)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Click to retry"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        );
      default:
        return null;
    }
  };

  const renderBusinessMessage = () => {
    if (!message.businessContext?.isBusinessAction) return null;

    const { actionType, actionData } = message.businessContext;
    
    const getActionIcon = () => {
      switch (actionType) {
        case 'quotation_created':
          return <Package className="w-4 h-4 text-blue-600" />;
        case 'quotation_accepted':
          return <Check className="w-4 h-4 text-green-600" />;
        case 'quotation_rejected':
          return <X className="w-4 h-4 text-red-600" />;
        case 'invoice_sent':
          return <FileText className="w-4 h-4 text-purple-600" />;
        case 'invoice_accepted':
          return <DollarSign className="w-4 h-4 text-green-600" />;
        case 'invoice_rejected':
          return <AlertTriangle className="w-4 h-4 text-red-600" />;
        case 'order_created':
          return <Package className="w-4 h-4 text-blue-600" />;
        case 'order_updated':
          return <RefreshCw className="w-4 h-4 text-blue-600" />;
        case 'order_cancelled':
          return <X className="w-4 h-4 text-red-600" />;
        default:
          return <FileText className="w-4 h-4 text-gray-600" />;
      }
    };

    const getActionColor = () => {
      switch (actionType) {
        case 'quotation_created':
        case 'order_created':
        case 'order_updated':
          return 'bg-blue-50 border-blue-200 text-blue-800';
        case 'quotation_accepted':
        case 'invoice_accepted':
          return 'bg-green-50 border-green-200 text-green-800';
        case 'quotation_rejected':
        case 'invoice_rejected':
        case 'order_cancelled':
          return 'bg-red-50 border-red-200 text-red-800';
        case 'invoice_sent':
          return 'bg-purple-50 border-purple-200 text-purple-800';
        default:
          return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    };
    
    return (
      <div className={`rounded-lg p-3 my-2 border ${getActionColor()}`}>
        <div className="flex items-center gap-2">
          {getActionIcon()}
          <span className="text-sm font-medium">
            {actionData?.title || language?.businessActions?.[actionType as string] || 'Business Action'}
          </span>
        </div>
        {actionData?.description && (
          <p className="text-sm mt-1 mb-3">
            {actionData.description}
          </p>
        )}
        {message.messageType==='link' && message.media && message.media.length>0 && (
            <Link to={`/${lang}/invoice/${message.media[0].url}`} target='_blank' 
            className='text-xs outline py-0.5 px-3 rounded-full hover:scale-95 font-medium'
            >
                View Invoice
            </Link>
        )}
      </div>
    );
  };

  const renderSystemMessage = () => {
    if (!message.businessContext?.isSystemMessage) return null;

    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-sm max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  };

  const renderQuotationMessage = () => {
    if (message.messageType !== 'quotation_created') return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Quotation Request</span>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>Quantity: {message.quotationId?.quantity || 'N/A'}</p>
          <p>Deadline: {message.quotationId?.deadline ? formatTime(message.quotationId.deadline) : 'N/A'}</p>
          {message.quotationId?.minPrice && message.quotationId?.maxPrice && (
            <p>Budget: ${message.quotationId.minPrice} - ${message.quotationId.maxPrice}</p>
          )}
        </div>
      </div>
    );
  };

  const renderImages = () => {
    if (!message.media || message.messageType!=='image' || message.media.length === 0) return null;

    const imageCount = message.media.length;
    const maxDisplay = 4;
    const gridCols = imageCount === 1 ? 'grid-cols-1' : 
                     imageCount === 2 ? 'grid-cols-2' : 
                     'grid-cols-2';

    return (
      <div className="mb-0.5">
        <div className={`grid gap-1 ${gridCols}`}>
          {message.media.slice(0, maxDisplay).map((media, index) => (
            <div key={index} className="relative group">
              <DynamicImage
                src={`${MEDIA_URL}/${media.url}`}
                alt={media.name || `Image ${index + 1}`}
                width="w-full"
                height={imageCount === 1 ? "h-48" : "h-32"}
                objectFit="cover"
                rounded="md"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onImageView?.(message.media!, index)}
              />
              
              {/* Show count overlay for extra images */}
              {imageCount > maxDisplay && index === maxDisplay - 1 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                  <span className="text-white font-semibold text-lg">
                    +{imageCount - maxDisplay}
                  </span>
                </div>
              )}
              
              {/* Image info on hover */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                {media.name || `Image ${index + 1}`}
                {media.size && (
                  <span className="block">
                    {(media.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Image metadata */}
        {imageCount > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            {imageCount} images • Click to view full size
          </p>
        )}
      </div>
    );
  };

  // Render system messages differently
  if (message.businessContext?.isSystemMessage) {
    return renderSystemMessage();
  }

  const getMessageBgColor = () => {
    if (message.status === 'failed') {
      return isOwnMessage ? 'bg-red-500 text-white' : 'bg-red-100 text-red-900';
    }
    return isOwnMessage ? 'bg-cb-red text-white' : 'bg-gray-200 text-gray-900';
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-xs lg:max-w-md">
        {/* Business Action Message */}
        {message.businessContext?.isBusinessAction && renderBusinessMessage()}
        
        {/* Quotation Message */}
        {renderQuotationMessage()}

        {/* Regular Message Bubble */}
        {!message.businessContext?.isBusinessAction && !message?.businessContext?.isSystemMessage && (message.content || message.media?.length) && (
          <div className={`rounded-lg overflow-hidden ${getMessageBgColor()}`}>
            {/* Images */}
            {message.media && message.media.length > 0 && (
              <div className="p-2">
                {renderImages()}
              </div>
            )}

            {/* Text Content */}
            { message.content && (
              <div className={message.media && message.media.length > 0 ? 'px-3 pb-2' : 'p-3'}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            )}

            {/* Message Footer */}
            <div className={`px-3 pb-2 flex items-center justify-between ${
              isOwnMessage ? 'text-white/80' : 'text-gray-500'
            }`}>
              <span className="text-xs">
                {formatTime(message.createdAt)}
              </span>
              <div className="flex items-center space-x-1">
                {/* {message.seen && isOwnMessage && (
                  <Check className="w-3 h-3" />
                )} */}
                
                {getMessageStatusIcon()}
                
              </div>
            </div>
            
            {/* Failed message indicator */}
            {/* {message.status === 'failed' && (
              <div className="px-3 pb-2">
                <div className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="w-3 h-3 text-red-300" />
                  <span>Failed to send • Tap to retry</span>
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
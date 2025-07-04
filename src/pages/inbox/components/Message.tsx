import React from 'react';
import { Circle, CheckCheck, Check, X, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../type.inbox';
import DynamicImage from '../../../components/BasicComponents/Image';

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
  const getMessageStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.status) {
      case 'sending':
        return <Circle className="w-3 h-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'failed':
        return (
          <button 
            onClick={() => onRetry?.(message.timestamp || 0)}
            className="text-red-500 hover:text-red-700"
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
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-800">
            {actionData?.title || language.businessActions[actionType as string] || 'Business Action'}
          </span>
        </div>
        {actionData?.description && (
          <p className="text-sm text-blue-700 mt-1">
            {actionData.description}
          </p>
        )}
      </div>
    );
  };

  const renderSystemMessage = () => {
    if (!message.businessContext?.isSystemMessage) return null;

    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  };

  const renderImages = () => {
    if (!message.media || message.media.length === 0) return null;

    return (
      <div className="mb-2">
        <div className={`grid gap-1 ${
          message.media.length === 1 ? 'grid-cols-1' : 
          message.media.length === 2 ? 'grid-cols-2' : 
          'grid-cols-2'
        }`}>
          {message.media.slice(0, 4).map((media, index) => (
            <div key={index} className="relative">
              <DynamicImage
                src={`${MEDIA_URL}/${media.url}`}
                alt={media.name || `Image ${index + 1}`}
                width="w-full"
                height="h-32"
                objectFit="cover"
                rounded="md"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onImageView?.(message.media!, index)}
              />
              {/* Show count overlay for extra images */}
              {message.media!.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                  <span className="text-white font-semibold">
                    +{message.media!.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render system messages differently
  if (message.businessContext?.isSystemMessage) {
    return renderSystemMessage();
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md rounded-lg overflow-hidden ${
          isOwnMessage 
            ? 'bg-cb-red text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        {/* Business Action Message */}
        {message.businessContext?.isBusinessAction && renderBusinessMessage()}

        {/* Images */}
        {message.media && message.media.length > 0 && (
          <div className="p-2">
            {renderImages()}
          </div>
        )}

        {/* Text Content */}
        {message.content && (
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
            {message.seen && isOwnMessage && (
              <Check className="w-3 h-3" />
            )}
            {getMessageStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
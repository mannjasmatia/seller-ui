import React from 'react';
import { User, Clock, Package, DollarSign, MessageCircle } from 'lucide-react';
import { Chat } from '../type.inbox';
import DynamicImage from '../../../components/BasicComponents/Image';

interface ChatCardProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: (chat: Chat) => void;
  formatTime: (dateString: string) => string;
  getTimeAgo: (dateString: string) => string;
  language: any;
  typingStatus?: string | boolean;
}

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

export const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  isSelected,
  onSelect,
  formatTime,
  getTimeAgo,
  language,
  typingStatus
}) => {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'negotiation':
        return 'bg-blue-100 text-blue-800';
      case 'invoice_sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'invoice_accepted':
        return 'bg-green-100 text-green-800';
      case 'invoice_rejected':
        return 'bg-red-100 text-red-800';
      case 'order_created':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLastMessagePreview = () => {
    if (typingStatus) {
      return (
        <span className="text-cb-red italic">
          {typeof typingStatus === 'string' ? typingStatus : language.chatList.typing}
        </span>
      );
    }

    if (!chat.lastMessage) {
      return <span className="text-gray-500">{language.chatList.noMessages}</span>;
    }

    const message = chat.lastMessage;
    
    if (message.messageType === 'image' && message.media?.length) {
      return (
        <span className="flex items-center gap-1 text-gray-600">
          <Package className="w-3 h-3" />
          📷 {message.media.length} image{message.media.length > 1 ? 's' : ''}
        </span>
      );
    }

    return (
      <span className="text-gray-600 truncate">
        {message.content || 'No message content'}
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(chat)}
      className={`
        p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
        ${isSelected ? 'bg-cb-red/5 border-l-4 border-l-cb-red' : ''}
        ${chat.hasUnread ? 'bg-red-50/30' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Buyer Avatar */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            {chat.otherUser.profilePic ? (
              <DynamicImage
                src={`${MEDIA_URL}/${chat.otherUser.profilePic}`}
                alt={chat.otherUser.name}
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
              <h3 className={`font-medium truncate ${
                chat.hasUnread ? 'text-cb-red font-semibold' : 'text-gray-900'
              }`}>
                {chat.otherUser.name}
              </h3>
              {chat.hasUnread && (
                <span className="w-2 h-2 bg-cb-red rounded-full flex-shrink-0"></span>
              )}
            </div>
            
            {/* Product Info */}
            {chat.product && (
              <p className="text-sm text-gray-600 truncate">
                {chat.product.name}
              </p>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500">
            {chat.lastMessage ? getTimeAgo(chat.lastMessage.createdAt) : ''}
          </span>
          
          {/* Phase Badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(chat.phase)}`}>
            {chat.phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Last Message */}
      <div className="mb-2">
        {getLastMessagePreview()}
      </div>

      {/* Business Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {/* Quotation Info */}
          {chat.quotation && (
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span>Qty: {chat.quotation.quantity}</span>
            </div>
          )}

          {/* Price Range */}
          {chat.quotation?.priceRange && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>
                ${chat.quotation.priceRange.min} - ${chat.quotation.priceRange.max}
              </span>
            </div>
          )}
        </div>

        {/* Message Count or Status */}
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          <span>{chat.status}</span>
        </div>
      </div>

      {/* Invoice/Order Info */}
      {(chat.activeInvoice || chat.order) && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            {chat.activeInvoice && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Invoice:</span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  chat.activeInvoice.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  chat.activeInvoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {chat.activeInvoice.status}
                </span>
              </div>
            )}
            
            {chat.order && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Order:</span>
                <span className="font-medium text-gray-700">
                  {chat.order.orderId}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatCard;
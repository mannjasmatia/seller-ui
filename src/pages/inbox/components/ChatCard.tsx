import React from 'react';
import { User, Clock, Package, DollarSign, MessageCircle, Dot } from 'lucide-react';
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
        <div className="flex items-center gap-1">
          <div className="flex space-x-1">
            <Dot className="w-1 h-1 text-cb-red animate-bounce" />
            <Dot className="w-1 h-1 text-cb-red animate-bounce delay-100" />
            <Dot className="w-1 h-1 text-cb-red animate-bounce delay-200" />
          </div>
          <span className="text-cb-red italic text-xs">
            {typeof typingStatus === 'string' ? typingStatus : language?.chatList?.typing || 'Customer is typing...'}
          </span>
        </div>
      );
    }

    if (!chat.lastMessage) {
      return <span className="text-gray-500 text-xs">No messages yet</span>;
    }

    const message = chat.lastMessage;
    
    if (message.messageType === 'image' && message.media?.length) {
      return (
        <span className="flex items-center gap-1 text-gray-600 text-xs">
          <Package className="w-3 h-3" />
          📷 {message.media.length} image{message.media.length > 1 ? 's' : ''}
        </span>
      );
    }

    if (message.messageType === 'quotation_created') {
      return (
        <span className="flex items-center gap-1 text-blue-600 text-xs">
          <Package className="w-3 h-3" />
          Quotation request created
        </span>
      );
    }

    if (message.messageType === 'quotation_accepted') {
      return (
        <span className="flex items-center gap-1 text-green-600 text-xs">
          <Package className="w-3 h-3" />
          Quotation accepted
        </span>
      );
    }

    if (message.messageType === 'quotation_rejected') {
      return (
        <span className="flex items-center gap-1 text-red-600 text-xs">
          <Package className="w-3 h-3" />
          Quotation rejected
        </span>
      );
    }

    return (
      <p className="text-gray-600 text-xs truncate max-w-full">
        {message.content || 'No message content'}
      </p>
    );
  };

  const getStatusIndicator = () => {
    if (chat.hasUnread) {
      return (
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-cb-red rounded-full animate-pulse"></span>
          <span className="text-xs text-cb-red font-medium">New</span>
        </div>
      );
    }

    if (typingStatus) {
      return (
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-green-600 font-medium">Active</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      onClick={() => onSelect(chat)}
      className={`
        relative px-3 py-2.5 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50
        ${isSelected ? 'bg-cb-red/5 border-l-4 border-l-cb-red shadow-sm' : ''}
        ${chat.hasUnread ? 'bg-red-50/30 hover:bg-red-50/50' : ''}
        ${typingStatus ? 'bg-green-50/30 hover:bg-green-50/50' : ''}
      `}
    >
      {/* Unread indicator bar */}
      {chat.hasUnread && !isSelected && (
        <div className="absolute left-0 top-0 w-1 h-full bg-cb-red"></div>
      )}

      <div className="flex items-center gap-3">
        {/* User Avatar - Left most */}
        <div className="relative w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
              {chat.otherUser?.name?.charAt(0) || "B"}
            </div>
            // <User className="w-5 h-5 text-gray-500" />
          )}
          
          {/* Online/Typing indicator */}
          {typingStatus && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            </div>
          )}
          
          {chat.hasUnread && !typingStatus && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cb-red rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex items-center justify-between">
          {/* Left side - User name and message */}
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`font-medium text-md  ${
                chat.hasUnread ? 'text-cb-red font-semibold' : 'text-gray-900'
              }`}>
                {chat.otherUser.name}
              </h3>
              {getStatusIndicator()}
            </div>
            
            {/* Last Message - with proper truncation */}
            <div className="w-full overflow-hidden">
              {getLastMessagePreview()}
            </div>
          </div>

          {/* Right side - Time, Phase, and Business Info */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {/* <div className="flex items-center gap-2"> */}
              {/* Phase Badge */}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPhaseColor(chat.phase)}`}>
                {chat.phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>

              <span className="text-xs text-gray-500">
                {chat.lastMessage ? getTimeAgo(chat.lastMessage.createdAt) : ''}
              </span>
              
            {/* </div> */}

            {/* Business Info Row */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {/* Quotation Info */}
              {/* {chat.quotation && (
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>{chat.quotation.quantity}</span>
                </div>
              )} */}

              {/* Price Range */}
              {/* {chat.quotation?.priceRange && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>${chat.quotation.priceRange.min}-${chat.quotation.priceRange.max}</span>
                </div>
              )} */}

              {/* Status */}
              {/* <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span className="capitalize">{chat.status}</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice/Order Info - Compact */}
      {/* {(chat.activeInvoice || chat.order) && (
        <div className="mt-2 pt-1.5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            {chat.activeInvoice && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Invoice:</span>
                <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                  chat.activeInvoice.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  chat.activeInvoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {chat.activeInvoice.status}
                </span>
                {chat.activeInvoice.amount && (
                  <span className="text-gray-700 font-medium">
                    ${chat.activeInvoice.amount}
                  </span>
                )}
              </div>
            )}
            
            {chat.order && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Order:</span>
                <span className="font-medium text-gray-700">
                  {chat.order.orderId}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  chat.order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  chat.order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {chat.order.status}
                </span>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Hover effect overlay */}
      <div className="absolute inset-0 border-2 border-transparent hover:border-cb-red/20 rounded-lg pointer-events-none transition-all duration-200"></div>
    </div>
  );
};

export default ChatCard;
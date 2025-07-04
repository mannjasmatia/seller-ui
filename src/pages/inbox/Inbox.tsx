import React from 'react';
import { 
  MessageCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Users, 
  FileText, 
  Receipt, 
  AlertCircle,
  Eye,
  DollarSign
} from 'lucide-react';
import Button from '../../components/BasicComponents/Button';
import { useNavigate } from 'react-router-dom';
import ChatCard from './components/ChatCard';
import Message from './components/Message';
import MessageInput from './components/MessageInput';
import InvoiceModal from './components/InvoiceModal';
import QuotationDetailModal from '../inquires/components/QuotationDetailModal';
import { useInboxChat } from './useInbox';

const Inbox: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    // Data
    chats,
    selectedChat,
    messages,
    newMessage,
    selectedImages,
    typingUsers,
    chatContext,
    
    // State
    isTyping,
    uploadError,
    isInvoiceModalOpen,
    quotationDetailModalOpen,
    
    // Loading states
    isLoadingChats,
    isLoadingMessages,
    isUploading,
    isGeneratingInvoice,
    
    // Error states
    isChatsError,
    
    // Connection
    connectionStatus,
    
    // Refs
    messagesEndRef,
    fileInputRef,
    
    // Handlers
    selectChat,
    handleTyping,
    sendMessage,
    handleFileSelect,
    removeImage,
    clearImages,
    handleGenerateInvoice,
    openInvoiceModal,
    closeInvoiceModal,
    openQuotationDetail,
    closeQuotationDetail,
    refetchChats,
    setUploadError,
    
    // Utilities
    formatTime,
    getTimeAgo,
    canGenerateInvoice,
    getInvoiceStatus,
    
    // Language
    language
  } = useInboxChat();

  const getConnectionIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const renderChatHeader = () => {
    if (!selectedChat) return null;

    const invoiceInfo = getInvoiceStatus();

    return (
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedChat.otherUser.name}
              </h3>
              <p className="text-sm text-gray-500">
                {language.chatHeader.buyer}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quotation Details Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openQuotationDetail}
              leftIcon={<Eye className="w-4 h-4" />}
              theme={['cb-red', 'white']}
            >
              {language.chatHeader.quotationDetails}
            </Button>

            {/* Invoice Actions */}
            {canGenerateInvoice() ? (
              <Button
                variant="solid"
                size="sm"
                onClick={openInvoiceModal}
                leftIcon={<Receipt className="w-4 h-4" />}
                theme={['cb-red', 'white']}
              >
                {language.chatHeader.generateInvoice}
              </Button>
            ) : invoiceInfo.hasInvoice ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* View invoice logic */}}
                  leftIcon={<FileText className="w-4 h-4" />}
                  theme={['cb-red', 'white']}
                >
                  {language.chatHeader.viewInvoice}
                </Button>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoiceInfo.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  invoiceInfo.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoiceInfo.status}
                </span>
              </div>
            ) : null}

            {/* Connection Status */}
            <div className="flex items-center gap-1">
              {getConnectionIcon()}
              <span className="text-xs text-gray-500 capitalize">
                {connectionStatus.status}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Context Info */}
        {chatContext && (
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>Phase:</span>
              <span className="font-medium">{chatContext.phase}</span>
            </div>
            {chatContext.hasActiveInvoice && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>Invoice: {chatContext.invoiceStatus}</span>
              </div>
            )}
            {chatContext.hasOrder && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Order Active</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language.empty.selectChat}
        </h3>
        <p className="text-gray-500">
          {language.empty.selectChatDescription}
        </p>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-8">
      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
      <p className="text-gray-500">{language.loadingMessages}</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-8">
      <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {language.errorLoading}
      </h3>
      <Button
        variant="outline"
        size="md"
        onClick={() => refetchChats()}
        theme={['cb-red', 'white']}
      >
        {language.retry}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language.title}
              </h1>
              <p className="text-gray-600">
                {language.subtitle}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inbox')}
              theme={['cb-red', 'white']}
            >
              Back to Inbox
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Chat List Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Chat List Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {language.chatList.activeConversations}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchChats()}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  disabled={isLoadingChats}
                  theme={['cb-red', 'white']}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingChats ? (
                <div className="p-4 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  {language.loadingChats}
                </div>
              ) : isChatsError ? (
                renderErrorState()
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>{language.noChats}</p>
                  <p className="text-sm">{language.noChatsDescription}</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <ChatCard
                    key={chat._id}
                    chat={chat}
                    isSelected={selectedChat?._id === chat._id}
                    onSelect={selectChat}
                    formatTime={formatTime}
                    getTimeAgo={getTimeAgo}
                    language={language}
                    typingStatus={false} // Add typing status logic here
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                {renderChatHeader()}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {isLoadingMessages ? (
                    renderLoadingState()
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {language.empty.noMessages}
                      </h3>
                      <p className="text-gray-500">
                        {language.empty.noMessagesDescription}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <Message
                          key={message._id}
                          message={message}
                          isOwnMessage={message.senderModel === 'seller'}
                          formatTime={formatTime}
                          onRetry={(timestamp) => {
                            // Implement retry logic
                            console.log('Retry message:', timestamp);
                          }}
                          onImageView={(images, index) => {
                            // Implement image view logic
                            console.log('View image:', images, index);
                          }}
                          language={language}
                        />
                      ))}

                      {/* Typing Indicator */}
                      {typingUsers.size > 0 && (
                        <div className="flex justify-start mb-4">
                          <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">Buyer is typing</span>
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <MessageInput
                  newMessage={newMessage}
                  onMessageChange={handleTyping}
                  onSendMessage={sendMessage}
                  isConnected={connectionStatus.isConnected}
                  disabled={isUploading}
                  selectedImages={selectedImages}
                  isUploading={isUploading}
                  uploadError={uploadError}
                  onFileSelect={handleFileSelect}
                  onRemoveImage={removeImage}
                  onClearError={() => setUploadError(null)}
                  fileInputRef={fileInputRef}
                  isTyping={isTyping}
                  language={language}
                />
              </>
            ) : (
              renderEmptyState()
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoiceModal
        open={isInvoiceModalOpen}
        onClose={closeInvoiceModal}
        onGenerate={handleGenerateInvoice}
        isGenerating={isGeneratingInvoice}
        quotationPriceRange={selectedChat?.quotation?.priceRange}
      />

      <QuotationDetailModal
        open={quotationDetailModalOpen}
        quotation={selectedChat?.quotation as any}
        isLoading={false}
        onClose={closeQuotationDetail}
        onAccept={() => {}}
        onReject={() => {}}
        onNegotiate={() => {}}
        isAccepting={false}
        isRejecting={false}
        isNegotiating={false}
      />
    </div>
  );
};

export default Inbox;
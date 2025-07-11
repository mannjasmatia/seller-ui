import React from "react";
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
  DollarSign,
  Store,
  Circle,
  Search,
  Filter,
  X,
  Loader
} from "lucide-react";
import Button from "../../components/BasicComponents/Button";
import Input from "../../components/BasicComponents/Input";
import { useNavigate } from "react-router-dom";
import ChatCard from "./components/ChatCard";
import Message from "./components/Message";
import MessageInput from "./components/MessageInput";
import ImageModal from "./components/ImageModal";
import InvoiceModal from "./components/GenerateInvoiceModal";
import QuotationDetailModal from "../inquires/components/QuotationDetailModal";
import DynamicImage from "../../components/BasicComponents/Image";
import useInbox from "./useInbox";

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
    imageModalData,

    // State
    isTyping,
    uploadError,
    isInvoiceModalOpen,
    quotationDetailModalOpen,

    // Messages infinite scroll states
    initialLoading,
    readyToFetchMore,
    isLoadingMore,

    // Filter state
    searchQuery,
    statusFilter,

    // Loading states
    isLoadingChats,
    isLoadingMessages,
    isUploading,
    isGeneratingInvoice,
    isFetchingNextChatsPage,
    isFetchingNextMessagesPage,
    hasNextChatsPage,
    hasNextMessagesPage,

    // Error states
    isChatsError,

    // Connection
    connectionStatus,

    // Refs
    messagesEndRef,
    fileInputRef,
    chatsLoadMoreRef,
    messagesLoadMoreRef,
    messagesContainerRef,
    messagesListRef,

    // Handlers
    selectChat,
    handleTyping,
    sendMessage,
    retryMessage,
    handleFileSelect,
    removeImage,
    handleGenerateInvoice,
    openInvoiceModal,
    closeInvoiceModal,
    openQuotationDetail,
    closeQuotationDetail,
    loadChats,
    setUploadError,
    reconnect,

    // Filter handlers
    handleSearchChange,
    handleStatusFilterChange,
    clearFilters,

    // Image modal handlers
    openImageModal,
    closeImageModal,
    nextImage,
    prevImage,

    // Utilities
    formatTime,
    getTimeAgo,
    canGenerateInvoice,
    getInvoiceStatus,
    getTypingStatusForChat,

    // Language
    language,
  } = useInbox();

  const getConnectionIcon = () => {
    switch (connectionStatus.status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "connecting":
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "error":
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus.status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Disconnected";
      default:
        return "Offline";
    }
  };

  const renderChatHeader = () => {
    if (!selectedChat) return null;

    const invoiceInfo = getInvoiceStatus();

    return (
      <div className="border-b border-gray-200 bg-white px-4 py-2 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedChat.otherUser.profilePic ? (
              <DynamicImage
                src={selectedChat.otherUser.profilePic}
                alt={selectedChat.otherUser.name}
                width="w-10"
                height="h-10"
                objectFit="cover"
                rounded="full"
                className="border border-gray-200 "
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedChat.otherUser?.name?.charAt(0) || "B"}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{selectedChat.otherUser.name}</h3>
              <p className="text-sm text-gray-500">{language?.chatHeader?.buyer || "Customer"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quotation Details Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openQuotationDetail}
              leftIcon={<Eye className="w-4 h-4" />}
              theme={["cb-red", "white"]}
            >
              {language?.chatHeader?.quotationDetails || "View Quotation"}
            </Button>

            {/* Invoice Actions */}
            {canGenerateInvoice() ? (
              <Button
                variant="solid"
                size="sm"
                onClick={openInvoiceModal}
                leftIcon={<Receipt className="w-4 h-4" />}
                theme={["cb-red", "white"]}
              >
                {language?.chatHeader?.generateInvoice || "Generate Invoice"}
              </Button>
            ) : false ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    /* View invoice logic */
                  }}
                  leftIcon={<FileText className="w-4 h-4" />}
                  theme={["cb-red", "white"]}
                >
                  {language?.chatHeader?.viewInvoice || "View Invoice"}
                </Button>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoiceInfo.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : invoiceInfo.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {invoiceInfo.status}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language?.empty?.selectChat || "Select a customer chat"}
        </h3>
        <p className="text-gray-500">
          {language?.empty?.selectChatDescription ||
            "Choose a conversation from the sidebar to start messaging with customers"}
        </p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-8">
      <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {language?.errorLoading || "Error loading chats"}
      </h3>
      <Button variant="outline" size="md" onClick={() => loadChats()} theme={["cb-red", "white"]}>
        {language?.retry || "Try Again"}
      </Button>
    </div>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-1">
            <span className="text-sm">Customer is typing</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="px-1 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-1">
        {/* Search Input */}
        <div className="">
          <Input
            type="text"
            placeholder={language?.filters?.searchPlaceholder || "Search conversations..."}
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full !px-0"
            size="sm"
          />
        </div>

        {/* Status Filter */}
        <div className="w-20">
          <Input
            type="select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            leftIcon={<Filter className="w-4 h-4" />}
            options={[
              { label: language?.filters?.allStatus || "All Status", value: "all" },
              { label: language?.filters?.active || "Active", value: "active" },
              { label: language?.filters?.completed || "Completed", value: "completed" },
              { label: language?.filters?.cancelled || "Cancelled", value: "cancelled" }
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Active Filters Indicator */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <span>Active filters:</span>
          {searchQuery && (
            <span className="bg-cb-red/10 text-cb-red px-2 py-1 rounded-full text-xs">
              Search: "{searchQuery}"
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="bg-cb-red/10 text-cb-red px-2 py-1 rounded-full text-xs">
              Status: {statusFilter}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderMessagesContent = () => {
    if (messages.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language?.empty?.noMessages || "No messages yet"}
          </h3>
          <p className="text-gray-500">
            {language?.empty?.noMessagesDescription ||
              "Start the conversation with your customer!"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 sticky">
        {/* Load More Messages Trigger (at top for reverse pagination) */}
        {hasNextMessagesPage && readyToFetchMore && (
          <div ref={messagesLoadMoreRef} className="py-4 text-center">
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading more messages...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-400">Scroll up to load more</div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <Message
            key={message._id}
            message={message}
            isOwnMessage={message?.senderModel?.toLowerCase() === "seller"}
            formatTime={formatTime}
            onRetry={retryMessage}
            onImageView={openImageModal}
            language={language}
          />
        ))}

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        <div ref={messagesEndRef} />
      </div>
    );
  };

  const renderInitialLoadingOverlay = () => {
    if (!initialLoading) return null;

    return (
      <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cb-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{language?.loadingMessages || "Loading messages..."}</p>
          <p className="text-sm text-gray-500 mt-1">Please wait...</p>
        </div>
      </div>
    );
  };

  const renderLoadMoreOverlay = () => {
    if (!isLoadingMore) return null;

    return (
      <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-95 z-40 p-4 text-center border-b border-gray-200 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <Loader className="w-4 h-4 animate-spin text-cb-red" />
          <span className="text-sm text-gray-600 font-medium">Loading more messages...</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-h-[80dvh]">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Store className="w-10 h-10 text-cb-red" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{language?.title || "Seller Chat"}</h1>
                <p className="text-gray-600">
                  {language?.subtitle || "Manage customer conversations and business transactions"}
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4">
              <Button
                variant="solid"
                size="sm"
                onClick={() => loadChats()}
                leftIcon={<RefreshCw className={`w-4 h-4 ${isLoadingChats ? "animate-spin" : ""}`} />}
                disabled={isLoadingChats}
                theme={["cb-red", "white"]}
                className="hover:scale-95"
              >
                Refresh
              </Button>

              <div className="flex items-center gap-1">
                {getConnectionIcon()}
                <span className="text-sm text-gray-500">{getConnectionText()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[70dvh]">
          {/* Chat List Sidebar */}
          <div className="w-92 bg-white border-r border-gray-200 flex flex-col">
            {/* Filters */}
            {renderFilters()}

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingChats ? (
                <div className="p-4 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  {language?.loadingChats || "Loading chats..."}
                </div>
              ) : isChatsError ? (
                <div className="p-4">{renderErrorState()}</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>{language?.noChats || "No customer chats available"}</p>
                  <p className="text-sm mt-1">
                    {language?.noChatsDescription || "Customer conversations will appear here"}
                  </p>
                </div>
              ) : (
                <>
                  {chats.map((chat) => (
                    <ChatCard
                      key={chat._id}
                      chat={chat}
                      isSelected={selectedChat?._id === chat._id}
                      onSelect={selectChat}
                      formatTime={formatTime}
                      getTimeAgo={getTimeAgo}
                      language={language}
                      typingStatus={getTypingStatusForChat(chat._id)}
                    />
                  ))}
                  
                  {/* Infinite scroll trigger for chats */}
                  {hasNextChatsPage && (
                    <div ref={chatsLoadMoreRef} className="p-4 text-center">
                      {isFetchingNextChatsPage ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-500">Loading more chats...</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Scroll to load more</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="max-h-[70dvh] flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                {renderChatHeader()}

                {/* Messages Area with Overlays */}
                <div className="flex-1 relative overflow-hidden">
                  {/* Messages Container */}
                  <div 
                    ref={messagesContainerRef} 
                    className="h-full overflow-y-auto p-4 bg-gray-50"
                  >
                    <div ref={messagesListRef}>
                      {renderMessagesContent()}
                    </div>
                  </div>

                  {/* Initial Loading Overlay */}
                  {renderInitialLoadingOverlay()}

                  {/* Load More Overlay */}
                  {renderLoadMoreOverlay()}
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
      <ImageModal
        isOpen={imageModalData.isOpen}
        images={imageModalData.images}
        currentIndex={imageModalData.currentIndex}
        onClose={closeImageModal}
        onNext={nextImage}
        onPrev={prevImage}
      />

      <InvoiceModal
        open={isInvoiceModalOpen}
        onClose={closeInvoiceModal}
        onGenerate={handleGenerateInvoice}
        isGenerating={isGeneratingInvoice}
        quotationPriceRange={{min:selectedChat?.quotationDetails?.minPrice as number, max:selectedChat?.quotationDetails?.maxPrice as number, }}
      />

      <QuotationDetailModal
        open={quotationDetailModalOpen}
        quotation={selectedChat?.quotationDetails as any}
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
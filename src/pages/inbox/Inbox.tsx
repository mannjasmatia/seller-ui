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
} from "lucide-react";
import Button from "../../components/BasicComponents/Button";
import { useNavigate } from "react-router-dom";
import ChatCard from "./components/ChatCard";
import Message from "./components/Message";
import MessageInput from "./components/MessageInput";
import ImageModal from "./components/ImageModal";
import InvoiceModal from "./components/InvoiceModal";
import QuotationDetailModal from "../inquires/components/QuotationDetailModal";
import { useInboxChat } from "./useInbox";

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
  } = useInboxChat();

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
    console.log("Can generate invoice : ", canGenerateInvoice())

    return (
      <div className="border-b border-gray-200 bg-white px-4 py-2 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedChat.otherUser?.name?.charAt(0) || "B"}
            </div>
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

            //   No View invoice functionality as of now (remove false and add invoiceInfo.hasInvoice later)
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

            {/* Connection Status */}
            {/* <div className="flex items-center gap-1">
              {getConnectionIcon()}
              <span className="text-xs text-gray-500">{getConnectionText()}</span>
              {connectionStatus.status === "error" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reconnect}
                  className="ml-2"
                  theme={["gray-500", "white"]}
                >
                  Retry
                </Button>
              )}
            </div> */}
          </div>
        </div>

        {/* Chat Context Info */}
        {/* {chatContext && (
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>Phase:</span>
              <span className="font-medium capitalize">{chatContext.phase.replace("_", " ")}</span>
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
        )} */}
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

  const renderLoadingState = () => (
    <div className="text-center py-8">
      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
      <p className="text-gray-500">{language?.loadingMessages || "Loading messages..."}</p>
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
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Chat List Header */}
            <div className="p-2 px-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="flex gap-2 items-center justify-center font-semibold text-gray-900">
                  {language?.chatList?.activeConversations || "Active Conversations"}
                  <div className="h-3 w-3 bg-green-400 animate-pulse rounded-full "></div>
                </h2>
              </div>

              {/* Connection status in sidebar */}
              {connectionStatus.status !== "connected" && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {getConnectionIcon()}
                  <span
                    className={`${connectionStatus.status === "error" ? "text-red-600" : "text-yellow-600"}`}
                  >
                    {getConnectionText()}
                  </span>
                  {connectionStatus.status === "error" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={reconnect}
                      className="ml-auto"
                      theme={["cb-red", "white"]}
                    >
                      Reconnect
                    </Button>
                  )}
                </div>
              )}

              {/* Chat count */}
              <p className="text-sm text-gray-500 mt-1">{chats.length} active conversations</p>
            </div>

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
                chats.map((chat) => (
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
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="max-h-[70dvh] flex-1 flex flex-col ">
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
                        {language?.empty?.noMessages || "No messages yet"}
                      </h3>
                      <p className="text-gray-500">
                        {language?.empty?.noMessagesDescription ||
                          "Start the conversation with your customer!"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <Message
                          key={message._id}
                          message={message}
                          isOwnMessage={message.senderModel.toLowerCase() === "seller"}
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

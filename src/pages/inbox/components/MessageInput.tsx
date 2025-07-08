import React from 'react';
import { Send, Image, X, AlertCircle, Paperclip } from 'lucide-react';
import { MediaFile } from '../type.inbox';
import Button from '../../../components/BasicComponents/Button';

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  isConnected: boolean;
  disabled: boolean;
  selectedImages: MediaFile[];
  isUploading: boolean;
  uploadError: string | null;
  onFileSelect: (files: FileList) => void;
  onRemoveImage: (index: number) => void;
  onClearError: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isTyping: boolean;
  language: any;
}

const ImagePreview: React.FC<{
  images: MediaFile[];
  onRemove: (index: number) => void;
  onViewFull?: (image: MediaFile, index: number) => void;
}> = ({ images, onRemove, onViewFull }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <img
            src={image.url}
            alt={image.name}
            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onViewFull?.(image, index)}
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
            {image.name?.substring(0, 8)}...
          </div>
          {/* File size indicator */}
          {image.size && (
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-br opacity-0 group-hover:opacity-100 transition-opacity">
              {(image.size / 1024 / 1024).toFixed(1)}MB
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  isConnected,
  disabled,
  selectedImages,
  isUploading,
  uploadError,
  onFileSelect,
  onRemoveImage,
  onClearError,
  fileInputRef,
  isTyping,
  language
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
      // Reset input value to allow selecting the same files again
      e.target.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
    
    if (files.length > 0) {
      const fileList = new DataTransfer();
      files.forEach(file => fileList.items.add(file));
      onFileSelect(fileList.files);
    }
  };

  const hasContent = newMessage.trim() || selectedImages.length > 0;

  const getConnectionStatusText = () => {
    if (!isConnected) return language?.messageInput?.notConnected || 'Not connected';
    if (isUploading) return language?.messageInput?.uploading || 'Uploading images...';
    if (disabled) return language?.messageInput?.sending || 'Sending...';
    return language?.messageInput?.send || 'Send message';
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Error display */}
      {uploadError && (
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-red-700 whitespace-pre-wrap">{uploadError}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image preview */}
      {selectedImages.length > 0 && (
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => selectedImages.forEach((_, index) => onRemoveImage(index))}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear all
            </button>
          </div>
          <ImagePreview
            images={selectedImages}
            onRemove={onRemoveImage}
            onViewFull={(image, index) => {
              console.log('View image:', image, index);
            }}
          />
        </div>
      )}

      {/* Message input area */}
      <div className="p-4">
        <div className="flex justify-center items-center gap-3">
          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Attachment button */}
          <button
            onClick={() => fileInputRef?.current?.click()}
            disabled={!isConnected || isUploading || disabled}
            className="p-3 mb-1 text-gray-500 bg-red-100 hover:text-cb-red hover:bg-cb-red/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={language?.messageInput?.attachImages || 'Attach images'}
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {/* Message input container */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              placeholder={language?.messageInput?.placeholder || 'Type a message to customer...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cb-red focus:border-transparent resize-none max-h-32 min-h-[48px] transition-all"
              disabled={!isConnected || disabled}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '48px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            
            {/* Character count */}
            {newMessage.length > 900 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {newMessage.length}/1000
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={onSendMessage}
            disabled={!hasContent || !isConnected || disabled || isUploading}
            variant="solid"
            size="md"
            className="px-6 py-3 flex-shrink-0 mb-1 rounded-xl"
            theme={['cb-red', 'white']}
            title={getConnectionStatusText()}
          >
            {(disabled || isUploading) ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Status indicators */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{language?.messageInput?.pressEnter || 'Press Enter to send'}</span>
            {!isConnected && (
              <div className="flex items-center gap-1 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Offline</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isUploading && (
              <div className="flex items-center gap-2 text-cb-red">
                <div className="w-3 h-3 border-2 border-cb-red border-t-transparent rounded-full animate-spin" />
                <span>{language?.messageInput?.uploading || 'Uploading images...'}</span>
              </div>
            )}
            {selectedImages.length > 0 && !isUploading && (
              <span className="text-blue-600">
                {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} ready
              </span>
            )}
          </div>
        </div>

        {/* Connection status bar */}
        {!isConnected && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Connection lost. Messages will be sent when reconnected.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
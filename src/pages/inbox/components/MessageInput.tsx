import React from 'react';
import { Send, Image, X, AlertCircle } from 'lucide-react';
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
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
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
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
            {image.name?.substring(0, 8)}...
          </div>
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const hasContent = newMessage.trim() || selectedImages.length > 0;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Error display */}
      {uploadError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{uploadError}</span>
          <button
            onClick={onClearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image preview */}
      {selectedImages.length > 0 && (
        <div className="mb-3">
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
      <div className="flex items-end space-x-3">
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
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={language.messageInput.attachImages}
        >
          <Image className="w-5 h-5" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language.messageInput.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cb-red focus:border-transparent resize-none max-h-32 min-h-[40px]"
            disabled={!isConnected || disabled}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '40px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={onSendMessage}
          disabled={!hasContent || !isConnected || disabled || isUploading}
          variant="solid"
          size="md"
          className="px-4 py-2"
          theme={['cb-red', 'white']}
          title={
            !isConnected ? language.messageInput.notConnected : 
            isUploading ? language.messageInput.uploading :
            disabled ? language.messageInput.sending :
            language.messageInput.send
          }
        >
          {(disabled || isUploading) ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Status indicators */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{language.messageInput.pressEnter}</span>
        <div className="flex items-center space-x-4">
          {isUploading && (
            <div className="flex items-center space-x-2 text-cb-red">
              <div className="w-3 h-3 border-2 border-cb-red border-t-transparent rounded-full animate-spin" />
              <span>{language.messageInput.uploading}</span>
            </div>
          )}
          {isTyping && (
            <span className="text-cb-red">{language.chatList.typing}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { MediaFile } from '../type.inbox';

interface ImageModalProps {
  isOpen: boolean;
  images: MediaFile[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev
}) => {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${MEDIA_URL}/${currentImage.url}`;
    link.download = currentImage.name || 'image';
    link.click();
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative max-w-screen-lg max-h-screen-lg p-4 w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={`${MEDIA_URL}/${currentImage.url}`}
          alt={currentImage.name}
          className="max-w-full max-h-full object-contain"
        />

        {/* Image info */}
        <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-3 rounded-lg">
          <p className="text-sm font-medium">{currentImage.name}</p>
          {currentImage.size && (
            <p className="text-xs opacity-75">
              {(currentImage.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          {images.length > 1 && (
            <p className="text-xs opacity-75">
              {currentIndex + 1} of {images.length}
            </p>
          )}
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="absolute bottom-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;
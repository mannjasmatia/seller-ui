import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { MediaFile } from '../type.inbox';
import { useDownloadMediaApi } from '../../../api/api-hooks/useChatApi';
import { customToast } from '../../../toast-config/customToast';

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
    
    const { mutate: downloadMedia } = useDownloadMediaApi();
    const modalRef = useRef<HTMLDivElement>(null);

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

  const currentImage = images[currentIndex];

    useEffect(() => {
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [isOpen]);


    const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
    }
    };


    const handleDownload = () => {
        downloadMedia(currentImage.url, {
            onSuccess: (response: import('axios').AxiosResponse<Blob>) => {
                const url = window.URL.createObjectURL(response.data);
                const link = document.createElement('a');
                link.href = url;
                link.download = currentImage.name || 'image';
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            },
            onError: (err) => {
                customToast.error("Failed to download image :")
            // Optionally show a toast or error
            }
    });
    };

    if (!isOpen || !images || images.length === 0) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-transparent  bg-opacity-40 z-50 flex items-center justify-center">
      <div ref={modalRef} className="relative max-w-screen-lg backdrop-blur-2xl max-h-[80dvh] p-4 w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 text-white bg-cb-red hover:text-gray-300 z-10 bg-opacity-50 rounded-full p-2"
        >
          <X className="w-9 h-9" />
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
          src={!currentImage.url.includes('http') ? `${MEDIA_URL}/${currentImage.url}` : currentImage.url}
          alt={currentImage.name}
          className="max-w-full max-h-full object-contain"
        />

        {/* Image info */}
        {/* <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-3 rounded-lg">
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
        </div> */}

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="absolute flex gap-1 justify-center items-center bottom-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
        >
          <Download className="w-5 h-5" />
          <span className="font-semibold text-white">Download</span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;
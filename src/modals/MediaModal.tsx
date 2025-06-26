import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { FileType, MediaFile, ThemeColors } from '../components/BasicComponents/types';
import { RootState } from '../store/appStore';
import Button from '../components/BasicComponents/Button';

/**
 * MediaModal props interface
 */
export interface MediaModalProps {
  /** Whether the modal is open */
  open: boolean;
  
  /** Function called when the modal is closed */
  onClose: () => void;
  
  /** Type of file to display */
  type?: FileType;
  
  /** Source URL of the file */
  src?: string;
  
  /** Multiple media files to display in a carousel */
  files?: MediaFile[];
  
  /** Title for the modal */
  title?: string;
  
  /** Alternative text for images */
  alt?: string;
  
  /** Height of the media container */
  height?: number | string;
  
  /** Width of the media container */
  width?: number | string;
  
  /** Show download button */
  download?: boolean;
  
  /** Custom download button text */
  downloadText?: string;
  
  /** Custom class name for the modal */
  className?: string;
  
  /** Theme colors [primary, secondary] */
  theme?: ThemeColors;
  
  /** Object fit property for images */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  
  /** Animation for modal */
  animation?: 'fade' | 'scale' | 'slide' | 'none';
  
  /** Close modal when clicking outside */
  closeOnClickOutside?: boolean;
  
  /** Close modal when pressing Escape key */
  closeOnEscape?: boolean;
  
  /** Media URLs to display in a carousel */
  mediaUrls?: string[];
  
  /** Initial index of the carousel */
  initialIndex?: number;
}

/**
 * A modal component for displaying media files (images, PDFs, videos)
 * 
 * @example
 * // Basic image display
 * <MediaModal
 *   open={isModalOpen}
 *   src="https://example.com/image.jpg"
 *   type="image"
 *   onClose={() => setIsModalOpen(false)}
 * />
 * 
 * @example
 * // Carousel of images
 * <MediaModal
 *   open={isModalOpen}
 *   files={[
 *     { src: "https://example.com/image1.jpg", type: "image", alt: "Image 1" },
 *     { src: "https://example.com/image2.jpg", type: "image", alt: "Image 2" }
 *   ]}
 *   onClose={() => setIsModalOpen(false)}
 *   download={true}
 * />
 * 
 * @example
 * // PDF display
 * <MediaModal
 *   open={isModalOpen}
 *   src="https://example.com/document.pdf"
 *   type="pdf"
 *   height="80vh"
 *   onClose={() => setIsModalOpen(false)}
 *   download={true}
 * />
 */
export const MediaModal: React.FC<MediaModalProps> = ({
  open,
  onClose,
  type = 'image',
  src = '',
  files = [],
  title = '',
  alt = '',
  height = 'auto',
  width = 'auto',
  download = false,
  downloadText = 'Download',
  className = '',
  theme = ['cb-red', 'white'],
  objectFit = 'contain',
  animation = 'fade',
  closeOnClickOutside = true,
  closeOnEscape = true,
  initialIndex = 0,
}) => {
  const language = useSelector((state: RootState) => state.language?.value)['mediaModal'];
  const [isOpen, setIsOpen] = useState(open);
  const [modalElement, setModalElement] = useState<HTMLElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Process files and src to create a consolidated files array
  const processedFiles = files.length > 0 ? files : (src ? [{ src, type, alt, title }] : []);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Create portal element on mount
  useEffect(() => {
    const element = document.createElement('div');
    element.id = 'media-modal-root';
    document.body.appendChild(element);
    setModalElement(element);
    
    return () => {
      document.body.removeChild(element);
    };
  }, []);
  
  // Sync open state with prop
  useEffect(() => {
    setIsOpen(open);
    
    // Reset carousel index when opening
    if (open) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Clean up on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, initialIndex]);
  
  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen) {
        if (event.key === 'Escape' && closeOnEscape) {
          handleClose();
        } else if (event.key === 'ArrowLeft' && processedFiles.length > 1) {
          handlePrevious();
        } else if (event.key === 'ArrowRight' && processedFiles.length > 1) {
          handleNext();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEscape, isOpen, processedFiles.length, currentIndex]);
  
  // Handle outside click
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };
  
  // Handle close action
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  // Handle download action
  const handleDownload = () => {
    const currentFile = processedFiles[currentIndex];
    if (!currentFile?.src) return;
    
    const link = document.createElement('a');
    link.href = currentFile.src;
    
    // Extract filename from URL
    const filename = currentFile.src.split('/').pop() || 'download';
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle carousel navigation
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? processedFiles.length - 1 : prev - 1));
    setIsLoading(true);
    setHasError(false);
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === processedFiles.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
    setHasError(false);
  };
  
  // Get current file to display
  const currentFile = processedFiles[currentIndex] || { src: '', type: 'image' as FileType, alt: '' };
  const currentType = currentFile.type || type;
  
  // Determine dimensions
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  
  // Animation classes
  const animationClasses = {
    none: '',
    fade: 'animate-fade-in',
    scale: 'animate-scale-in',
    slide: 'animate-slide-in',
  }[animation];
  
  // Do not render if modal is not open or portal element doesn't exist
  if (!isOpen || !modalElement || processedFiles.length === 0) {
    return null;
  }
  
  // Render media based on type
  const renderMedia = () => {
    switch (currentType) {
      case 'image':
        return (
          <div className="flex items-center justify-center w-full h-full overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {language.loading}
              </div>
            )}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {language.error}
              </div>
            )}
            <img
              src={currentFile.src}
              alt={currentFile.alt || alt}
              className={`
                transition-all duration-300
                ${isLoading ? 'opacity-0' : 'opacity-100'}
              `}
              style={{ 
                objectFit, 
                maxHeight: '100%', 
                maxWidth: '100%' 
              }}
              onLoad={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>
        );
        
      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={`${currentFile.src}#view=FitH`}
              title={currentFile.title || title || 'PDF Document'}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        );
        
      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <video
              src={currentFile.src}
              controls
              autoPlay
              className="max-w-full max-h-full"
              style={{ objectFit }}
            />
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center p-8 text-gray-500">
            Unsupported file type
          </div>
        );
    }
  };
  
  // Modal content
  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`
          relative bg-white rounded-lg shadow-xl overflow-hidden
          ${animationClasses}
          ${className}
        `}
        style={{ 
          width: widthStyle,
          maxWidth: '95vw',
          maxHeight: '95vh',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute top-1 right-2 z-40 p-2 rounded-full bg-cb-red/50 text-gray-800 hover:bg-white hover:text-gray-900 focus:outline-none transition-all duration-200"
          onClick={handleClose}
          aria-label={language.close}
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Title */}
        {(currentFile.title || title) && (
          <div className="px-4 py-2 bg-white/30 absolute top-0 left-0 right-0 z-10">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {currentFile.title || title}
            </h3>
          </div>
        )}
        
        {/* Media content */}
        <div
          className="relative overflow-auto"
          style={{ 
            height: heightStyle,
            width: widthStyle 
          }}
        >
          {renderMedia()}
        </div>
        
        {/* Footer with controls */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          {/* Carousel controls */}
          {processedFiles.length > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                ariaLabel={language.previous}
                leftIcon={
                  <ChevronLeft className="w-5 h-5" />
                }
              >
                Prev
              </Button>
              
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {processedFiles.length}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                ariaLabel={language.next}
                rightIcon={
                  <ChevronRight className="w-5 h-5" />
                }
              >
                Next
              </Button>
            </div>
          )}
          
          {/* Download button */}
          {download && (
            <Button
              variant="solid"
              size="sm"
              onClick={handleDownload}
              theme={theme}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              {downloadText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
  
  // Render modal via portal
  return createPortal(modalContent, modalElement);
};

export default MediaModal;
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from "react-redux";
import { AnimationType, ThemeColors } from '../components/BasicComponents/types';
import { RootState } from '../store/appStore';
import Button from '../components/BasicComponents/Button';

/**
 * ConfirmationModal props interface
 */
export interface ConfirmationModalProps {
  /** Whether the modal is open */
  open: boolean;
  
  /** Modal title */
  title?: string;
  
  /** Modal description */
  description: string; 
  
  /** Confirm button text */
  confirmButtonText?: string;
  
  /** Cancel button text */
  cancelButtonText?: string;

  /** Cancel button text */
  showCancelButton?: boolean;
  
  /** Function called when the modal is closed without confirmation */
  onClose: () => void;
  
  /** Function called when the modal is confirmed */
  onConfirm: (data?: any, reason?: string) => void;
  
  /** Data to pass to onConfirm function */
  data?: any;
  
  /** Custom class name for the modal */
  className?: string;
  
  /** Custom class name for the confirm button */
  confirmButtonClassName?: string;
  
  /** Custom class name for the cancel button */
  cancelButtonClassName?: string;
  
  /** Theme colors [primary, secondary] */
  theme?: ThemeColors;
  
  /** Whether to show the reason textarea */
  reason?: boolean;
  
  /** Placeholder for the reason textarea */
  reasonPlaceholder?: string;
  
  /** Required reason */
  reasonRequired?: boolean;
  
  /** Close modal when clicking outside */
  closeOnClickOutside?: boolean;
  
  /** Close modal when pressing Escape key */
  closeOnEscape?: boolean;
  
  /** Animation type */
  animation?: AnimationType;
  
  /** Modal width (sm, md, lg, xl, 2xl, full) */
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  /** Is the confirm button in a loading state */
  isLoading?: boolean;
  
  /** Is the confirm button disabled */
  isDisabled?: boolean;
  
  /** Is the modal centered vertically */
  centered?: boolean;
}

/**
 * A dynamic confirmation modal component
 * 
 * @example
 * // Basic usage
 * <ConfirmationModal
 *   open={isModalOpen}
 *   title="Confirm Delete"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   onClose={() => setIsModalOpen(false)}
 *   onConfirm={() => handleDelete()}
 * />
 * 
 * @example
 * // With reason field
 * <ConfirmationModal
 *   open={isModalOpen}
 *   title="Reject Application"
 *   description="Please provide a reason for rejecting this application."
 *   confirmButtonText="Reject"
 *   reason={true}
 *   reasonRequired={true}
 *   onClose={() => setIsModalOpen(false)}
 *   onConfirm={(data, reason) => handleReject(data, reason)}
 * />
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  title,
  description,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  showCancelButton=true,
  onClose,
  onConfirm,
  data,
  className = '',
  confirmButtonClassName = '',
  cancelButtonClassName = '',
  theme = ['cb-red', 'white'],
  reason = false,
  reasonPlaceholder = 'Please provide a reason...',
  reasonRequired = false,
  closeOnClickOutside = true,
  closeOnEscape = true,
  animation = 'scale',
  width = 'md',
  isLoading = false,
  isDisabled = false,
  centered = true,
}) => {
  const language = useSelector((state: RootState) => state.language?.value)['confirmationModal'];

  // State for managing the modal and reason
  const [isOpen, setIsOpen] = useState(open);
  const [reasonText, setReasonText] = useState('');
  const [modalElement, setModalElement] = useState<HTMLElement | null>(null);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  
  // Create portal element on mount
  useEffect(() => {
    const element = document.createElement('div');
    element.id = 'confirmation-modal-root';
    document.body.appendChild(element);
    setModalElement(element);
    
    return () => {
      document.body.removeChild(element);
    };
  }, []);
  
  // Sync open state with prop
  useEffect(() => {
    setIsOpen(open);
    
    // Disable body scroll when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Clean up on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEscape, isOpen]);
  
  // Focus reason textarea when modal opens
  useEffect(() => {
    if (isOpen && reason && reasonRef.current) {
      setTimeout(() => {
        reasonRef.current?.focus();
      }, 100);
    }
  }, [isOpen, reason]);
  
  // Reset reason text when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReasonText('');
    }
  }, [isOpen]);
  
  // Handle outside click
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };
  
  // Handle close action
  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
    onClose();
  };
  
  // Handle confirm action
  const handleConfirm = () => {
    if (isLoading || isDisabled) return;
    if (reason && reasonRequired && !reasonText.trim()) {
      if (reasonRef.current) {
        reasonRef.current.focus();
      }
      return;
    }
    onConfirm(data, reason ? reasonText : undefined);
  };
  
  // Determine modal width class
  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }[width];
  
  // Animation classes
  const animationClasses = {
    none: '',
    fade: 'animate-fade-in',
    scale: 'animate-scale-in',
    slide: 'animate-slide-in',
    bounce: 'animate-bounce-in',
  }[animation];
  
  // Do not render if modal is not open or portal element doesn't exist
  if (!isOpen || !modalElement) {
    return null;
  }
  
  // Modal content
  const modalContent = (
    <div 
      className="fixed inset-0 z-110 flex items-center justify-center overflow-y-auto bg-transparent/50 backdrop-blur-sm transition-opacity"
      onClick={handleOutsideClick}
      aria-labelledby="modal-title"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`
          relative w-full p-4 ${widthClass}
          ${centered ? 'mt-16 sm:mt-32' : 'mt-16'}
        `}
      >
        <div 
          ref={modalRef}
          className={`
            relative overflow-hidden rounded-lg bg-white shadow-xl 
            ${animationClasses}
            ${className}
          `}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title || language.title}
            </h3>
          </div>
          
          {/* Body */}
          <div className="px-6 py-4">
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {description}
              </p>
            </div>
            
            {reason && (
              <div className="mt-4">
                <textarea
                  ref={reasonRef}
                  className={`
                    w-full rounded-md border border-gray-300 px-3 py-2 
                    placeholder-gray-400 shadow-sm focus:border-${theme[0]} focus:outline-none focus:ring-2 focus:ring-${theme[0]}/50
                    resize-none
                  `}
                  rows={4}
                  placeholder={reasonPlaceholder}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  disabled={isLoading}
                  required={reasonRequired}
                />
                {reasonRequired && (
                  <p className="mt-1 text-xs text-gray-500">This field is required</p>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-2 border-t border-gray-200">
            <Button
              variant="solid"
              size="md"
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={isDisabled || (reason && reasonRequired && !reasonText.trim())}
              theme={theme}
              className={confirmButtonClassName}
            >
              {confirmButtonText || language.confirm}
            </Button>
            
            {showCancelButton && 
            <Button
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isLoading}
              className={cancelButtonClassName}
            >
              {cancelButtonText || language.cancel}
            </Button>
            }

          </div>
        </div>
      </div>
    </div>
  );
  
  // Render modal via portal
  return createPortal(modalContent, modalElement);
};

export default ConfirmationModal;
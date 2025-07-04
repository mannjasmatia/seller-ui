import React, { JSX, useEffect, useState } from 'react';
import { SlantToastProps, ToastType } from './toast';

const SlantToast: React.FC<SlantToastProps> = ({ message, type = 'success', onClose }) => {
  const [visible, setVisible] = useState<boolean>(false);
  
  // Two-step animation: first mount, then show
  useEffect(() => {
    // Small delay to allow the DOM to render before starting the animation
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 50);
    
    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 3000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, []);
  
  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onClose(), 300); // Allow animation to complete before removing
  };
  
  const iconMap: Record<ToastType, JSX.Element> = {
    success: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  };

  // Map for toast background colors
  const bgColorMap: Record<ToastType, string> = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50'
  };
  
  return (
    <div 
      className={`transform transition-all duration-300 ease-in-out z-50 w-full max-w-xs sm:max-w-sm md:w-80
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="w-full">
        {/* Slant container with clip-path */}
        <div 
          className={`${bgColorMap[type]} rounded-l-md shadow-md overflow-hidden`} 
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)',
            position: 'relative'
          }}
        >
          {/* Red accent line */}
          <div 
            className="absolute top-0 right-0 h-full w-1 bg-red-500" 
            style={{ zIndex: 1 }}
          ></div>
          
          <div className="flex items-center p-2 pl-3 relative">
            {/* Content */}
            <div className="w-full flex justify-between items-center min-w-0 relative z-10">
              {/* Icon container with red background */}
              <div className='flex gap-2 items-center flex-1 min-w-0'>
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-sm">
                  {iconMap[type]}
                </div>
                
                {/* Message */}
                <div className="ml-2 font-medium text-gray-800 text-sm break-words">
                  {message}
                </div>
              </div>
              
              {/* Close button */}
              <button 
                onClick={handleDismiss}
                className="ml-2 text-gray-400 hover:text-gray-900 transition-colors duration-300 flex-shrink-0"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlantToast;
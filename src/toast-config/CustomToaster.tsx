import React, { useEffect, useState } from "react";
import SlantToast from "./SlantToast";
import { Toast } from "./toast";
import { customToast } from "./customToast";

const MAX_TOASTS = 3;

// Custom Toaster component to replace react-hot-toast
const CustomToaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check for mobile devices and window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    handleResize();
    
    // Add listener for window resize
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // using customToast utility to register the add and remove functions
  // This allows other parts of the app to use customToast.success, customToast.error, etc.
  useEffect(() => {
    // Register the functions to the toast utility
    customToast.register(addToast, removeToast);

    return () => {
      customToast.register(() => {}, () => {}); // reset on unmount
    };
  }, []);
  
  // Helper function to add toast with MAX_TOASTS limit
  const addToast = (newToast: Toast): void => {
    setToasts(currentToasts => {
      // If already at max, remove the oldest toast
      if (currentToasts.length >= MAX_TOASTS) {
        return [...currentToasts.slice(1), newToast];
      }
      // Otherwise add the new toast
      return [...currentToasts, newToast];
    });
  };

  const removeToast = (id: string): void => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Determine positioning based on screen size
  const toasterPositionClass = isMobile 
    ? "fixed top-4 left-4 right-4 z-100 flex flex-col items-center space-y-2" 
    : "fixed top-4 right-4 z-100 flex flex-col items-end space-y-3";
  
  return (
    <div className={toasterPositionClass}>
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          className="toast-container w-full max-w-xs sm:max-w-sm md:max-w-md"
          style={{ 
            position: 'relative',
          }}
        >
          <SlantToast
            message={toast.message}
            type={toast.type}
            onClose={() => {
              customToast.remove(toast.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default CustomToaster;
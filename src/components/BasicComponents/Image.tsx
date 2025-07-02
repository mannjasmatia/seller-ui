import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface ImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  lazyLoad?: boolean;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  overlay?: React.ReactNode;
  blurhash?: string;
  zoomable?: boolean;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
  caption?: string;
  placeholder?: string;
}

const DynamicImage: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  objectFit = 'cover',
  rounded = false,
  lazyLoad = true,
  fallbackSrc = '/fallback-image.png',
  loading = 'lazy',
  overlay,
  zoomable = false,
  aspectRatio,
  onLoad,
  onError,
  onClick,
  caption,
  placeholder = '/api/placeholder/400/320',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    
    // Create a new Image object to preload and check if the image can load
    const img = new Image();
    img.src = src;
    
    // Start with placeholder
    setCurrentSrc(placeholder);
    
    img.onload = () => {
      setIsLoading(false);
      setCurrentSrc(src);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setIsError(true);
      setCurrentSrc(fallbackSrc);
      if (onError) onError();
    };
    
    return () => {
      // Cleanup to prevent memory leaks
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder, fallbackSrc, onLoad, onError]);

  // These handlers are now only used for the visible image element in the DOM
  // and for manual retry functionality, not for the initial load detection
  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    // Only handle errors for retries - initial load errors are handled in useEffect
    if (!isLoading) {
      setIsError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setIsError(false);
    setCurrentSrc(placeholder);
    setRetryCount(retryCount + 1);
    
    // Create a new Image object to preload and check if the image can load on retry
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoading(false);
      setIsError(false);
      setCurrentSrc(src);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setIsError(true);
      setCurrentSrc(fallbackSrc);
      if (onError) onError();
    };
  };

  const toggleZoom = () => {
    if (zoomable) {
      setIsZoomed(!isZoomed);
    }
  };

  // Determine rounded class
  let roundedClass = '';
  if (rounded === true) {
    roundedClass = 'rounded-md';
  } else if (rounded === 'sm') {
    roundedClass = 'rounded-sm';
  } else if (rounded === 'md') {
    roundedClass = 'rounded-md';
  } else if (rounded === 'lg') {
    roundedClass = 'rounded-lg';
  } else if (rounded === 'full') {
    roundedClass = 'rounded-full';
  }

  // Determine object fit class
  const objectFitClass = `object-${objectFit}`;

  // Apply width and height
  const sizeStyle: React.CSSProperties = {};
  // if (width) {
  //   sizeStyle.width = typeof width === 'number' ? `${width}px` : width;
  // }
  // if (height) {
  //   sizeStyle.height = typeof height === 'number' ? `${height}px` : height;
  // }
  if (aspectRatio) {
    sizeStyle.aspectRatio = aspectRatio;
  }

  // Zoom styles
  const zoomStyle: React.CSSProperties = isZoomed
    ? {
        transform: 'scale(1.5)',
        cursor: 'zoom-out',
        transition: 'transform 0.3s ease',
      }
    : {
        transform: 'scale(1)',
        cursor: zoomable ? 'zoom-in' : 'default',
        transition: 'transform 0.3s ease',
      };

  return (
    <div className="h-full relative" onClick={onClick} ref={containerRef}>
      <div
        className={`h-full relative overflow-hidden ${roundedClass} ${
          aspectRatio ? 'w-full' : ''
        }`}
        style={aspectRatio ? { aspectRatio } : {}}
      >
        <img
          ref={imageRef}
          crossOrigin="anonymous"
          src={currentSrc}
          alt={alt}
          loading={lazyLoad ? loading : undefined}
          onLoad={handleLoad}
          onError={handleError}
          className={`${width} ${height} ${objectFitClass} transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${roundedClass} ${className}`}
          style={{ ...sizeStyle, ...zoomStyle }}
          onClick={toggleZoom}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="absolute h-full inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}

        {/* Error state */}
        {isError && fallbackSrc==="none" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-gray-200 p-2">
            <p className="md:text-xs text-xs text-gray-600 mb-2">Failed to load image</p>
            <button
              onClick={(e:any)=> { e.stopPropagation(); handleRetry?.()}}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white md:px-2 px-1 py-1 rounded-md text-xs md:text-xs"
            >
              <RefreshCw className="md:h-3 md:w-2 h-1 w-1 mr-1" /> Retry
            </button>
          </div>
        )}

        {/* Custom overlay */}
        {overlay && !isLoading && !isError && (
          <div className="absolute inset-0">{overlay}</div>
        )}

        {/* Zoom toggle button */}
        {zoomable && !isLoading && !isError && (
          <button
            onClick={toggleZoom}
            className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full"
          >
            {isZoomed ? (
              <ZoomOut className="h-4 w-4" />
            ) : (
              <ZoomIn className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Caption */}
      {caption && !isLoading && !isError && (
        <p className="text-sm text-gray-600 mt-1">{caption}</p>
      )}
    </div>
  );
};

export default DynamicImage;
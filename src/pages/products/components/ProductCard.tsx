// src/pages/products/components/EnhancedProductCard.tsx
import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Package,
  Verified,
  VerifiedIcon,
  LucideVerified
} from 'lucide-react';
import Button from '../../../components/BasicComponents/Button';
import DynamicImage from '../../../components/BasicComponents/Image';
import { Product } from '../types.products';

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

interface EnhancedProductCardProps {
  product: Product;
  onEdit: () => void;
  onCompleteNow: () => void;
  onClick: () => void;
  onDelete: () => void;
  translations: any;
}

const ProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onEdit,
  onCompleteNow,
  onClick,
  onDelete,
  translations
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusBadge = () => {
    if (product.isComplete) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-green-500 text-white">
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete
        </div>
      );
    } else if (product.completionPercentage >= 70) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-yellow-500 text-white">
          <AlertCircle className="h-4 w-4 mr-2" />
          Nearly Complete
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-red-500 text-white">
          <AlertCircle className="h-4 w-4 mr-2" />
          Incomplete
        </div>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageNavigation = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'next' && currentImageIndex < product.images?.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div 
      className={`group bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-cb-red/50 ${
        isHovered ? 'transform scale-[1.01] shadow-xl' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex">
        {/* Left Image Section - 40% width */}
        <div className="w-2/5 relative bg-gray-50 overflow-hidden">
          {product.images?.length > 0 ? (
            <>
              <div className="relative h-full group-hover:scale-105 transition-transform duration-300">
                <DynamicImage
                  src={`${MEDIA_URL}/${product.images[currentImageIndex]}`}
                  alt={product.name}
                  objectFit="cover"
                  width="w-full"
                  height="h-full"
                  className="transition-all duration-300"
                />
              </div>

              {/* Carousel Controls */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => handleImageNavigation('prev', e)}
                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white ${
                      currentImageIndex === 0 ? 'cursor-not-allowed opacity-30' : ''
                    }`}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={(e) => handleImageNavigation('next', e)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white ${
                      currentImageIndex === product.images?.length - 1 ? 'cursor-not-allowed opacity-30' : ''
                    }`}
                    disabled={currentImageIndex === product.images?.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleDotClick(index, e)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'bg-white shadow-lg' 
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Image Counter */}
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {currentImageIndex + 1}/{product.images?.length}
                  </div>
                </>
              )}

              {/* Verification Badge */}
              {product.isVerified && (
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1 bg-cb-red flex gap-2 items-center justify-center text-white rounded-lg text-xs font-bold">
                    <VerifiedIcon className="h-5 w-5 " />
                    Verified
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="bg-gray-200 rounded-full p-4 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Content Section - 60% width */}
        <div className="w-3/5 p-5 flex flex-col justify-between">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-cb-red transition-colors duration-300">
                  {product.name}
                </h3>
                
                {/* Status and Verification Row */}
                <div className="flex items-center gap-2 mb-3">
                  {getStatusBadge()}
                  {/* {product.isVerified && (
                      <div className="px-3 py-1 bg-cb-red flex gap-2 items-center justify-center text-white rounded-lg text-xs font-bold">
                        <VerifiedIcon className="h-5 w-5 " />
                        Verified
                      </div>
                  )} */}
                </div>
              </div>

              {/* Progress Circle */}
              {product.completionPercentage!==100 && <div className="flex-shrink-0 relative">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - product.completionPercentage / 100)}`}
                      className={`transition-all duration-500 ${
                        product.completionPercentage >= 80 
                          ? 'text-green-500' 
                          : product.completionPercentage >= 50 
                          ? 'text-yellow-500' 
                          : 'text-red-500'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">
                      {product.completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>}
            </div>

            {/* Product Details in simple grid - NO ICONS */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-gray-500 font-medium">Category:</span>
                <span className="ml-2 font-semibold text-gray-900">{product.categoryName}</span>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">Rating:</span>
                <span className="ml-2 font-semibold text-gray-900">{product.avgRating}</span>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">MOQ:</span>
                <span className="ml-2 font-semibold text-gray-900">{product.moq}</span>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">Delivery:</span>
                <span className="ml-2 font-semibold text-gray-900">{product.deliveryDays} days</span>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">Customizable:</span>
                <span className="ml-2 font-semibold text-gray-900">{product.isCustomizable ? 'Yes' : 'No'}</span>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">Created:</span>
                <span className="ml-2 font-semibold text-gray-900">{formatDate(product.createdAt)}</span>
              </div>
              
              <div className="col-span-2">
                <span className="text-gray-500 font-medium">Price:</span>
                <span className="ml-2 font-semibold text-cb-red">
                  {(product.minPrice > 0 || product.maxPrice > 0) ? (
                    product.minPrice > 0 && product.maxPrice > 0 && product.minPrice !== product.maxPrice 
                      ? `₹${product.minPrice.toLocaleString()} - ₹${product.maxPrice.toLocaleString()}`
                      : product.minPrice > 0 
                      ? `₹${product.minPrice.toLocaleString()}`
                      : product.maxPrice > 0
                      ? `₹${product.maxPrice.toLocaleString()}`
                      : 'Not set'
                  ) : (
                    'Not set'
                  )}
                </span>
              </div>
            </div>

            {/* Incomplete Steps - Show ALL steps */}
            {!product.isComplete && product.incompleteSteps?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-bold">Missing steps:</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.incompleteSteps.map((step, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded border border-yellow-200"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {!product.isComplete ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteNow();
                  }}
                  leftIcon={<Play className="h-4 w-4" />}
                  className=" hover:scale-95 font-semibold"
                >
                  Complete Now
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  leftIcon={<Edit className="h-4 w-4" />}
                  className=" hover:scale-95 px-12 font-semibold"
                >
                  Edit
                </Button>
              )}
            </div>

            <div>
              <Button
                variant="solid"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="hover:scale-95 px-12 font-semibold"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;